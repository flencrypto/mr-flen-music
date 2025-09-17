const { filterByGenre, filterByMonth, listMonths } = require('../public/filter-tracks');

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

describe('listMonths', () => {
  const tracks = [
    { createdAt: '2024-02-10' },
    { createdAt: '2024-01-01' },
    { createdAt: '2024-02-20' },
    { createdAt: 'invalid' },
  ];

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-03-01'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('lists months from earliest to latest release month present', () => {
    const months = listMonths(tracks);
    expect(months).toEqual(['2024-01', '2024-02']);
  });

  test('uses track metadata fields instead of current date', () => {
    const extraTracks = [
      { release_date: '2024-01-01' },
      { release_date: '2024-03-15' },
      { created_at: '2024-05-01' },
    ];
    const months = listMonths(extraTracks);
    expect(months).toEqual(['2024-01', '2024-02', '2024-03', '2024-04', '2024-05']);
  });
});
