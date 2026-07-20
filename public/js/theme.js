(function () {
  const storageKey = 'theme';
  const root = document.documentElement;
  const saved = localStorage.getItem(storageKey);

  if (saved === 'light' || saved === 'dark') {
    root.setAttribute('data-theme', saved);
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem(storageKey, theme);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('themeSelector');
    if (!selector) return;

    const current = root.getAttribute('data-theme') || 'light';
    selector.value = current === 'dark' ? 'dark' : 'light';
    selector.addEventListener('change', (event) => {
      applyTheme(event.target.value);
    });
  });
})();
