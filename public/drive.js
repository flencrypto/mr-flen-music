(function (global) {
  const FILE_NAME = 'mr-flen-backup.json';
  const TOKEN_KEY = 'gdrive_token';
  let tokenClient;
  let tokenResolve;

  function init(clientId) {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.appdata',
      callback: (res) => {
        const exp = Date.now() + res.expires_in * 1000;
        localStorage.setItem(
          TOKEN_KEY,
          JSON.stringify({ token: res.access_token, exp })
        );
        if (tokenResolve) tokenResolve(res.access_token);
      }
    });
  }

  function getToken() {
    const stored = (() => {
      try {
        return JSON.parse(localStorage.getItem(TOKEN_KEY));
      } catch {
        return null;
      }
    })();
    if (stored && stored.exp > Date.now()) return Promise.resolve(stored.token);
    return new Promise((resolve) => {
      tokenResolve = resolve;
      tokenClient.requestAccessToken({ prompt: stored ? '' : 'consent' });
    });
  }

  async function uploadWithToken(token, data, fetchImpl = fetch) {
    const listRes = await fetchImpl(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${FILE_NAME}'&fields=files(id)`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const list = await listRes.json();
    const metadata = { name: FILE_NAME, parents: ['appDataFolder'] };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id';
    let method = 'POST';
    if (list.files && list.files[0]) {
      url = `https://www.googleapis.com/upload/drive/v3/files/${list.files[0].id}?uploadType=multipart&fields=id`;
      method = 'PATCH';
    }
    await fetchImpl(url, { method, headers: { Authorization: `Bearer ${token}` }, body: form });
  }

  async function downloadWithToken(token, fetchImpl = fetch) {
    const listRes = await fetchImpl(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${FILE_NAME}'&fields=files(id)`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const list = await listRes.json();
    if (!list.files || !list.files[0]) return null;
    const id = list.files[0].id;
    const fileRes = await fetchImpl(
      `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return fileRes.json();
  }

  async function upload(data, fetchImpl = fetch) {
    const token = await getToken();
    return uploadWithToken(token, data, fetchImpl);
  }

  async function download(fetchImpl = fetch) {
    const token = await getToken();
    return downloadWithToken(token, fetchImpl);
  }

  function merge(localData, remoteData) {
    return { ...localData, ...remoteData };
  }

  global.DriveBackup = { init, upload, download, merge };
  if (typeof module !== 'undefined')
    module.exports = { init, upload, download, merge, uploadWithToken, downloadWithToken };
})(typeof window !== 'undefined' ? window : global);
