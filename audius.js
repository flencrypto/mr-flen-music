/** @type {{ z: typeof import("zod").z }} */
let zodExports;

/**
 * @param {unknown} candidate
 * @returns {candidate is typeof import("zod").z}
 */
function isZodNamespace(candidate) {
  if (typeof candidate !== "object" || candidate === null) {
    return false;
  }
  const objectFn = Reflect.get(candidate, "object");
  const stringFn = Reflect.get(candidate, "string");
  return typeof objectFn === "function" && typeof stringFn === "function";
}

const nodeRequire = typeof module === "object" && module && module.exports && typeof require === "function"
  ? require
  : null;

if (nodeRequire) {
  zodExports = nodeRequire("zod");
} else {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : window;
  const directZ = /** @type {unknown} */ (Reflect.get(globalScope, "z"));
  const lowercaseZod = /** @type {unknown} */ (Reflect.get(globalScope, "zod"));
  const uppercaseZod = /** @type {unknown} */ (Reflect.get(globalScope, "Zod"));
  /** @type {typeof import("zod").z | null} */
  let resolvedZ = null;

  if (isZodNamespace(directZ)) {
    resolvedZ = directZ;
  } else if (isZodNamespace(lowercaseZod)) {
    resolvedZ = lowercaseZod;
  } else if (typeof uppercaseZod === "object" && uppercaseZod !== null) {
    const nestedZ = /** @type {unknown} */ (Reflect.get(uppercaseZod, "z"));
    if (isZodNamespace(nestedZ)) {
      resolvedZ = nestedZ;
    }
  }

  if (!resolvedZ) {
    throw new Error("Zod library is required to use the Audius helper");
  }

  zodExports = { z: resolvedZ };
}

const { z } = zodExports;

/**
 * @typedef {(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>} FetchLike
 * @typedef {(ms: number) => Promise<void>} SleepFn
 * @typedef {{ retries?: number; timeoutMs?: number; sleep?: SleepFn }} FetchDiscoveryOptions
 * @typedef {{ appName: string; apiKey?: string }} AudiusRequestOptions
 */

const AUDIUS_DISCOVERY_ENDPOINT = "https://api.audius.co";
const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_RETRIES = 2;
const INITIAL_BACKOFF_MS = 250;

const discoveryResponseSchema = z.object({
  data: z.array(z.string().url()),
});

const fetchOptionsSchema = z.object({
  retries: z
    .number()
    .int()
    .min(0)
    .max(5)
    .optional(),
  timeoutMs: z
    .number()
    .int()
    .min(0)
    .max(60000)
    .optional(),
});

const requestOptionsSchema = z.object({
  appName: z.string().trim().min(1, "appName is required"),
  apiKey: z
    .string()
    .trim()
    .min(1)
    .optional(),
});

const hostSchema = z.string().trim().min(1, "host is required");
const trackIdSchema = z.string().trim().min(1, "trackId is required");

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function defaultSleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * @returns {FetchLike}
 */
function getGlobalFetch() {
  if (typeof fetch === "function") {
    return fetch.bind(globalThis);
  }
  throw new Error("Global fetch is not available; provide a fetch implementation.");
}

/**
 * @param {string} rawHost
 * @returns {string}
 */
function normalizeHost(rawHost) {
  const sanitized = hostSchema.parse(rawHost);
  let url;
  try {
    url = new URL(sanitized);
  } catch (error) {
    const err = new Error(`Invalid Audius host: ${sanitized}`);
    Object.assign(err, { cause: error });
    throw err;
  }
  const pathname = url.pathname.replace(/\/+$/, "");
  const base = `${url.origin}${pathname}`;
  return base.endsWith("/") ? base : `${base}/`;
}

/**
 * @param {Response} response
 * @returns {Promise<unknown>}
 */
async function safeJsonParse(response) {
  try {
    return await response.json();
  } catch (error) {
    const err = new Error("Audius discovery response was not valid JSON");
    Object.assign(err, { cause: error });
    throw err;
  }
}

/**
 * @param {number} timeoutMs
 * @returns {{ signal: AbortSignal | undefined; cancel: () => void }}
 */
function buildTimeoutAbort(timeoutMs) {
  if (typeof AbortController !== "function" || timeoutMs <= 0) {
    return { signal: undefined, cancel: () => {} };
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timeoutId),
  };
}

/**
 * @template T
 * @param {Promise<T>} promise
 * @param {RequestInfo | URL} url
 * @param {number} timeoutMs
 * @returns {Promise<T>}
 */
