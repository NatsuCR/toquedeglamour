(() => {
  const initialCount = 5;
  document.querySelectorAll('[data-review-list]').forEach((list) => {
    const cards = [...list.querySelectorAll('[data-review-card]')];
    const section = list.closest('.product-reviews');
    const button = section?.querySelector('[data-review-load-all]');
    if (!button || cards.length <= initialCount) return;

    cards.slice(initialCount).forEach((card) => { card.hidden = true; });
    button.hidden = false;
    button.addEventListener('click', () => {
      cards.forEach((card) => { card.hidden = false; });
      button.setAttribute('aria-expanded', 'true');
      button.hidden = true;
    }, { once: true });
  });
})();
