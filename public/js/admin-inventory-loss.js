document.addEventListener('DOMContentLoaded', () => {
  const product = document.querySelector('[data-loss-product]');
  const quantity = document.querySelector('[data-loss-quantity]');
  const preview = document.querySelector('[data-loss-preview]');
  if (!product || !quantity || !preview) return;

  const money = (value) => new Intl.NumberFormat('es-CR', {
    style: 'currency', currency: 'CRC', maximumFractionDigits: 0
  }).format(value);

  function update() {
    const option = product.selectedOptions[0];
    const stock = Number(option?.dataset.stock || 0);
    const cost = Number(option?.dataset.cost || 0);
    const units = Math.max(0, Number.parseInt(quantity.value, 10) || 0);
    quantity.max = stock || '';
    if (!product.value) {
      preview.textContent = 'Selecciona un producto para calcular la pérdida.';
      return;
    }
    preview.textContent = `${units} de ${stock} unidades · pérdida estimada ${money(cost * units)}`;
  }

  product.addEventListener('change', update);
  quantity.addEventListener('input', update);
});
