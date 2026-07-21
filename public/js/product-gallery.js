document.addEventListener('DOMContentLoaded', () => {
  const main = document.querySelector('[data-product-main]');
  const image = document.querySelector('[data-product-main-img]');
  const thumbs = Array.from(document.querySelectorAll('[data-product-thumb]'));
  if (!main || !image || thumbs.length === 0) return;

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const src = thumb.dataset.productThumb;
      if (!src) return;
      image.src = src;
      main.dataset.lightboxSrc = src;
      thumbs.forEach((item) => item.classList.toggle('is-active', item === thumb));
    });
  });
});
