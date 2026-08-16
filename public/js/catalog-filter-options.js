document.addEventListener('DOMContentLoaded', () => {
  const stock = document.querySelector('[data-stock-filter]');
  const consult = document.querySelector('[data-consult-filter]');
  const promotion = document.querySelector('[data-promotion-filter]');
  if (!stock || !consult || !promotion) return;
  if (stock.checked && consult.checked) stock.checked = false;
  if (promotion.checked && consult.checked) consult.checked = false;

  stock.addEventListener('change', () => {
    if (stock.checked) consult.checked = false;
  });
  consult.addEventListener('change', () => {
    if (consult.checked) {
      stock.checked = false;
      promotion.checked = false;
    }
  });
  promotion.addEventListener('change', () => {
    if (promotion.checked) consult.checked = false;
  });
});
