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
});
