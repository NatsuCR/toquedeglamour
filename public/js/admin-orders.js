function activateOrderTab(tabId) {
  document.querySelectorAll('[data-order-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.orderTab === tabId);
  });
  document.querySelectorAll('[data-order-panel]').forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.orderPanel === tabId);
  });
}

function openOrderModal(orderId) {
  const modal = document.querySelector(`[data-order-modal="${orderId}"]`);
  if (modal && typeof modal.showModal === 'function') modal.showModal();
}

function closeOrderModal(button) {
  button.closest('dialog')?.close();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-order-tab]').forEach((button) => {
    button.addEventListener('click', () => activateOrderTab(button.dataset.orderTab));
  });

  document.querySelectorAll('[data-order-open]').forEach((button) => {
    button.addEventListener('click', () => openOrderModal(button.dataset.orderOpen));
  });

  document.querySelectorAll('[data-order-close]').forEach((button) => {
    button.addEventListener('click', () => closeOrderModal(button));
  });

  document.querySelectorAll('.order-modal').forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) modal.close();
    });
  });
});
