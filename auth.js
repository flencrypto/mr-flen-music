function handleAuthSuccess(provider, token) {
  if (!provider || !token) throw new Error('Missing provider or token');
  localStorage.setItem(`${provider}_token`, token);
  const modal = document.getElementById('login-modal');
  if (modal) modal.classList.add('hidden');
}

async function exchangeCodeForToken(provider, code, fetchImpl = fetch) {
  const endpoints = {
    x: 'https://api.twitter.com/2/oauth2/token',
    snapchat: 'https://accounts.snapchat.com/accounts/oauth2/token',
    tiktok: 'https://open-api.tiktok.com/oauth/access_token'
  };
  const url = endpoints[provider];
  if (!url) throw new Error('Unknown provider');
  const res = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `code=${encodeURIComponent(code)}`
  });
  const data = await res.json();
  return data.access_token;
}

function initGoogleAuth(
  clientId = typeof window !== 'undefined' ? window.GOOGLE_CLIENT_ID : undefined,
  callback = typeof window !== 'undefined' ? window.onGoogleSignIn : undefined
) {
  const gsi =
    typeof window !== 'undefined' ? window.google?.accounts?.id : undefined;
  if (!gsi || !clientId || typeof callback !== 'function') return false;
  gsi.initialize({ client_id: clientId, callback });
  const container = document.querySelector('.g_id_signin');
  if (container) gsi.renderButton(container, { theme: 'standard', size: 'large' });
  return true;
}

if (typeof window !== 'undefined') {
  window.handleAuthSuccess = handleAuthSuccess;
  window.exchangeCodeForToken = exchangeCodeForToken;
  window.initGoogleAuth = initGoogleAuth;
}

if (typeof module !== 'undefined') {
  module.exports = { handleAuthSuccess, exchangeCodeForToken, initGoogleAuth };
}
