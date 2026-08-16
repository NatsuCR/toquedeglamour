document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-promotion-banners]').forEach((banner) => {
    const items = [...banner.querySelectorAll('p')];
    if (items.length < 2) return;
    let index = Math.max(0, items.findIndex((item) => item.classList.contains('is-active')));
    let timer;
    const show = (next) => {
      index = next % items.length;
      items.forEach((item, itemIndex) => item.classList.toggle('is-active', itemIndex === index));
    };
    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 4500);
    };
    banner.addEventListener('pointerenter', () => window.clearInterval(timer));
    banner.addEventListener('pointerleave', start);
    banner.addEventListener('focusin', () => window.clearInterval(timer));
    banner.addEventListener('focusout', start);
    start();
  });
});
