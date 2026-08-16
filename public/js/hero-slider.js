document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('[data-hero-slider]');
  if (!hero) return;

  const track = hero.querySelector('[data-hero-track]');
  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const prev = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  const zoom = hero.querySelector('[data-hero-zoom]');
  const copy = hero.querySelector('.hero-copy');
  const eyebrow = hero.querySelector('[data-hero-copy-eyebrow]');
  const title = hero.querySelector('[data-hero-copy-title]');
  const text = hero.querySelector('[data-hero-copy-text]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let timer = null;
  let touchStartX = 0;
  let autoplayStopped = false;

  const syncZoom = () => {
    if (!zoom || !slides[index]) return;
    zoom.dataset.lightboxSrc = slides[index].dataset.heroImage || '';
  };

  const syncCopy = () => {
    const slide = slides[index];
    if (!slide) return;
    if (eyebrow) eyebrow.textContent = slide.dataset.heroEyebrow || '';
    if (title) title.textContent = slide.dataset.heroTitle || '';
    if (text) text.textContent = slide.dataset.heroText || '';
    if (copy && !reduceMotion) {
      copy.classList.remove('is-updating');
      window.requestAnimationFrame(() => copy.classList.add('is-updating'));
    }
  };

  const update = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    track.style.setProperty('--hero-index', index);
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
    syncCopy();
    syncZoom();
  };

  const start = () => {
    window.clearInterval(timer);
    if (autoplayStopped || slides.length < 2) return;
    timer = window.setInterval(() => update(index + 1), 10000);
  };

  const stopAutoplay = () => {
    autoplayStopped = true;
    window.clearInterval(timer);
  };

  update(0);
  if (slides.length < 2) return;

  prev?.addEventListener('click', () => {
    stopAutoplay();
    update(index - 1);
  });

  next?.addEventListener('click', () => {
    stopAutoplay();
    update(index + 1);
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      stopAutoplay();
      update(Number(dot.dataset.heroDot || 0));
    });
  });

  hero.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0]?.clientX || 0;
  }, { passive: true });
  hero.addEventListener('touchend', (event) => {
    const endX = event.changedTouches[0]?.clientX || touchStartX;
    const distance = endX - touchStartX;
    if (Math.abs(distance) <= 45) return;
    stopAutoplay();
    update(index + (distance < 0 ? 1 : -1));
  }, { passive: true });
  start();
});
