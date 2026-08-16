function setFieldState(container, enabled, required = enabled) {
  if (!container) return;
  container.hidden = !enabled;
  container.querySelectorAll('input, select, textarea').forEach((input) => {
    input.disabled = !enabled;
    input.required = required;
  });
}

function actualizarCamposProducto() {
  const form = document.getElementById('formPrincipal');
  if (!form) return;
  const consultation = form.tipoVenta.value === 'CONSULTA';
  const cosmetic = !consultation && form.tipoProducto.value === 'COSMETICO';
  const precautions = !consultation && form.incluyePrecauciones.value === 'true';
  const sustainable = !consultation && form.incluyeSostenibilidad.value === 'true';

  form.querySelectorAll('[data-direct-field]').forEach((field) => {
    setFieldState(field, !consultation);
  });
  setFieldState(form.querySelector('[data-promotion-field]'), !consultation, false);
  setFieldState(form.querySelector('[data-direct-content]'), !consultation, true);
  setFieldState(form.querySelector('[data-cosmetic-field]'), cosmetic, cosmetic);
  setFieldState(form.querySelector('[data-precautions-option]'), !consultation, false);
  setFieldState(form.querySelector('[data-precautions-field]'), precautions, precautions);
  setFieldState(form.querySelector('[data-sustainability-option]'), !consultation, false);
  setFieldState(form.querySelector('[data-sustainability-field]'), sustainable, sustainable);
  document.getElementById('consultaNotice').hidden = !consultation;
  if (consultation) form.tipoProducto.value = 'GENERAL';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('tipoVentaSelect')?.addEventListener('change', actualizarCamposProducto);
  document.getElementById('tipoProductoSelect')?.addEventListener('change', actualizarCamposProducto);
  document.getElementById('precautionsSelect')?.addEventListener('change', actualizarCamposProducto);
  document.getElementById('sustainabilitySelect')?.addEventListener('change', actualizarCamposProducto);
});
