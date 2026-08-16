import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import ejs from 'ejs';

const view = path.resolve('src/views/client/partials/slider-section.ejs');
const products = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  nombre: `Producto ${index + 1}`,
  slug: `producto-${index + 1}`,
  esNuevo: true,
  tipoVenta: 'DIRECTA',
  stock: 3,
  precio: 1000,
  imagenes: [],
  categoria: { nombre: 'Prueba' }
}));

test('muestra el badge Nuevo en todos los productos marcados', async () => {
  const html = await ejs.renderFile(view, {
    items: products,
    titulo: 'Recién llegados',
    subtitulo: '',
    icono: '',
    sliderId: 'sliderNuevos',
    mostrarBadge: true,
    formatMoney: (value) => `₡${value}`,
    promotionalPrice: (product) => product.precio
  });
  assert.equal((html.match(/>Nuevo<\/span>/g) || []).length, products.length);
});
