const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const roundMoney = (value) => Math.round((Number(value) || 0) / 5) * 5;
const money = (value) => new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0
}).format(roundMoney(value));

const state = { data: [], subtotal: 0, envio: 0, ivaActivo: false, ivaRate: 13 };

function fillSelect(select, items, selected, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.nombre;
    option.dataset.id = item.id;
    option.dataset.zona = item.zonaEntrega || '';
    option.textContent = item.nombre;
    option.selected = item.nombre === selected;
    select.appendChild(option);
  });
}

function selectedOption(select) {
  return select.options[select.selectedIndex];
}

function setRequired(container, enabled) {
  container.querySelectorAll('select, textarea').forEach((field) => {
    field.required = enabled;
  });
}

function updateDelivery() {
  const isHome = $('input[name="tipoEntrega"]:checked')?.value === 'DOMICILIO';
  const address = $('#addressFields');
  state.envio = isHome ? roundMoney($('#checkoutApp').dataset.shipping) : 0;
  const iva = state.ivaActivo ? roundMoney(state.subtotal * (state.ivaRate / 100)) : 0;
  address.hidden = !isHome;
  setRequired(address, isHome);
  $('#shippingAmount').textContent = isHome ? money(state.envio) : 'Gratis';
  $('#ivaLine').hidden = !state.ivaActivo;
  $('#ivaAmount').textContent = money(iva);
  $('#totalAmount').textContent = money(state.subtotal + state.envio + iva);
}

function updatePayment() {
  const method = $('input[name="metodoPago"]:checked')?.value || 'SINPE';
  $$('.payment-box').forEach((box) => {
    box.hidden = box.dataset.method !== method;
  });
}

function updateProof() {
  const channel = $('input[name="canalComprobante"]:checked')?.value || 'WEB';
  const upload = $('#proofUpload');
  upload.hidden = channel !== 'WEB';
  $('#comprobante').required = channel === 'WEB';
}

function updateFileName() {
  const input = $('#comprobante');
  const label = $('#fileName');
  if (!input || !label) return;
  label.textContent = input.files?.[0]?.name || 'Ningun archivo seleccionado';
}

function loadCantones() {
  const provincia = selectedOption($('#provincia'))?.dataset.id;
  const item = state.data.find((actual) => actual.id === provincia);
  fillSelect($('#canton'), item?.cantones || [], $('#canton').dataset.selected, 'Selecciona canton');
  $('#canton').dataset.selected = '';
  loadDistritos();
}

function loadDistritos() {
  const provincia = selectedOption($('#provincia'))?.dataset.id;
  const canton = selectedOption($('#canton'))?.dataset.id;
  const prov = state.data.find((actual) => actual.id === provincia);
  const cant = prov?.cantones.find((actual) => actual.id === canton);
  fillSelect($('#distrito'), cant?.distritos || [], $('#distrito').dataset.selected, 'Selecciona distrito');
  $('#distrito').dataset.selected = '';
  updateZone();
}

function updateZone() {
  const option = selectedOption($('#canton'));
  const zona = option?.value ? (option.dataset.zona || 'Resto del pa\u00eds') : 'Selecciona canton';
  $('#zonaEntrega').value = option?.value ? zona : '';
  $('#zonaEntregaText').textContent = zona;
}

async function initLocations() {
  const response = await fetch('/data/costa-rica.json');
  const data = await response.json();
  state.data = data.provincias || [];
  fillSelect($('#provincia'), state.data, $('#provincia').dataset.selected, 'Selecciona provincia');
  loadCantones();
}

document.addEventListener('DOMContentLoaded', () => {
  const app = $('#checkoutApp');
  if (!app) return;
  state.subtotal = roundMoney(app.dataset.subtotal);
  state.ivaActivo = app.dataset.ivaActive === 'true';
  state.ivaRate = Number(app.dataset.ivaRate) || 13;
  $$('input[name="tipoEntrega"]').forEach((item) => item.addEventListener('change', updateDelivery));
  $$('input[name="metodoPago"]').forEach((item) => item.addEventListener('change', updatePayment));
  $$('input[name="canalComprobante"]').forEach((item) => item.addEventListener('change', updateProof));
  $('#comprobante')?.addEventListener('change', updateFileName);
  $('#provincia').addEventListener('change', loadCantones);
  $('#canton').addEventListener('change', loadDistritos);
  initLocations();
  updateDelivery();
  updatePayment();
  updateProof();
  updateFileName();
});
