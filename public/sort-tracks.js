(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.sortTracks = factory().sortTracks;
  }
})(this, function () {
  function sortTracks(tracks, criterion = 'title') {
    const list = Array.isArray(tracks) ? tracks.slice() : [];
    return list.sort((a, b) => {
      if (criterion === 'duration') {
        return (a.durationMs || 0) - (b.durationMs || 0);
      }
      if (criterion === 'plays') {
        return (b.plays || 0) - (a.plays || 0);
      }
      if (criterion === 'latest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return (a.title || '').localeCompare(b.title || '');
    });
  }
  return { sortTracks };
});
