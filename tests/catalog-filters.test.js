import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogFilters } from '../src/utils/catalog-filters.js';

test('normaliza el filtro de promoción como venta directa', () => {
  const filters = catalogFilters({ promocion: 'true', consulta: 'true' });
  assert.equal(filters.promocion, true);
  assert.equal(filters.consulta, false);
});

test('permite combinar promoción con productos en stock', () => {
  const filters = catalogFilters({ promocion: 'true', disponible: 'true' });
  assert.equal(filters.promocion, true);
  assert.equal(filters.disponible, true);
});
