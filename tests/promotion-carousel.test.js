import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('el carrusel usa 15 segundos y sus imágenes 5 segundos', () => {
  const slider = fs.readFileSync('public/js/client-slider.js', 'utf8');
  const card = fs.readFileSync('src/views/client/partials/slider-section.ejs', 'utf8');
  assert.match(slider, /15000/);
  assert.match(card, /data-card-interval="5000"/);
});

test('Apariencia incluye textos editables para promociones', () => {
  const view = fs.readFileSync('src/views/admin/apariencia-parts/carousels.ejs', 'utf8');
  assert.match(view, /promotionTitle/);
  assert.match(view, /promotionSubtitle/);
});
