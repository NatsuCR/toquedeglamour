import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import ejs from 'ejs';

const product = {
  id: 9,
  nombre: 'Producto de prueba',
  marca: 'Nutriplus',
  categoriaId: 2,
  subcategoriaId: 5,
  categoria: { nombre: 'Cosméticos' },
  subcategoria: { nombre: 'Labios' },
  resenas: [
    { id: 1, nombre: 'Cliente', comentario: 'Excelente producto', calificacion: 5, creadaPorAdmin: false },
    { id: 2, nombre: 'Ana', comentario: 'Reseña inicial', calificacion: 4,
      creadaPorAdmin: true, fuenteOficial: true, fuenteNombre: 'Nutriplus',
      fuenteUrl: 'https://example.com/producto', fechaOriginal: new Date('2026-08-01') }
  ],
  preguntasFrecuentes: [
    { id: 3, pregunta: '¿Cómo se usa?', respuesta: 'Se utiliza diariamente.' }
  ]
};

test('separa comentarios por cliente y administrador con contexto del producto', async () => {
  const html = await ejs.renderFile(
    path.resolve('src/views/admin/promociones-parts/review-management.ejs'),
    { products: [product] }
  );
  assert.match(html, /data-content-tab="client"/);
  assert.match(html, /data-content-tab="admin"/);
  assert.match(html, /Cosméticos/);
  assert.match(html, /Labios/);
  assert.match(html, /PRD-0009/);
  assert.match(html, /Creado en admin/);
  assert.doesNotMatch(html, /name="fuenteUrl"/);
});

test('el formulario admin no solicita procedencia de comentarios', async () => {
  const html = await ejs.renderFile(
    path.resolve('src/views/admin/promociones-parts/review-create.ejs'),
    { products: [product] }
  );
  assert.match(html, /Comentar producto/);
  assert.doesNotMatch(html, /Procedencia del comentario/);
  assert.doesNotMatch(html, /fuenteOficial|fuenteUrl|fechaOriginal/);
});

test('organiza preguntas por categoría, subcategoría y producto', async () => {
  const html = await ejs.renderFile(
    path.resolve('src/views/admin/promociones-parts/faq-management.ejs'),
    { products: [product] }
  );
  assert.match(html, /data-content-tab="2"/);
  assert.match(html, /data-card-filter="subcategory"/);
  assert.match(html, /data-card-filter="product"/);
  assert.match(html, /data-subcategory="5"/);
  assert.match(html, /data-product="9"/);
});
