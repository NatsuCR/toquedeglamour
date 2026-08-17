import test from 'node:test';
import assert from 'node:assert/strict';
import { officialReviewSource } from '../src/services/product-feedback.validation.js';

test('normaliza la procedencia de una reseña oficial', () => {
  const source = officialReviewSource({
    fuenteOficial: 'on', fuenteNombre: ' Nutriplus ',
    fuenteUrl: 'https://www.example.com/review', fechaOriginal: '2026-08-01'
  });
  assert.equal(source.fuenteOficial, true);
  assert.equal(source.fuenteNombre, 'Nutriplus');
  assert.equal(source.fuenteUrl, 'https://www.example.com/review');
  assert.equal(source.fechaOriginal.getFullYear(), 2026);
});

test('limpia los datos de fuente cuando no es una reseña importada', () => {
  assert.deepEqual(officialReviewSource({ fuenteNombre: 'Nutriplus' }), {
    fuenteOficial: false, fuenteNombre: null, fuenteUrl: null, fechaOriginal: null
  });
});

test('rechaza enlaces de fuente que no son web', () => {
  assert.throws(() => officialReviewSource({
    fuenteOficial: 'on', fuenteNombre: 'Nutriplus', fuenteUrl: 'javascript:alert(1)'
  }), /enlace válido/);
});
