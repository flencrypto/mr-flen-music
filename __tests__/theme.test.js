const { applyTheme, toggleTheme, getSavedTheme } = require('../public/theme');

describe('theme utilities', () => {
  beforeEach(() => {
    document.body.className = '';
    localStorage.clear();
  });

  test('applyTheme sets class and stores preference', () => {
    applyTheme('light');
    expect(document.body.classList.contains('light')).toBe(true);
    expect(localStorage.getItem('themePreference')).toBe('light');
  });

  test('toggleTheme switches between light and dark', () => {
    applyTheme('dark');
    toggleTheme();
    expect(getSavedTheme()).toBe('light');
    toggleTheme();
    expect(getSavedTheme()).toBe('dark');
  });
});
