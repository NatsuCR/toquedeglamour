document.addEventListener('DOMContentLoaded', () => {
  let overlay = null;
  let image = null;
  let previous = null;
  let next = null;
  let gallery = [];
  let currentIndex = 0;
  let touchStartX = null;

  const ensureLightbox = () => {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'image-lightbox';
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="image-lightbox-frame" role="dialog" aria-modal="true">
        <button type="button" class="image-lightbox-close" aria-label="Cerrar imagen">X</button>
        <button type="button" class="image-lightbox-arrow is-prev" aria-label="Imagen anterior">&#8249;</button>
        <img alt="">
        <button type="button" class="image-lightbox-arrow is-next" aria-label="Imagen siguiente">&#8250;</button>
      </div>
    `;
    document.body.appendChild(overlay);
    image = overlay.querySelector('img');
    previous = overlay.querySelector('.image-lightbox-arrow.is-prev');
    next = overlay.querySelector('.image-lightbox-arrow.is-next');
    overlay.querySelector('.image-lightbox-close').addEventListener('click', closeLightbox);
    previous.addEventListener('click', () => showImage(currentIndex - 1));
    next.addEventListener('click', () => showImage(currentIndex + 1));
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeLightbox();
    });
    overlay.addEventListener('touchstart', rememberTouch, { passive: true });
    overlay.addEventListener('touchend', navigateTouch, { passive: true });
  };

  const showImage = (index) => {
    if (index < 0 || index >= gallery.length) return;
    currentIndex = index;
    image.src = gallery[index].src;
    image.alt = gallery[index].alt;
    previous.hidden = gallery.length < 2;
    next.hidden = gallery.length < 2;
    previous.disabled = currentIndex === 0;
    next.disabled = currentIndex === gallery.length - 1;
  };

  const readGallery = (trigger, src, alt) => {
    if (!trigger?.matches('[data-product-main]')) return [{ src, alt }];
    const thumbs = Array.from(document.querySelectorAll('[data-product-thumb]'));
    return thumbs.map((thumb, index) => ({
      src: thumb.dataset.productThumb,
      alt: `${alt} ${index + 1}`
    })).filter((item) => item.src);
  };

  const openLightbox = (src, alt = 'Imagen ampliada', trigger = null) => {
    if (!src) return;
    ensureLightbox();
    gallery = readGallery(trigger, src, alt);
    currentIndex = Math.max(0, gallery.findIndex((item) => item.src === src));
    showImage(currentIndex);
    overlay.hidden = false;
    document.body.classList.add('image-lightbox-open');
    overlay.querySelector('.image-lightbox-close').focus();
  };

  function rememberTouch(event) {
    touchStartX = event.changedTouches[0]?.clientX ?? null;
  }

  function navigateTouch(event) {
    if (touchStartX === null || gallery.length < 2) return;
    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const distance = touchEndX - touchStartX;
    touchStartX = null;
    if (Math.abs(distance) >= 45) showImage(currentIndex + (distance < 0 ? 1 : -1));
  }

  function closeLightbox() {
    if (!overlay) return;
    overlay.hidden = true;
    image.removeAttribute('src');
    gallery = [];
    document.body.classList.remove('image-lightbox-open');
  }

  window.openImageLightbox = openLightbox;

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-lightbox-src]');
    if (!trigger) return;
    event.preventDefault();
    openLightbox(trigger.dataset.lightboxSrc, trigger.dataset.lightboxAlt, trigger);
  });

  document.addEventListener('keydown', (event) => {
    if (!overlay || overlay.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (event.key === 'ArrowRight') showImage(currentIndex + 1);
  });
});
