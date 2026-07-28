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
    if (reduceMotion || slides.length < 2) return;
    timer = window.setInterval(() => update(index + 1), 5000);
  };

  const restart = () => {
    start();
  };

  update(0);
  if (slides.length < 2) return;

  prev?.addEventListener('click', () => {
    update(index - 1);
    restart();
  });

  next?.addEventListener('click', () => {
    update(index + 1);
    restart();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      update(Number(dot.dataset.heroDot || 0));
      restart();
    });
  });

  hero.addEventListener('mouseenter', () => window.clearInterval(timer));
  hero.addEventListener('mouseleave', start);
  hero.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0]?.clientX || 0;
    window.clearInterval(timer);
  }, { passive: true });
  hero.addEventListener('touchend', (event) => {
    const endX = event.changedTouches[0]?.clientX || touchStartX;
    const distance = endX - touchStartX;
    if (Math.abs(distance) > 45) update(index + (distance < 0 ? 1 : -1));
    start();
  }, { passive: true });
  start();
});
