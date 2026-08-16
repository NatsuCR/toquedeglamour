document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('[data-catalog-filter-toggle]');
  const panel = document.querySelector('[data-catalog-filter]');
  if (!toggle || !panel) return;

  const setOpen = (open) => {
    panel.classList.toggle('is-mobile-open', open);
    toggle.classList.toggle('is-active', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('span').textContent = open ? 'Cerrar filtros' : 'Aplicar filtros';
  };

  toggle.addEventListener('click', () => {
    setOpen(!panel.classList.contains('is-mobile-open'));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) setOpen(false);
  });
});
