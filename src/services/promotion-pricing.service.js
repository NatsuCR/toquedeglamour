import { roundMoney } from '../utils/money.js';

const percent = (amount, rate) => roundMoney(roundMoney(amount) * Number(rate || 0) / 100);

function selectedWelcomeId(items, client, settings, requestedId) {
  if (!client || !settings.bienvenidaActiva || client.bienvenidaUsadaEn) return null;
  const eligible = items.filter(({ producto }) => producto.tipoVenta === 'DIRECTA');
  const requested = eligible.find(({ producto }) => producto.id === Number(requestedId));
  if (requested) return requested.producto.id;
  return eligible.sort((a, b) => Number(b.producto.precio) - Number(a.producto.precio))[0]?.producto.id || null;
}

export function calculatePromotions(items, client, settings, requestedWelcomeId) {
  const welcomeProductId = selectedWelcomeId(items, client, settings, requestedWelcomeId);
  const totals = { original: 0, product: 0, welcome: 0, final: 0 };
  const pricedItems = items.map(({ producto, cantidad }) => {
    const quantity = Number(cantidad) || 0;
    const originalUnit = roundMoney(producto.precio);
    const originalLine = originalUnit * quantity;
    const direct = producto.tipoVenta === 'DIRECTA';
    const productRate = direct && producto.promocionActiva ? producto.promocionPorcentaje : 0;
    const productDiscountUnit = percent(originalUnit, productRate);
    const afterProductUnit = originalUnit - productDiscountUnit;
    const welcomeDiscountUnit = producto.id === welcomeProductId
      ? percent(afterProductUnit, settings.bienvenidaPorcentaje) : 0;
    const finalUnit = roundMoney(afterProductUnit - welcomeDiscountUnit);
    const productDiscount = productDiscountUnit * quantity;
    const welcomeDiscount = welcomeDiscountUnit * quantity;
    const finalLine = finalUnit * quantity;
    totals.original += originalLine;
    totals.product += productDiscount;
    totals.welcome += welcomeDiscount;
    totals.final += finalLine;
    return {
      producto, cantidad: quantity, originalUnit,
      finalUnit,
      originalLine, finalLine,
      discountTotal: productDiscount + welcomeDiscount,
      productDiscount, welcomeDiscount
    };
  });
  Object.keys(totals).forEach((key) => { totals[key] = roundMoney(totals[key]); });
  return { items: pricedItems, totals, welcomeProductId };
}

export function promotionalPrice(product) {
  const price = roundMoney(product?.precio);
  if (!product?.promocionActiva || product.tipoVenta !== 'DIRECTA') return price;
  return roundMoney(price - percent(price, product.promocionPorcentaje));
}
