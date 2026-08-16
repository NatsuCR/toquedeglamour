document.addEventListener('DOMContentLoaded', () => {
  const cards = [...document.querySelectorAll('[data-card-images]')];
  cards.forEach((image) => {
    let sources = [];
    try {
      sources = JSON.parse(decodeURIComponent(image.dataset.cardImages || ''));
    } catch {
      sources = [];
    }
    if (sources.length < 2) return;
    let index = Math.max(0, sources.indexOf(image.getAttribute('src')));
    let visible = true;
    const interval = Math.max(1000, Number(image.dataset.cardInterval) || 5000);
    const changeImage = () => {
      if (!visible || document.hidden) return;
      index = (index + 1) % sources.length;
      image.classList.add('is-changing');
      const preload = new Image();
      preload.onload = () => {
        image.src = sources[index];
        image.classList.remove('is-changing');
      };
      preload.src = sources[index];
    };
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
    });
    observer.observe(image);
    window.setInterval(changeImage, interval);
  });
});
