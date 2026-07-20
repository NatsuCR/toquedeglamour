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
  productPanel().classList.remove('is-hidden');
  document.getElementById('formTitle').innerText = 'Crear producto';
  const form = productForm();
  form.action = '/admin/productos';
  form.reset();
  document.getElementById('imgInput').required = true;
  document.getElementById('imgHint').hidden = true;
  actualizarTipoVenta();
  actualizarSubcategorias();
  productPanel().scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cerrarProductoForm() {
  productPanel().classList.add('is-hidden');
}

function abrirProductoEditar(btn) {
  productPanel().classList.remove('is-hidden');
  document.getElementById('formTitle').innerText = 'Editar producto';
  const form = productForm();
  form.action = `/admin/productos/${btn.dataset.id}?_method=PUT`;
  form.nombre.value = btn.dataset.nombre;
  form.tipoVenta.value = btn.dataset.tipo || 'DIRECTA';
  form.categoriaId.value = btn.dataset.cat;
  actualizarSubcategorias(btn.dataset.subcat || '');
  form.precio.value = btn.dataset.precio;
  form.costo.value = btn.dataset.costo;
  form.stock.value = btn.dataset.stock;
  form.descripcion.value = btn.dataset.desc;
  document.getElementById('checkNuevo').checked = btn.dataset.nuevo === 'true';
  document.getElementById('imgInput').required = false;
  document.getElementById('imgHint').hidden = false;
  actualizarTipoVenta();
  productPanel().scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('tipoVentaSelect')?.addEventListener('change', actualizarTipoVenta);
  document.getElementById('categoriaSelect')?.addEventListener('change', () => actualizarSubcategorias());
});
