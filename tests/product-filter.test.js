import test from 'node:test';
import assert from 'node:assert/strict';
import { filtrosProducto } from '../src/services/product-filter.service.js';

test('filtra exclusivamente productos de consulta', () => {
  const where = filtrosProducto({
    consulta: true,
    disponible: true,
    minPrecio: '1000',
    maxPrecio: '5000'
  });
  assert.equal(where.tipoVenta, 'CONSULTA');
  assert.equal(where.stock, undefined);
  assert.equal(where.precio, undefined);
});

test('conserva el filtro de compra inmediata', () => {
  const where = filtrosProducto({ disponible: true, consulta: false });
  assert.equal(where.tipoVenta, 'DIRECTA');
  assert.deepEqual(where.stock, { gt: 0 });
});

test('filtra únicamente promociones activas de venta directa', () => {
  const where = filtrosProducto({ promocion: true, disponible: true });
  assert.equal(where.tipoVenta, 'DIRECTA');
  assert.equal(where.promocionActiva, true);
  assert.deepEqual(where.promocionPorcentaje, { gt: 0 });
  assert.deepEqual(where.stock, { gt: 0 });
});
