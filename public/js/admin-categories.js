function categoryPanel() {
  return document.getElementById('categoryFormPanel');
}

function categoryForm() {
  return document.getElementById('formPrincipal');
}

function abrirCategoriaCrear() {
  const form = categoryForm();
  categoryPanel().classList.remove('is-hidden');
  document.body.classList.add('admin-modal-open');
  document.getElementById('formTitle').innerText = 'Crear categoria';
  form.action = '/admin/categorias';
  form.reset();
  form.nombre.focus();
}

function cerrarCategoriaForm() {
  categoryPanel().classList.add('is-hidden');
  document.body.classList.remove('admin-modal-open');
}

function abrirCategoriaEditar(btn) {
  const form = categoryForm();
  categoryPanel().classList.remove('is-hidden');
  document.body.classList.add('admin-modal-open');
  document.getElementById('formTitle').innerText = 'Editar categoria';
  form.action = `/admin/categorias/${btn.dataset.id}?_method=PUT`;
  form.nombre.value = btn.dataset.nombre;
  form.descripcion.value = btn.dataset.desc;
  form.nombre.focus();
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !categoryPanel().classList.contains('is-hidden')) {
    cerrarCategoriaForm();
  }
});
