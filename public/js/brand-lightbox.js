document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.querySelector('[data-brand-lightbox]');
  const image = document.querySelector('[data-brand-lightbox-img]');
  const close = document.querySelector('[data-brand-close]');
  if (!lightbox || !image || !close) return;

  const open = (button) => {
    image.src = button.dataset.brandImage || '';
    image.alt = button.dataset.brandTitle || 'Imagen de colaboracion';
    lightbox.hidden = false;
    document.body.classList.add('brand-lightbox-open');
    close.focus();
  };

  const hide = () => {
    lightbox.hidden = true;
    image.src = '';
    document.body.classList.remove('brand-lightbox-open');
  };

  document.querySelectorAll('[data-brand-image]').forEach((button) => {
    button.addEventListener('click', () => open(button));
  });

  document.querySelectorAll('[data-brand-description-toggle]').forEach((button) => {
    const description = button.previousElementSibling;
    if (!description || description.scrollHeight <= description.clientHeight + 1) {
      button.hidden = true;
      return;
    }

    button.addEventListener('click', () => {
      const expanded = description.classList.toggle('is-expanded');
      button.textContent = expanded ? 'Ver menos' : 'Ver mas';
    });
  });

  close.addEventListener('click', hide);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) hide();
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox.hidden && event.key === 'Escape') hide();
  });
});
