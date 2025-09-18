// @ts-nocheck

function handleAuthSuccess(provider, token) {
  if (!provider || !token) throw new Error("Missing provider or token");
  localStorage.setItem(`${provider}_token`, token);
  const modal = document.getElementById("login-modal");
  if (modal) modal.classList.add("hidden");
}

async function exchangeCodeForToken(provider, code, fetchImpl = fetch) {
  const endpoints = {
    x: "https://api.twitter.com/2/oauth2/token",
    snapchat: "https://accounts.snapchat.com/accounts/oauth2/token",
    tiktok: "https://open-api.tiktok.com/oauth/access_token",
    google: "https://oauth2.googleapis.com/token",
  };
  const url = endpoints[provider];
  if (!url) throw new Error("Unknown provider");
  let res;
  try {
    res = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `code=${encodeURIComponent(code)}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to exchange code for token: ${message}`);
  }

  if (!res || typeof res.ok !== "boolean") {
    throw new Error("Failed to exchange code for token: Invalid response");
  }

  if (!res.ok) {
    const status = "status" in res ? res.status : "unknown";
    throw new Error(`Failed to exchange code for token: HTTP ${status}`);
  }

  let data;
  try {
    data = await res.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse token response: ${message}`);
  }

  const token = data && typeof data.access_token === "string" ? data.access_token : "";
  if (!token) {
    throw new Error("Token response missing access_token");
  }
  return token;
}

function initGoogleAuth(clientId, callback) {
  if (!clientId || typeof callback !== "function") return false;
  if (!window.google || !window.google.accounts?.id) return false;
  window.google.accounts.id.initialize({ client_id: clientId, callback });
  const btn = document.querySelector(".g_id_signin");
  if (btn) window.google.accounts.id.renderButton(btn, {});
  return true;
}

if (typeof window !== "undefined") {
  window.handleAuthSuccess = handleAuthSuccess;
  window.exchangeCodeForToken = exchangeCodeForToken;
  if (typeof initGoogleAuth === "function") {
    window.initGoogleAuth = initGoogleAuth;
  }
}

if (typeof module !== "undefined") {
  module.exports = { handleAuthSuccess, exchangeCodeForToken, initGoogleAuth };
}
