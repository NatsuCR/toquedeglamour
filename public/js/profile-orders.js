document.addEventListener('DOMContentLoaded', () => {
  const tools = document.querySelector('[data-order-tools]');
  const list = document.querySelector('[data-order-list]');
  if (!tools || !list) return;
  const cards = [...list.querySelectorAll('[data-order-card]')];
  const buttons = [...tools.querySelectorAll('[data-order-filter]')];
  const search = tools.querySelector('[data-order-search]');
  const empty = document.querySelector('[data-order-empty]');
  let state = 'TODOS';

  function apply() {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const stateMatch = state === 'TODOS' || card.dataset.orderState === state;
      const searchMatch = !query || card.dataset.orderSearch.includes(query);
      card.hidden = !(stateMatch && searchMatch);
      if (!card.hidden) visible += 1;
    });
    empty.hidden = visible !== 0;
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      state = button.dataset.orderFilter;
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
      apply();
    });
  });
  search.addEventListener('input', apply);
  apply();
});
