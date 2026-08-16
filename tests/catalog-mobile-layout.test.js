import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('separa el botón aplicar del botón que abre los filtros en celular', () => {
  const catalog = fs.readFileSync('src/views/client/catalogo.ejs', 'utf8');
  const filter = fs.readFileSync('src/views/client/catalogo-parts/filter.ejs', 'utf8');
  const script = fs.readFileSync('public/js/catalog-mobile-filter.js', 'utf8');
  const searchPosition = catalog.indexOf('catalog-mobile-search');
  const applyPosition = catalog.indexOf('catalog-mobile-apply');
  const togglePosition = catalog.indexOf('catalog-filter-toggle');

  assert.ok(searchPosition < applyPosition && applyPosition < togglePosition);
  assert.match(catalog, /form="catalogFilterForm"/);
  assert.match(filter, /id="catalogFilterForm"/);
  assert.match(script, /open \? 'Cerrar filtros' : 'Filtros'/);
});
