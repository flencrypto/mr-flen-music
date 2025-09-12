(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const { filterByGenre, filterByMonth, listMonths } = factory();
    root.filterByGenre = filterByGenre;
    root.filterByMonth = filterByMonth;
    root.listMonths = listMonths;
  }
})(this, function () {
  function filterByGenre(tracks, genre) {
    if (!Array.isArray(tracks)) return [];
    if (!genre) return tracks.slice();
    const g = genre.toLowerCase();
    return tracks.filter((t) => (t.genre || '').toLowerCase() === g);
  }

  function filterByMonth(tracks, month) {
    if (!Array.isArray(tracks)) return [];
    if (!month) return tracks.slice();
    return tracks.filter((t) => {
      if (!t.createdAt) return false;
      const d = new Date(t.createdAt);
      if (Number.isNaN(d.getTime())) return false;
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return m === month;
    });
  }

  function listMonths(tracks) {
    if (!Array.isArray(tracks)) return [];
    const set = new Set();
    tracks.forEach((t) => {
      if (!t.createdAt) return;
      const d = new Date(t.createdAt);
      if (Number.isNaN(d.getTime())) return;
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      set.add(m);
    });
    return Array.from(set).sort().reverse();
  }

  return { filterByGenre, filterByMonth, listMonths };
});
