(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.safeFetchUserTracks = factory().safeFetchUserTracks;
  }
})(this, function () {
  async function safeFetchUserTracks(fetchFn, handle) {
    try {
      return await fetchFn(handle);
    } catch (error) {
      console.error('Failed to fetch user tracks', error);
      return [];
    }
  }

  return { safeFetchUserTracks };
});