function withManualTimeout(promise, url, timeoutMs) {
  if (timeoutMs <= 0) {
    return promise;
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const timeoutError = new Error(`Request to ${String(url)} timed out after ${timeoutMs}ms`);
      timeoutError.name = "TimeoutError";
      reject(timeoutError);
    }, timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * @param {FetchLike} fetchImpl
 * @param {RequestInfo | URL} url
 * @param {RequestInit | undefined} options
 * @param {number} timeoutMs
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(fetchImpl, url, options, timeoutMs) {
  const opts = { ...(options || {}) };
  const canAbort = typeof AbortController === "function";
  const shouldAbort = canAbort && !opts.signal && timeoutMs > 0;
  const abort = shouldAbort
    ? buildTimeoutAbort(timeoutMs)
    : { signal: opts.signal, cancel: () => {} };
  if (shouldAbort) {
    opts.signal = abort.signal;
  }

  const fetchPromise = fetchImpl(url, opts);
  const awaited = shouldAbort
    ? fetchPromise
    : withManualTimeout(fetchPromise, url, timeoutMs);

  try {
    return await awaited;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      const timeoutError = new Error(`Request to ${String(url)} timed out after ${timeoutMs}ms`);
      timeoutError.name = "TimeoutError";
      Object.assign(timeoutError, { cause: error });
      throw timeoutError;
    }
    throw error;
  } finally {
    abort.cancel();
  }
}

/**
 * @param {FetchLike} [fetchImpl]
 * @param {FetchDiscoveryOptions} [options]
 * @returns {Promise<string[]>}
 */
async function fetchDiscoveryNodes(fetchImpl, options = {}) {
  const validated = fetchOptionsSchema.parse({
    retries: options.retries,
    timeoutMs: options.timeoutMs,
  });
  const retries = validated.retries ?? DEFAULT_RETRIES;
  const timeoutMs = validated.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const sleep = typeof options.sleep === "function" ? options.sleep : defaultSleep;
  const fetchFn = typeof fetchImpl === "function" ? fetchImpl : getGlobalFetch();

  let backoff = INITIAL_BACKOFF_MS;
  /** @type {unknown} */
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop -- retries run sequentially
      const response = await fetchWithTimeout(
        fetchFn,
        AUDIUS_DISCOVERY_ENDPOINT,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
        timeoutMs,
      );
      if (!response || typeof response.ok !== "boolean") {
        throw new Error("Audius discovery request returned an invalid response");
      }
      if (!response.ok) {
        throw new Error(`Audius discovery request failed with status ${response.status}`);
      }
      // eslint-disable-next-line no-await-in-loop -- parse response before deciding on retry
      const payload = await safeJsonParse(response);
      const parsed = discoveryResponseSchema.parse(payload);
      if (!parsed.data.length) {
        throw new Error("Audius discovery returned no hosts");
      }
      return parsed.data;
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        break;
      }
      // eslint-disable-next-line no-await-in-loop -- wait between retries for backoff
      await sleep(backoff);
      backoff *= 2;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error("Failed to fetch Audius discovery nodes");
}

/**
 * @param {string[]} hosts
 * @param {() => number} [randomFn]
 * @returns {string}
 */
function pickAudiusHost(hosts, randomFn = Math.random) {
  const hostList = Array.isArray(hosts) ? hosts : [];
  if (!hostList.length) {
    throw new Error("No Audius discovery hosts available");
  }
  const rand = typeof randomFn === "function" ? randomFn() : Math.random();
  const index = Math.min(hostList.length - 1, Math.floor(rand * hostList.length));
  return hostList[index];
}

/**
 * @param {string} host
 * @param {string} trackId
 * @param {AudiusRequestOptions} options
 * @returns {string}
 */
function buildAudiusTrackUrl(host, trackId, options) {
  const { appName, apiKey } = requestOptionsSchema.parse(options || {});
  const normalizedHost = normalizeHost(host);
  const validTrackId = trackIdSchema.parse(trackId);
  const url = new URL(`v1/tracks/${encodeURIComponent(validTrackId)}`, normalizedHost);
  url.searchParams.set("app_name", appName);
  if (apiKey) {
    url.searchParams.set("api_key", apiKey);
  }
  return url.toString();
}

/**
 * @param {string} host
 * @param {string} trackId
 * @param {AudiusRequestOptions} options
 * @returns {string}
 */
function buildAudiusStreamUrl(host, trackId, options) {
  const { appName, apiKey } = requestOptionsSchema.parse(options || {});
  const normalizedHost = normalizeHost(host);
  const validTrackId = trackIdSchema.parse(trackId);
  const url = new URL(`v1/tracks/${encodeURIComponent(validTrackId)}/stream`, normalizedHost);
  url.searchParams.set("app_name", appName);
  if (apiKey) {
    url.searchParams.set("api_key", apiKey);
  }
  return url.toString();
}

const api = {
  AUDIUS_DISCOVERY_ENDPOINT,
  fetchDiscoveryNodes,
  pickAudiusHost,
  buildAudiusTrackUrl,
  buildAudiusStreamUrl,
};

if (typeof module === "object" && module.exports) {
  module.exports = api;
} else {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : window;
  /** @type {Record<string, unknown>} */
  (globalScope).AudiusAPI = api;
}
