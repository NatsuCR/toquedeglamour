document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('[data-hero-slider]');
  if (!hero) return;

  const track = hero.querySelector('[data-hero-track]');
  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const prev = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let timer = null;

  const update = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    track.style.setProperty('--hero-index', index);
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  };

  const start = () => {
    window.clearInterval(timer);
    if (reduceMotion || slides.length < 2) return;
    timer = window.setInterval(() => update(index + 1), 5000);
  };

  const restart = () => {
    start();
  };

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
  start();
});
