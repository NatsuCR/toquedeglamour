document.addEventListener('DOMContentLoaded', () => {
  const desktop = window.matchMedia('(min-width: 821px)');
  const flyouts = document.querySelectorAll('.catalog-submenu, .catalog-product-submenu');

  function position(flyout) {
    if (!desktop.matches) return;
    const parent = flyout.parentElement;
    const rect = parent.getBoundingClientRect();
    const width = flyout.offsetWidth || 245;
    const height = Math.min(flyout.scrollHeight || 260, 270);
    let left = rect.right - 1;
    if (left + width > window.innerWidth - 10) left = rect.left - width + 1;
    const top = Math.max(10, Math.min(rect.top - 8, window.innerHeight - height - 10));
    flyout.style.setProperty('--flyout-left', `${left}px`);
    flyout.style.setProperty('--flyout-top', `${top}px`);
  }

  flyouts.forEach((flyout) => {
    const parent = flyout.parentElement;
    parent.addEventListener('pointerenter', () => position(flyout));
    parent.addEventListener('focusin', () => position(flyout));
  });

  window.addEventListener('resize', () => flyouts.forEach(position));
});
