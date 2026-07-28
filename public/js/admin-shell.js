document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('[data-admin-sidebar]');
  const toggle = document.querySelector('[data-admin-menu-toggle]');
  const closeButtons = document.querySelectorAll('[data-admin-menu-close]');
  if (!sidebar || !toggle) return;

  const setSidebar = (open) => {
    document.body.classList.toggle('admin-menu-open', open);
    sidebar.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => {
    setSidebar(!document.body.classList.contains('admin-menu-open'));
  });
  closeButtons.forEach((button) => button.addEventListener('click', () => setSidebar(false)));
  sidebar.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setSidebar(false)));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setSidebar(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setSidebar(false);
  });
});
