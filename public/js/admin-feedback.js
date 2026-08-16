document.addEventListener('DOMContentLoaded', () => {
  const normalize = (value) => String(value || '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  document.querySelectorAll('[data-product-picker]').forEach((picker) => {
    const input = picker.querySelector('[data-product-search]');
    const select = picker.querySelector('[data-product-select]');
    const status = picker.querySelector('[data-product-search-status]');
    if (!input || !select) return;
    const options = [...select.options];
    options.forEach((option) => { option.dataset.baseDisabled = String(option.disabled); });

    const syncSelected = () => {
      const selected = select.selectedOptions[0];
      select.classList.toggle('has-feedback', selected?.dataset.hasContent === 'true');
    };
    const filter = () => {
      const query = normalize(input.value);
      let visible = 0;
      options.forEach((option) => {
        const searchable = option.dataset.search || option.textContent;
        const matches = !query || normalize(searchable).includes(query);
        option.hidden = !matches;
        option.disabled = option.dataset.baseDisabled === 'true' || !matches;
        if (matches) visible += 1;
      });
      if (select.selectedOptions[0]?.disabled) {
        const next = options.find((option) => !option.disabled);
        if (next) select.value = next.value;
      }
      if (status) status.textContent = visible ? `${visible} coincidencia${visible === 1 ? '' : 's'}` : 'Sin coincidencias';
      syncSelected();
    };
    input.addEventListener('input', filter);
    select.addEventListener('change', syncSelected);
    syncSelected();
  });
});
