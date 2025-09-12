(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Theme = factory();
  }
})(this, function () {
  const THEME_KEY = 'themePreference';

  function getSavedTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || 'dark';
    } catch {
      return 'dark';
    }
  }

  function applyTheme(theme) {
    const t = theme || 'dark';
    document.body.classList.toggle('light', t === 'light');
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {
      // ignore storage errors
    }
    return t;
  }

  function toggleTheme() {
    const next = getSavedTheme() === 'dark' ? 'light' : 'dark';
    return applyTheme(next);
  }

  return { applyTheme, toggleTheme, getSavedTheme };
});
