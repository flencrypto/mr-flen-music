const { getSearchAll, setSearchAll, SEARCH_ALL_KEY } = require('../public/search-preferences');

describe('search preferences', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('defaults to true when unset', () => {
    expect(getSearchAll()).toBe(true);
  });

  test('persists toggle state', () => {
    setSearchAll(false);
    expect(localStorage.getItem(SEARCH_ALL_KEY)).toBe('false');
    expect(getSearchAll()).toBe(false);
  });
});
