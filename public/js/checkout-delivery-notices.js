function updateDeliveryNotices() {
  const delivery = document.querySelector('input[name="tipoEntrega"]:checked')?.value;
  document.querySelectorAll('[data-local-pickup-notice]').forEach((notice) => {
    notice.hidden = delivery !== 'LOCAL';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[name="tipoEntrega"]').forEach((input) => {
    input.addEventListener('change', updateDeliveryNotices);
  });
  updateDeliveryNotices();
});
