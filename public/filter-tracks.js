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
  const dateFields = ['createdAt', 'created_at', 'releaseDate', 'release_date'];

  const toDate = (value) => {
    if (!value) return null;
    const d = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const resolveTrackDate = (track) => {
    for (let i = 0; i < dateFields.length; i += 1) {
      const parsed = toDate(track?.[dateFields[i]]);
      if (parsed) return parsed;
    }
    return null;
  };

  const toMonthIndex = (date) => date.getUTCFullYear() * 12 + date.getUTCMonth();

  const formatMonthKey = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const formatMonthFromIndex = (index) => {
    const year = Math.floor(index / 12);
    const month = String((index % 12) + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

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
      const date = resolveTrackDate(t);
      if (!date) return false;
      return formatMonthKey(date) === month;
    });
  }

  function listMonths(tracks) {
    if (!Array.isArray(tracks)) return [];

    const dates = tracks
      .map((track) => resolveTrackDate(track))
      .filter(Boolean)
      .sort((a, b) => a - b);

    if (!dates.length) return [];

    const months = [];
    const firstIndex = toMonthIndex(dates[0]);
    const lastIndex = toMonthIndex(dates[dates.length - 1]);

    for (let idx = firstIndex; idx <= lastIndex; idx += 1) {
      months.push(formatMonthFromIndex(idx));
    }
    return months;
  }

  return { filterByGenre, filterByMonth, listMonths };
});
