document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('[data-catalog-grid]');
  const button = document.querySelector('[data-load-more]');
  const count = document.querySelector('[data-catalog-count]');
  const scroller = document.querySelector('.catalog-results');
  if (!grid || !button) return;

  const items = Array.from(grid.querySelectorAll('[data-catalog-item]'));
  const pageSize = Number(grid.dataset.pageSize || 6);
  let visible = Math.min(pageSize, items.length);

  const updateCount = () => {
    if (!count) return;
    count.textContent = `Mostrando ${visible} de ${items.length}`;
  };

  const showItems = (from, to) => {
    items.slice(from, to).forEach((item, index) => {
      item.classList.remove('is-catalog-hidden');
      item.style.setProperty('--catalog-delay', `${index * 45}ms`);
      item.classList.remove('is-catalog-revealed');
      window.requestAnimationFrame(() => item.classList.add('is-catalog-revealed'));
    });
  };

  const scrollToNewBatch = (firstIndex) => {
    const firstNewItem = items[firstIndex];
    if (!firstNewItem || !scroller) return;
    const top = firstNewItem.offsetTop - scroller.offsetTop - 14;
    scroller.scrollTo({ top, behavior: 'smooth' });
  };

  updateCount();
  button.addEventListener('click', () => {
    const previous = visible;
    visible = Math.min(visible + pageSize, items.length);
    showItems(previous, visible);
    updateCount();
    scrollToNewBatch(previous);
    if (visible >= items.length) button.hidden = true;
  });
});
