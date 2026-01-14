describe('spotify integration', () => {
  let originalBuffer;
  let originalBtoa;

  beforeEach(() => {
    jest.resetModules();
    process.env.SPOTIFY_CLIENT_ID = 'id';
    process.env.SPOTIFY_CLIENT_SECRET = 'secret';
    originalBuffer = global.Buffer;
    originalBtoa = global.btoa;
  });

  afterEach(() => {
    if (typeof originalBuffer === 'undefined') {
      delete global.Buffer;
    } else {
      global.Buffer = originalBuffer;
    }
    if (typeof originalBtoa === 'undefined') {
      delete global.btoa;
    } else {
      global.btoa = originalBtoa;
    }
  });

  test('searchSpotify retrieves tracks with token', async () => {
    const { searchSpotify, normalizeSpotifyTrack } = require('../spotify');
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'tok', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tracks: {
            items: [
              {
                id: '1',
                name: 'Song',
                preview_url: 'prev',
                popularity: 5,
                album: { images: [{ url: 'art' }], release_date: '2024-01-01' },
                artists: [{ id: 'a1', name: 'Artist', genres: ['hip-hop'] }],
              },
            ],
          },
        }),
      });

    const items = await searchSpotify('test', 0, 20, fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const track = normalizeSpotifyTrack(items[0]);
    expect(track).toEqual(
      expect.objectContaining({
        platform: 'spotify',
        id: '1',
        title: 'Song',
        streamUrl: 'prev',
      }),
    );
  });

  test('getSpotifyToken falls back to btoa when Buffer is unavailable', async () => {
    const nodeBuffer = originalBuffer;
    const expected = nodeBuffer.from('id:secret', 'utf-8').toString('base64');
    global.Buffer = undefined;
    global.btoa = jest.fn((value) => nodeBuffer.from(value, 'binary').toString('base64'));

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'tok', expires_in: 3600 }),
    });

    const { getSpotifyToken } = require('../spotify');

    await getSpotifyToken(fetchMock);

    expect(global.btoa).toHaveBeenCalledWith('id:secret');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://accounts.spotify.com/api/token',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Basic ${expected}`,
        }),
      }),
    );
  });
});
