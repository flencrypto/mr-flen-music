(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.normalizeTrack = factory().normalizeTrack;
  }
})(this, function () {
  const FALLBACK_ART = 'https://via.placeholder.com/48?text=%F0%9F%8E%B5';

  function normalizeTrack(t = {}) {
    return {
      title: t.title || 'Untitled',
      artist: t.artist || 'Unknown artist',
      durationMs: typeof t.durationMs === 'number' ? t.durationMs : null,
      artwork: t.artwork || FALLBACK_ART,
      ...t
    };
  }

  return { normalizeTrack };
});
