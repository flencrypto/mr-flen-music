const { safeFetchUserTracks } = require('../public/fetch-user-tracks-safe');

describe('safeFetchUserTracks', () => {
  test('returns tracks when fetch succeeds', async () => {
    const tracks = [{ id: 1 }];
    const fetchFn = jest.fn().mockResolvedValue(tracks);
    const result = await safeFetchUserTracks(fetchFn, 'handle');
    expect(fetchFn).toHaveBeenCalledWith('handle');
    expect(result).toEqual(tracks);
  });

  test('returns empty array and logs error when fetch fails', async () => {
    const error = new Error('network');
    const fetchFn = jest.fn().mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = await safeFetchUserTracks(fetchFn, 'handle');
    expect(fetchFn).toHaveBeenCalledWith('handle');
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
