const { filterTracks } = require('../public/filter');

describe('filterTracks', () => {
  const sample = [
    { id: 1, platform: 'audius' },
    { id: 2, platform: 'soundcloud' },
    { id: 3, platform: 'audius' }
  ];

  test('returns all tracks when no platforms specified', () => {
    expect(filterTracks(sample, [])).toHaveLength(3);
  });

  test('filters by selected platforms', () => {
    const res = filterTracks(sample, ['audius']);
    expect(res).toEqual([
      { id: 1, platform: 'audius' },
      { id: 3, platform: 'audius' }
    ]);
  });
});
