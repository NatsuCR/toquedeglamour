const brandModal = document.getElementById('brandEditModal');
const brandForm = document.getElementById('brandEditForm');

function closeBrandEditor() {
  brandModal?.close();
  document.body.classList.remove('admin-modal-open');
}

document.addEventListener('click', (event) => {
  const edit = event.target.closest('[data-edit-brand]');
  if (edit && brandModal && brandForm) {
    try {
      const brand = JSON.parse(decodeURIComponent(edit.dataset.editBrand));
      brandForm.action = `/admin/marcas/${encodeURIComponent(brand.id)}?_method=PUT`;
      brandForm.marca.value = brand.marca || '';
      brandForm.titulo.value = brand.titulo || '';
      brandForm.enlace.value = brand.enlace || '/catalogo';
      brandForm.descripcion.value = brand.descripcion || '';
      brandForm.activa.checked = brand.activa !== false;
      brandForm.imagen.value = '';
      document.getElementById('brandEditPreview').src = brand.imagenUrl;
      brandModal.showModal();
      document.body.classList.add('admin-modal-open');
      brandForm.marca.focus();
    } catch {
      return;
    }
  }
  if (event.target.closest('[data-close-brand]')) closeBrandEditor();
});

brandModal?.addEventListener('click', (event) => {
  if (event.target === brandModal) closeBrandEditor();
});
