function categoryPanel() {
  return document.getElementById('categoryFormPanel');
}

function abrirCategoriaCrear() {
  categoryPanel().classList.remove('is-hidden');
  document.getElementById('formTitle').innerText = 'Crear categoría';
  const form = document.getElementById('formPrincipal');
  form.action = '/admin/categorias';
  form.reset();
  categoryPanel().scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cerrarCategoriaForm() {
  categoryPanel().classList.add('is-hidden');
}

function abrirCategoriaEditar(btn) {
  categoryPanel().classList.remove('is-hidden');
  document.getElementById('formTitle').innerText = 'Editar categoría';
  const form = document.getElementById('formPrincipal');
  form.action = `/admin/categorias/${btn.dataset.id}?_method=PUT`;
  form.nombre.value = btn.dataset.nombre;
  form.descripcion.value = btn.dataset.desc;
  categoryPanel().scrollIntoView({ behavior: 'smooth', block: 'start' });
}
