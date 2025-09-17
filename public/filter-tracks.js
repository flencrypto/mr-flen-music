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

    const toDate = (value) => {
      if (!value) return null;
      const d = value instanceof Date ? new Date(value.getTime()) : new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const fields = ['createdAt', 'created_at', 'releaseDate', 'release_date'];

    const dates = tracks
      .map((track) => {
        for (let i = 0; i < fields.length; i += 1) {
          const parsed = toDate(track?.[fields[i]]);
          if (parsed) return parsed;
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a - b);

    if (!dates.length) return [];

    const first = new Date(dates[0].getFullYear(), dates[0].getMonth(), 1);
    const last = new Date(dates[dates.length - 1].getFullYear(), dates[dates.length - 1].getMonth(), 1);

    const months = [];
    const current = new Date(first);
    while (current <= last) {
      const m = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      months.push(m);
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  }

  return { filterByGenre, filterByMonth, listMonths };
});
