const { sortTracks } = require('../public/sort-tracks');

describe('sortTracks', () => {
  const tracks = [
    { title: 'B song', durationMs: 2000 },
    { title: 'A song', durationMs: 1000 }
  ];

  test('sorts by title by default', () => {
    const sorted = sortTracks(tracks);
    expect(sorted.map(t => t.title)).toEqual(['A song', 'B song']);
  });

  test('sorts by duration when specified', () => {
    const sorted = sortTracks(tracks, 'duration');
    expect(sorted.map(t => t.durationMs)).toEqual([1000, 2000]);
  });

  test('sorts by plays when specified', () => {
    const sorted = sortTracks(
      [
        { title: 'X', plays: 10 },
        { title: 'Y', plays: 20 }
      ],
      'plays'
    );
    expect(sorted.map(t => t.title)).toEqual(['Y', 'X']);
  });

  test('sorts by latest when specified', () => {
    const sorted = sortTracks(
      [
        { title: 'Old', createdAt: '2020-01-01' },
        { title: 'New', createdAt: '2024-01-01' }
      ],
      'latest'
    );
    expect(sorted.map(t => t.title)).toEqual(['New', 'Old']);
  });

  test('sorts by latest when using created_at field', () => {
    const sorted = sortTracks(
      [
        { title: 'Old', created_at: '2020-01-01' },
        { title: 'New', created_at: '2024-01-01' }
      ],
      'latest'
    );
    expect(sorted.map(t => t.title)).toEqual(['New', 'Old']);
  });
});
