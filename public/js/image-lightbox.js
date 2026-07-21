document.addEventListener('DOMContentLoaded', () => {
  let overlay = null;
  let image = null;

  const ensureLightbox = () => {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'image-lightbox';
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="image-lightbox-frame" role="dialog" aria-modal="true">
        <button type="button" class="image-lightbox-close" aria-label="Cerrar imagen">X</button>
        <img alt="">
      </div>
    `;
    document.body.appendChild(overlay);
    image = overlay.querySelector('img');
    overlay.querySelector('button').addEventListener('click', closeLightbox);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeLightbox();
    });
  };

  const openLightbox = (src, alt = 'Imagen ampliada') => {
    if (!src) return;
    ensureLightbox();
    image.src = src;
    image.alt = alt;
    overlay.hidden = false;
    document.body.classList.add('image-lightbox-open');
    overlay.querySelector('button').focus();
  };

  function closeLightbox() {
    if (!overlay) return;
    overlay.hidden = true;
    image.removeAttribute('src');
    document.body.classList.remove('image-lightbox-open');
  }

  window.openImageLightbox = openLightbox;

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-lightbox-src]');
    if (!trigger) return;
    event.preventDefault();
    openLightbox(trigger.dataset.lightboxSrc, trigger.dataset.lightboxAlt);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay && !overlay.hidden) closeLightbox();
  });
});
