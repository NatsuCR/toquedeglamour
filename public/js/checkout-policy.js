function updatePaymentFormats() {
  const reference = document.querySelector('.checkout-payment-reference');
  if (!reference) return;

  const delivery = document.querySelector('input[name="tipoEntrega"]:checked')?.value || 'LOCAL';
  reference.querySelectorAll('[data-format]').forEach((block) => {
    block.hidden = block.dataset.format !== delivery;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[name="tipoEntrega"]').forEach((input) => {
    input.addEventListener('change', updatePaymentFormats);
  });
  updatePaymentFormats();
});
