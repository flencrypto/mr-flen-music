const { filterByGenre, filterByMonth } = require('../public/filter-tracks');

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

describe('filterByMonth', () => {
  const tracks = [
    { title: 'A', createdAt: '2024-05-10' },
    { title: 'B', createdAt: '2024-06-01' }
  ];

  test('filters by YYYY-MM', () => {
    const res = filterByMonth(tracks, '2024-05');
    expect(res).toHaveLength(1);
    expect(res[0].title).toBe('A');
  });

  test('returns copy when no month specified', () => {
    const res = filterByMonth(tracks);
    expect(res).toHaveLength(2);
    expect(res).not.toBe(tracks);
  });
});
