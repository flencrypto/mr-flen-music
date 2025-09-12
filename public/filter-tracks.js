(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.filterByGenre = factory().filterByGenre;
  }
})(this, function () {
  function filterByGenre(tracks, genre) {
    if (!Array.isArray(tracks)) return [];
    if (!genre) return tracks.slice();
    const g = genre.toLowerCase();
    return tracks.filter((t) => (t.genre || '').toLowerCase() === g);
  }
  return { filterByGenre };
});
