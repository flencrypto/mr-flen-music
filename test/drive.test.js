const { uploadWithToken, downloadWithToken, merge } = require('../public/drive.js');

test('uploadWithToken creates file when none exists', async () => {
  const calls = [];
  const fetchMock = async (url, opts = {}) => {
    calls.push({ url, opts });
    if (url.startsWith('https://www.googleapis.com/drive/v3/files')) {
      return { json: async () => ({ files: [] }) };
    }
    if (url.startsWith('https://www.googleapis.com/upload/drive/v3/files')) {
      return { json: async () => ({ id: '1' }) };
    }
  };
  await uploadWithToken('token', { a: 1 }, fetchMock);
  expect(calls[0].url.includes('spaces=appDataFolder')).toBe(true);
  expect(calls[1].opts.method).toBe('POST');
});

test('uploadWithToken updates existing file', async () => {
  const calls = [];
  const fetchMock = async (url, opts = {}) => {
    calls.push({ url, opts });
    if (calls.length === 1) {
      return { json: async () => ({ files: [{ id: '1' }] }) };
    }
    return { json: async () => ({ id: '1' }) };
  };
  await uploadWithToken('token', { a: 1 }, fetchMock);
  expect(calls[1].opts.method).toBe('PATCH');
});

test('downloadWithToken returns parsed data', async () => {
  const fetchMock = async (url) => {
    if (url.includes('spaces=appDataFolder')) {
      return { json: async () => ({ files: [{ id: '1' }] }) };
    }
    if (url.includes('alt=media')) {
      return { json: async () => ({ a: 1 }) };
    }
  };
  const data = await downloadWithToken('token', fetchMock);
  expect(data).toEqual({ a: 1 });
});

test('merge prefers remote values', () => {
  const local = { a: 1, b: 2 };
  const remote = { a: 3, c: 4 };
  expect(merge(local, remote)).toEqual({ a: 3, b: 2, c: 4 });
});
