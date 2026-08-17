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
        creadaPorAdmin: true, fuenteOficial: true, fuenteNombre: 'Nutriplus',
        fuenteUrl: 'https://example.com/nutriplus', fechaOriginal: new Date('2026-07-02') }
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

test('publica FAQ y reseñas con fuente oficial en JSON-LD', async () => {
  const schema = await renderSchema();
  const product = schema['@graph'].find((item) => item['@type'] === 'Product');
  const faq = schema['@graph'].find((item) => item['@type'] === 'FAQPage');
  assert.equal(faq.mainEntity[0].acceptedAnswer.text, 'Una vez al día.');
  assert.equal(product.review.length, 2);
  assert.equal(product.review[1].publisher.name, 'Nutriplus');
  assert.equal(product.review[1].url, 'https://example.com/nutriplus');
});

test('calcula AggregateRating únicamente con clientes locales', async () => {
  const schema = await renderSchema();
  const product = schema['@graph'].find((item) => item['@type'] === 'Product');
  assert.equal(product.aggregateRating.ratingValue, 5);
  assert.equal(product.aggregateRating.reviewCount, 1);
});
