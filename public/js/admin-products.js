function productPanel() {
  return document.getElementById('productFormPanel');
}

function productForm() {
  return document.getElementById('formPrincipal');
}

function ventaInputs() {
  return ['precioInput', 'costoInput', 'stockInput'].map((id) => document.getElementById(id));
}

function actualizarTipoVenta() {
  const consulta = document.getElementById('tipoVentaSelect').value === 'CONSULTA';
  ventaInputs().forEach((input) => {
    input.required = !consulta;
    input.disabled = consulta;
    if (consulta) input.value = '';
  });
  document.getElementById('consultaNotice').hidden = !consulta;
}

function actualizarSubcategorias(selected = '') {
  const categoriaId = productForm().categoriaId.value;
  const select = document.getElementById('subcategoriaSelect');
  Array.from(select.options).forEach((option) => {
    const visible = !option.value || option.dataset.categoria === categoriaId;
    option.hidden = !visible;
    option.disabled = !visible;
  });
  select.value = selected;
  if (select.selectedOptions[0]?.disabled) select.value = '';
}

function abrirProductoCrear() {
  const form = productForm();
  productPanel().classList.remove('is-hidden');
  document.body.classList.add('admin-modal-open');
  document.getElementById('formTitle').innerText = 'Crear producto';
  form.action = '/admin/productos';
  form.reset();
  form.pesoGramos.value = 250;
  document.getElementById('imgInput').required = true;
  document.getElementById('imgHint').hidden = true;
  actualizarTipoVenta();
  actualizarSubcategorias();
  form.nombre.focus();
}

function cerrarProductoForm() {
  productPanel().classList.add('is-hidden');
  document.body.classList.remove('admin-modal-open');
}

function abrirProductoEditar(btn) {
  const form = productForm();
  productPanel().classList.remove('is-hidden');
  document.body.classList.add('admin-modal-open');
  document.getElementById('formTitle').innerText = 'Editar producto';
  form.action = `/admin/productos/${btn.dataset.id}?_method=PUT`;
  form.nombre.value = btn.dataset.nombre;
  form.marca.value = btn.dataset.marca || '';
  form.tipoVenta.value = btn.dataset.tipo || 'DIRECTA';
  form.categoriaId.value = btn.dataset.cat;
  actualizarSubcategorias(btn.dataset.subcat || '');
  form.precio.value = btn.dataset.precio;
  form.costo.value = btn.dataset.costo;
  form.stock.value = btn.dataset.stock;
  form.pesoGramos.value = btn.dataset.peso || 250;
  form.descripcion.value = btn.dataset.desc;
  document.getElementById('checkNuevo').checked = btn.dataset.nuevo === 'true';
  document.getElementById('imgInput').required = false;
  document.getElementById('imgHint').hidden = false;
  actualizarTipoVenta();
  form.nombre.focus();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('tipoVentaSelect')?.addEventListener('change', actualizarTipoVenta);
  document.getElementById('categoriaSelect')?.addEventListener('change', () => actualizarSubcategorias());
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !productPanel().classList.contains('is-hidden')) {
    cerrarProductoForm();
  }
});
