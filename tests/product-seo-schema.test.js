import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import ejs from 'ejs';

const schemaView = path.resolve('src/views/client/partials/product-schema.ejs');

function productData() {
  return {
    id: 7, nombre: 'Colágeno Nutriplus', slug: 'colageno-nutriplus',
    descripcion: 'Producto de prueba', marca: 'Nutriplus', tipoVenta: 'DIRECTA',
    precio: 12000, stock: 3, categoria: { nombre: 'Nutrición', slug: 'nutricion' },
    subcategoria: null, imagenes: [{ ruta: '/img/producto.jpg' }],
    preguntasFrecuentes: [{ pregunta: '¿Cómo se utiliza?', respuesta: 'Una vez al día.' }],
    resenas: [
      { nombre: 'Cliente Local', comentario: 'Muy buen producto', calificacion: 5,
        creadaPorAdmin: false, creadoEn: new Date('2026-08-10') },
      { nombre: 'María', comentario: 'Me gustó mucho', calificacion: 4,
        creadaPorAdmin: true, creadoEn: new Date('2026-07-02') }
    ]
  };
}

async function renderSchema(producto = productData()) {
  const html = await ejs.renderFile(schemaView, {
    producto, siteUrl: 'https://toquedeglamour.com',
    canonicalUrl: 'https://toquedeglamour.com/producto/7/colageno-nutriplus'
  });
  return JSON.parse(html.match(/<script[^>]*>(.*)<\/script>/s)[1]);
}

test('publica FAQ y reseñas en JSON-LD', async () => {
  const schema = await renderSchema();
  const product = schema['@graph'].find((item) => item['@type'] === 'Product');
  const faq = schema['@graph'].find((item) => item['@type'] === 'FAQPage');
  assert.equal(faq.mainEntity[0].acceptedAnswer.text, 'Una vez al día.');
  assert.equal(product.review.length, 2);
  assert.equal(product.review[1].author.name, 'María');
  assert.equal(product.review[1].publisher, undefined);
  assert.equal(product.review[1].datePublished, undefined);
});

test('calcula AggregateRating con los comentarios visibles', async () => {
  const schema = await renderSchema();
  const product = schema['@graph'].find((item) => item['@type'] === 'Product');
  assert.equal(product.aggregateRating.ratingValue, 4.5);
  assert.equal(product.aggregateRating.reviewCount, 2);
});

test('muestra únicamente nombre, comentario y estrellas en cada reseña', async () => {
  const html = await ejs.renderFile(
    path.resolve('src/views/client/producto-parts/reviews.ejs'),
    { producto: productData(), user: null, reviewSuccess: false, reviewError: null }
  );
  assert.match(html, /María/);
  assert.match(html, /Comentario:/);
  assert.match(html, /Me gustó mucho/);
  assert.match(html, /4 de 5 estrellas/);
  assert.doesNotMatch(html, /Fuente:|fuente oficial|2\/7\/2026|10\/8\/2026/i);
});

test('ofrece cargar todos cuando existen más de cinco comentarios', async () => {
  const producto = productData();
  producto.resenas = Array.from({ length: 6 }, (_, index) => ({
    nombre: `Cliente ${index + 1}`, comentario: `Comentario ${index + 1}`,
    calificacion: 5, creadaPorAdmin: false, creadoEn: new Date('2026-08-10')
  }));
  const html = await ejs.renderFile(
    path.resolve('src/views/client/producto-parts/reviews.ejs'),
    { producto, user: null, reviewSuccess: false, reviewError: null }
  );
  assert.equal((html.match(/data-review-card/g) || []).length, 6);
  assert.match(html, /Cargar todos los comentarios/);
});
