const DEFAULT_BASE_URL = "https://discoveryprovider.audius.co/v1";
const DEFAULT_TIMEOUT_MS = 5000;

/**
 * @typedef {Object} AudiusHealthResult
 * @property {boolean} ok
 * @property {number|null} status
 * @property {unknown} payload
 * @property {string=} error
 */

/**
 * @param {string} baseUrl
 * @returns {string}
 */
function normaliseBaseUrl(baseUrl) {
  if (!baseUrl || typeof baseUrl !== "string") {
    throw new Error("baseUrl must be a non-empty string");
  }
  return baseUrl.replace(/\/$/, "");
}

/**
 * @param {Object} [options]
 * @param {string} [options.baseUrl]
 * @param {(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>} [options.fetchImpl]
 * @param {number} [options.timeoutMs]
 * @returns {Promise<AudiusHealthResult>}
 */
async function checkAudiusHealth({
  baseUrl = DEFAULT_BASE_URL,
  fetchImpl = (typeof fetch !== "undefined" ? fetch : undefined),
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  if (!fetchImpl) {
    throw new Error("A fetch implementation is required");
  }

  const trimmedBaseUrl = normaliseBaseUrl(baseUrl);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(`${trimmedBaseUrl}/health_check`, {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        payload = null;
      } else {
        throw error;
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        payload,
        error: `Audius health check failed with status ${response.status}`,
      };
    }

    return {
      ok: true,
      status: response.status,
      payload,
    };
  } catch (error) {
    const failure = /** @type {unknown} */ (error);

    if (failure instanceof Error && failure.name === "AbortError") {
      return {
        ok: false,
        status: null,
        payload: null,
        error: "Audius health check timed out",
      };
    }

    return {
      ok: false,
      status: null,
      payload: null,
      error: failure instanceof Error ? failure.message : "Audius health check failed due to an unknown error",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  checkAudiusHealth,
  normaliseBaseUrl,
};
