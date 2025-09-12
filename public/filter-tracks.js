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
    const dates = tracks
      .map((t) => new Date(t.createdAt))
      .filter((d) => !Number.isNaN(d.getTime()))
      .sort((a, b) => a - b);
    if (!dates.length) return [];
    const first = new Date(dates[0].getFullYear(), dates[0].getMonth(), 1);
    const now = new Date();
    const months = [];
    const current = new Date(first);
    while (current <= now) {
      const m = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      months.push(m);
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  }

  return { filterByGenre, filterByMonth, listMonths };
});
