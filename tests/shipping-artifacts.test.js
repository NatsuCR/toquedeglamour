import test from 'node:test';
import assert from 'node:assert/strict';
import { webSale } from '../src/services/finance-export-mappers.service.js';
import { InvoiceTotalsRenderer } from '../src/services/invoice-totals-renderer.service.js';

const order = {
  id: 1, codigo: 'PED-1', creadoEn: new Date('2026-08-16'), estado: 'PENDIENTE',
  nombreCliente: 'Cliente', apellidosCliente: 'Prueba', cedulaCliente: '1',
  correoCliente: 'cliente@example.com', metodoPago: 'SINPE', subtotal: 40005,
  subtotalOriginal: 40005, costoEnvio: 0, ivaIncluido: 0, total: 40005,
  descuentoProducto: 0, descuentoBienvenida: 0, items: [], comprobantePago: null
};

test('la exportación Excel conserva el envío gratuito calculado', () => {
  const row = webSale(order);
  assert.equal(row.envio, 0);
  assert.equal(row.total, 40005);
});

test('el comprobante PDF imprime el costo de envío guardado', () => {
  const rows = [];
  const originalLine = InvoiceTotalsRenderer.line;
  const chain = {};
  ['roundedRect', 'fillAndStroke', 'moveTo', 'lineTo', 'strokeColor', 'stroke',
    'fillColor', 'font', 'fontSize', 'text'].forEach((name) => { chain[name] = () => chain; });
  chain.y = 10;
  InvoiceTotalsRenderer.line = (_doc, _x, _y, label, value) => rows.push([label, value]);
  try {
    InvoiceTotalsRenderer.render(chain, order);
  } finally {
    InvoiceTotalsRenderer.line = originalLine;
  }
  assert.deepEqual(rows.find(([label]) => label === 'Envío'), ['Envío', 0]);
});
