document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('[data-public-nav]');
  const toggle = document.querySelector('[data-nav-toggle]');
  if (!nav || !toggle) return;

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menu' : 'Abrir menu');
    document.body.classList.toggle('public-nav-open', open);
  };

  const closeMenu = () => setMenu(false);
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.querySelectorAll('[data-nav-close]').forEach((button) => {
    button.addEventListener('click', closeMenu);
  });

  nav.querySelectorAll('a').forEach((link) => {
    const current = link.getAttribute('href') === window.location.pathname;
    if (link.classList.contains('nav-item') && current) link.classList.add('active');
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeMenu();
  });
});
