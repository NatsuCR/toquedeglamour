document.addEventListener('DOMContentLoaded', () => {
  const main = document.querySelector('[data-product-main]');
  const image = document.querySelector('[data-product-main-img]');
  const stage = document.querySelector('[data-product-stage]');
  const thumbs = Array.from(document.querySelectorAll('[data-product-thumb]'));
  if (!main || !image || thumbs.length === 0) return;

  const previous = document.querySelector('[data-product-prev]');
  const next = document.querySelector('[data-product-next]');
  let currentIndex = 0;
  let touchStartX = null;

  const selectImage = (index) => {
    if (index < 0 || index >= thumbs.length) return;
    const selected = thumbs[index];
    const src = selected.dataset.productThumb;
    if (!src) return;
    currentIndex = index;
    image.src = src;
    main.dataset.lightboxSrc = src;
    thumbs.forEach((thumb, itemIndex) => {
      thumb.classList.toggle('is-active', itemIndex === currentIndex);
    });
    if (previous) previous.disabled = currentIndex === 0;
    if (next) next.disabled = currentIndex === thumbs.length - 1;
  };

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => selectImage(index));
  });

  previous?.addEventListener('click', () => selectImage(currentIndex - 1));
  next?.addEventListener('click', () => selectImage(currentIndex + 1));

  stage?.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0]?.clientX ?? null;
  }, { passive: true });

  stage?.addEventListener('touchend', (event) => {
    if (touchStartX === null) return;
    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const distance = touchEndX - touchStartX;
    touchStartX = null;
    if (Math.abs(distance) < 45) return;
    selectImage(currentIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });

  selectImage(0);
});
