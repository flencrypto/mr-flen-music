(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SearchPreferences = factory();
  }
})(this, function() {
  const SEARCH_ALL_KEY = 'searchAllArtists';

  function getSearchAll() {
    try {
      const stored = localStorage.getItem(SEARCH_ALL_KEY);
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  }

  function setSearchAll(val) {
    try {
      localStorage.setItem(SEARCH_ALL_KEY, String(val));
    } catch {
      // ignore storage errors
    }
    return val;
  }

  return { SEARCH_ALL_KEY, getSearchAll, setSearchAll };
});
