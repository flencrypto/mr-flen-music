function filterTracks(tracks, platforms) {
  if (!Array.isArray(platforms) || platforms.length === 0) {
    return tracks;
  }
  return tracks.filter((t) => platforms.includes(t.platform));
}

if (typeof window !== 'undefined') {
  window.filterTracks = filterTracks;
}

if (typeof module !== 'undefined') {
  module.exports = { filterTracks };
}
