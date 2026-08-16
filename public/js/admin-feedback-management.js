const contentNormalize = (value) => String(value || '').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

function contentListLimit(manager, visibleCards) {
  const list = manager.querySelector('[data-content-list]');
  if (!list) return;
  list.style.maxHeight = '';
  list.classList.toggle('has-internal-scroll', visibleCards.length > 3);
  if (visibleCards.length <= 3) return;
  requestAnimationFrame(() => {
    const firstThree = visibleCards.slice(0, 3);
    const bottom = Math.max(...firstThree.map((card) => card.offsetTop + card.offsetHeight));
    list.style.maxHeight = `${bottom + 4}px`;
  });
}

function syncContentOptions(manager, activeTab) {
  const subcategory = manager.querySelector('[data-card-filter="subcategory"]');
  const product = manager.querySelector('[data-card-filter="product"]');
  if (!subcategory || !product) return;
  [...subcategory.options].forEach((option) => {
    if (!option.value) return;
    const matches = activeTab === 'all' || option.dataset.category === activeTab;
    option.hidden = !matches;
    option.disabled = !matches;
  });
  if (subcategory.selectedOptions[0]?.disabled) subcategory.value = '';
  [...product.options].forEach((option) => {
    if (!option.value) return;
    const categoryMatches = activeTab === 'all' || option.dataset.category === activeTab;
    const subcategoryMatches = !subcategory.value || option.dataset.subcategory === subcategory.value;
    option.hidden = !(categoryMatches && subcategoryMatches);
    option.disabled = !(categoryMatches && subcategoryMatches);
  });
  if (product.selectedOptions[0]?.disabled) product.value = '';
}

function setupContentManager(manager) {
  const input = manager.querySelector('[data-content-search]');
  const tabs = [...manager.querySelectorAll('[data-content-tab]')];
  const filters = [...manager.querySelectorAll('[data-card-filter]')];
  const cards = [...manager.querySelectorAll('[data-content-card]')];
  const empty = manager.querySelector('[data-content-empty]');
  const count = manager.querySelector('[data-content-result-count]');
  let activeTab = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true')?.dataset.contentTab || 'all';

  const refresh = () => {
    const query = contentNormalize(input?.value);
    const visibleCards = cards.filter((card) => {
      const tabMatches = activeTab === 'all' || card.dataset.tabValue === activeTab;
      const textMatches = !query || contentNormalize(card.dataset.searchValue).includes(query);
      const filterMatches = filters.every((filter) => !filter.value ||
        card.dataset[filter.dataset.cardFilter] === filter.value);
      card.hidden = !(tabMatches && textMatches && filterMatches);
      return !card.hidden;
    });
    if (count) count.textContent = String(visibleCards.length);
    if (empty) empty.hidden = visibleCards.length > 0;
    contentListLimit(manager, visibleCards);
  };

  tabs.forEach((tab) => tab.addEventListener('click', () => {
    activeTab = tab.dataset.contentTab;
    tabs.forEach((item) => item.setAttribute('aria-selected', String(item === tab)));
    filters.forEach((filter) => { filter.value = ''; });
    syncContentOptions(manager, activeTab);
    refresh();
  }));
  input?.addEventListener('input', refresh);
  filters.forEach((filter) => filter.addEventListener('change', () => {
    if (filter.dataset.cardFilter === 'subcategory') {
      const product = manager.querySelector('[data-card-filter="product"]');
      if (product) product.value = '';
      syncContentOptions(manager, activeTab);
    }
    refresh();
  }));
  syncContentOptions(manager, activeTab);
  refresh();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-content-manager]').forEach(setupContentManager);
});
