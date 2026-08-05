function productPanel() {
  return document.getElementById('productFormPanel');
}

function productForm() {
  return document.getElementById('formPrincipal');
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
  clearProductImages();
  form.pesoGramos.value = 250;
  document.getElementById('imgInput').required = true;
  document.getElementById('imgHint').hidden = true;
  actualizarCamposProducto();
  actualizarSubcategorias();
  form.nombre.focus();
}

function cerrarProductoForm() {
  productPanel().classList.add('is-hidden');
  document.body.classList.remove('admin-modal-open');
}

function abrirProductoEditar(btn) {
  const form = productForm();
  const product = decodeProductData(btn);
  if (!product) return;
  productPanel().classList.remove('is-hidden');
  document.body.classList.add('admin-modal-open');
  document.getElementById('formTitle').innerText = 'Editar producto';
  form.reset();
  form.action = `/admin/productos/${product.id}?_method=PUT`;
  form.nombre.value = product.nombre;
  form.marca.value = product.marca || '';
  form.tipoVenta.value = product.tipoVenta || 'DIRECTA';
  form.tipoProducto.value = product.tipoProducto || 'GENERAL';
  form.categoriaId.value = product.categoriaId;
  actualizarSubcategorias(String(product.subcategoriaId || ''));
  form.precio.value = product.precio;
  form.costo.value = product.costo;
  form.stock.value = product.stock;
  form.pesoGramos.value = product.tipoVenta === 'CONSULTA' ? '' : (product.pesoGramos || 250);
  form.descripcion.value = product.descripcion;
  form.modoUso.value = product.modoUso || '';
  form.detallesTecnicos.value = product.detallesTecnicos || '';
  form.precauciones.value = product.precauciones || '';
  form.incluyeSostenibilidad.value = product.incluyeSostenibilidad === false ? 'false' : 'true';
  form.sostenibilidad.value = product.sostenibilidad || '';
  form.resultadosComprobados.value = product.resultadosComprobados || '';
  document.getElementById('checkNuevo').checked = product.esNuevo === true;
  renderProductImages(product.imagenes || []);
  document.getElementById('imgInput').required = false;
  document.getElementById('imgHint').hidden = false;
  actualizarCamposProducto();
  form.nombre.focus();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('categoriaSelect')?.addEventListener('change', () => actualizarSubcategorias());
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !productPanel().classList.contains('is-hidden')) {
    cerrarProductoForm();
  }
});
