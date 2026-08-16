import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePromotions } from '../src/services/promotion-pricing.service.js';
import { calculateShipping, shippingWithPromotions } from '../src/services/shipping.service.js';
import { includedTax } from '../src/services/tax.service.js';

const settings = {
  bienvenidaActiva: true, bienvenidaPorcentaje: 5,
  envioGratisActivo: true, envioGratisDesde: 35000
};

const product = (id, price, promotion = 0) => ({
  id, precio: price, tipoVenta: 'DIRECTA',
  promocionActiva: promotion > 0, promocionPorcentaje: promotion
});

test('combina promoción de producto y bienvenida sin tocar consultas', () => {
  const client = { id: 1, bienvenidaUsadaEn: null };
  const result = calculatePromotions([
    { producto: product(1, 20000, 10), cantidad: 1 },
    { producto: { ...product(2, 30000), tipoVenta: 'CONSULTA' }, cantidad: 1 }
  ], client, settings, 1);
  assert.equal(result.items[0].finalUnit, 17100);
  assert.equal(result.items[1].welcomeDiscount, 0);
});

test('bienvenida se usa en el producto elegido y desaparece si ya fue usada', () => {
  const items = [
    { producto: product(1, 10000), cantidad: 1 },
    { producto: product(2, 20000), cantidad: 1 }
  ];
  const active = calculatePromotions(items, { id: 1 }, settings, 1);
  assert.equal(active.items[0].welcomeDiscount, 500);
  assert.equal(active.items[1].welcomeDiscount, 0);
  const used = calculatePromotions(items, { id: 1, bienvenidaUsadaEn: new Date() }, settings, 1);
  assert.equal(used.totals.welcome, 0);
});

test('envío base es 3000 y se vuelve gratis al superar el umbral', () => {
  assert.equal(calculateShipping(2000), 3000);
  assert.equal(calculateShipping(2001), 4000);
  assert.equal(shippingWithPromotions(1000, 35000, settings).costoEnvio, 3000);
  assert.equal(shippingWithPromotions(1000, 35005, settings).costoEnvio, 0);
});

test('IVA incluido no aumenta el precio final', () => {
  assert.equal(includedTax(11300, true, 13), 1300);
  assert.equal(includedTax(11300, false, 13), 0);
});
