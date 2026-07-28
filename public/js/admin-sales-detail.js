document.addEventListener('click', (event) => {
  const open = event.target.closest('[data-open-sale]');
  if (open) {
    document.getElementById(`saleModal-${open.dataset.openSale}`)?.showModal();
    return;
  }
  const close = event.target.closest('[data-close-sale]');
  if (close) document.getElementById(`saleModal-${close.dataset.closeSale}`)?.close();
  const proof = event.target.closest('[data-proof-toggle]');
  if (proof) {
    const preview = proof.closest('.sales-proof-item')?.querySelector('.sales-proof-preview');
    if (!preview) return;
    preview.hidden = !preview.hidden;
    proof.textContent = preview.hidden ? 'Cargar comprobante' : 'Cerrar comprobante';
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll('.sales-detail-modal[open]').forEach((modal) => modal.close());
});
