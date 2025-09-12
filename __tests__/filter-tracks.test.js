const { filterByGenre } = require('../public/filter-tracks');

describe('filterByGenre', () => {
  const tracks = [
    { title: 'A', genre: 'Deep House' },
    { title: 'B', genre: 'House' }
  ];

  test('filters by genre case-insensitively', () => {
    const res = filterByGenre(tracks, 'deep house');
    expect(res).toHaveLength(1);
    expect(res[0].title).toBe('A');
  });

  test('returns copy when no genre specified', () => {
    const res = filterByGenre(tracks);
    expect(res).toHaveLength(2);
    expect(res).not.toBe(tracks);
  });
});
