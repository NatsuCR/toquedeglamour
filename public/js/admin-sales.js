document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('[data-sales-form]');
  if (!form) return;
  const quantities = [...form.querySelectorAll('[data-sale-qty]')];
  const search = form.querySelector('[data-sales-search]');
  const fileInput = form.querySelector('[data-sales-files]');
  const fileLabel = form.querySelector('[data-sales-file-label]');
  const payment = form.querySelector('[data-sales-payment]');
  const proofWrap = form.querySelector('[data-sales-proof-wrap]');
  const cashNote = form.querySelector('[data-sales-cash-note]');
  const normalize = (value) => String(value || '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const money = (value) => new Intl.NumberFormat('es-CR', {
    style: 'currency', currency: 'CRC', maximumFractionDigits: 0
  }).format(Math.round(Number(value || 0) / 5) * 5);

  function manualPrice(productId) {
    const input = form.querySelector(`[data-sale-price][data-id="${productId}"]`);
    return Number(input?.value || 0);
  }

  function selectedItems() {
    return quantities.map((input) => {
      const quantity = Number(input.value || 0);
      const consult = input.dataset.consult === 'true';
      const price = consult ? manualPrice(input.dataset.id) : Number(input.dataset.price || 0);
      return { productoId: Number(input.dataset.id), cantidad: quantity, price, consult };
    }).filter((item) => item.cantidad > 0);
  }

  function update() {
    const items = selectedItems();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.cantidad, 0);
    const iva = form.dataset.ivaActive === 'true'
      ? subtotal * (Number(form.dataset.ivaRate || 0) / 100)
      : 0;
    const employee = document.body.dataset.role === 'EMPLEADO';
    form.querySelector('[data-items-json]').value = JSON.stringify(items.map((item) => ({
      productoId: item.productoId,
      cantidad: item.cantidad,
      precioManual: item.consult ? item.price : undefined
    })));
    form.querySelector('[data-sale-subtotal]').textContent = money(subtotal);
    form.querySelector('[data-sale-iva]').textContent = money(iva);
    form.querySelector('[data-sale-commission]').textContent = money(employee ? subtotal * 0.1 : 0);
    form.querySelector('[data-sale-total]').textContent = money(subtotal + iva);
  }

  function filterProducts() {
    const query = normalize(search.value);
    form.querySelectorAll('.sales-product').forEach((card) => {
      card.hidden = Boolean(query) && !normalize(card.dataset.search).includes(query);
    });
    form.querySelectorAll('[data-sales-group]').forEach((group) => {
      group.hidden = !group.querySelector('.sales-product:not([hidden])');
    });
  }

  function toggleProofField() {
    const cash = payment?.value === 'EFECTIVO';
    if (proofWrap) proofWrap.hidden = cash;
    if (cashNote) cashNote.hidden = !cash;
    if (cash && fileInput) {
      fileInput.value = '';
      fileLabel.textContent = 'Subir imagen o PDF de SINPE, transferencia o recibo.';
    }
  }

  quantities.forEach((input) => input.addEventListener('input', update));
  form.querySelectorAll('[data-sale-price]').forEach((input) => input.addEventListener('input', update));
  search?.addEventListener('input', filterProducts);
  payment?.addEventListener('change', toggleProofField);
  fileInput?.addEventListener('change', () => {
    const count = fileInput.files.length;
    fileLabel.textContent = count ? `${count} archivo${count === 1 ? '' : 's'} seleccionado${count === 1 ? '' : 's'}` : 'Subir imagen o PDF de SINPE, transferencia o recibo.';
  });
  form.addEventListener('submit', (event) => {
    update();
    const items = selectedItems();
    if (items.some((item) => item.price <= 0)) {
      event.preventDefault();
      window.alert('Define el precio acordado en los productos por consulta.');
      return;
    }
    if (items.length) return;
    event.preventDefault();
    window.alert('Selecciona al menos un producto.');
  });
  update();
  toggleProofField();
});
