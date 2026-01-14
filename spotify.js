if (typeof process === "undefined") {
  // @ts-ignore - polyfill for environments without process
  window.process = { env: {} };
}
const env = (typeof process !== "undefined" && process.env) ? process.env : {};
const clientId = env.SPOTIFY_CLIENT_ID || "";
const clientSecret = env.SPOTIFY_CLIENT_SECRET || "";
if (!clientId || !clientSecret) {
  console.warn("Spotify credentials not configured.");
}

let tokenCache = { token: "", expires: 0 };

const globalScope = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  return undefined;
})();

/**
 * Encodes ASCII credentials to base64 without relying on Buffer/btoa.
 * @param {string} input
 * @returns {string}
 */
function base64EncodeAscii(input) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let output = "";
  let index = 0;
  while (index < input.length) {
    const c1 = input.charCodeAt(index);
    index += 1;
    if (c1 > 0xff) {
      throw new Error("Only ASCII credentials are supported");
    }
    let c2 = Number.NaN;
    if (index < input.length) {
      c2 = input.charCodeAt(index);
      index += 1;
      if (!Number.isNaN(c2) && c2 > 0xff) {
        throw new Error("Only ASCII credentials are supported");
      }
    }
    let c3 = Number.NaN;
    if (index < input.length) {
      c3 = input.charCodeAt(index);
      index += 1;
      if (!Number.isNaN(c3) && c3 > 0xff) {
        throw new Error("Only ASCII credentials are supported");
      }
    }

    /* eslint-disable no-bitwise -- base64 encoding relies on bitwise math */
    const enc1 = c1 >> 2;
    const enc2 = ((c1 & 3) << 4) | (Number.isNaN(c2) ? 0 : (c2 >> 4));
    const enc3 = Number.isNaN(c2)
      ? 64
      : ((c2 & 15) << 2) | (Number.isNaN(c3) ? 0 : (c3 >> 6));
    const enc4 = Number.isNaN(c3) ? 64 : (c3 & 63);
    /* eslint-enable no-bitwise */

    output += chars.charAt(enc1)
      + chars.charAt(enc2)
      + chars.charAt(enc3)
      + chars.charAt(enc4);
  }
  return output;
}

/**
 * @param {string} id
 * @param {string} secret
 * @returns {string}
 */
function encodeClientCredentials(id, secret) {
  const credentials = `${id}:${secret}`;
  if (typeof Buffer !== "undefined" && typeof Buffer.from === "function") {
    return Buffer.from(credentials, "utf-8").toString("base64");
  }
  const btoaFn = globalScope && typeof globalScope.btoa === "function" ? globalScope.btoa : undefined;
  if (btoaFn) {
    return btoaFn(credentials);
  }
  return base64EncodeAscii(credentials);
}

async function getSpotifyToken(fetchImpl = fetch) {
  if (tokenCache.token && Date.now() < tokenCache.expires) {
    return tokenCache.token;
  }
  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify client credentials");
  }
  const creds = encodeClientCredentials(clientId, clientSecret);
  const res = await fetchImpl("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("Failed to obtain Spotify token");
  const data = await res.json();
  tokenCache = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in || 3600) * 1000,
  };
  return tokenCache.token;
}

/**
 * @param {string} query
 * @param {number} [offset]
 * @param {number} [limit]
 * @param {typeof fetch} [fetchImpl]
 */
async function searchSpotify(query, offset = 0, limit = 20, fetchImpl = fetch) {
  const token = await getSpotifyToken(fetchImpl);
  const url = `https://api.spotify.com/v1/search?type=track&limit=${limit}&offset=${offset}&q=${encodeURIComponent(query)}`;
  const res = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Spotify search failed");
  const data = await res.json();
  return data.tracks?.items || [];
}

/**
 * @param {string} id
 * @param {typeof fetch} [fetchImpl]
 */
async function fetchSpotifyTrack(id, fetchImpl = fetch) {
  const token = await getSpotifyToken(fetchImpl);
  const url = `https://api.spotify.com/v1/tracks/${id}`;
  const res = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Spotify track fetch failed");
  const data = await res.json();
  return data;
}

/**
 * @param {any} t
 */
function normalizeSpotifyTrack(t) {
  if (!t || !t.id) return null;
  return {
    platform: "spotify",
    id: t.id,
    title: t.name,
    artwork: t.album?.images?.[0]?.url || "",
    streamUrl: t.preview_url || "",
    user: {
      handle: t.artists?.[0]?.name || "",
      id: t.artists?.[0]?.id || "",
    },
    plays: t.popularity || 0,
    likes: 0,
    genre: t.artists?.[0]?.genres?.[0] || "",
    createdAt: t.album?.release_date || "",
  };
}

const api = {
  getSpotifyToken,
  searchSpotify,
  fetchSpotifyTrack,
  normalizeSpotifyTrack,
};

if (typeof module === "object" && module.exports) {
  module.exports = api;
} else {
  const g = /** @type {any} */ (globalThis);
  g.searchSpotify = api.searchSpotify;
  g.normalizeSpotifyTrack = api.normalizeSpotifyTrack;
  g.fetchSpotifyTrack = api.fetchSpotifyTrack;
}
