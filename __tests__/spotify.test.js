process.env.SPOTIFY_CLIENT_ID = 'id';
process.env.SPOTIFY_CLIENT_SECRET = 'secret';
const {
  searchSpotify,
  normalizeSpotifyTrack,
} = require('../spotify');

describe('spotify integration', () => {
  test('searchSpotify retrieves tracks with token', async () => {
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
});
