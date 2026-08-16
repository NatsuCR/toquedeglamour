import { ProductoService } from './producto.service.js';
import { roundMoney } from '../utils/money.js';
import { shippingSummary } from './shipping.service.js';
import prisma from '../config/db.js';
import { PromotionSettingsService } from './promotion-settings.service.js';
import { calculatePromotions } from './promotion-pricing.service.js';
import { shippingWithPromotions } from './shipping.service.js';
import { WelcomeDiscountService } from './welcome-discount.service.js';

const positiveInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

function toCartItem(priced) {
  return {
    productoId: priced.producto.id,
    nombre: priced.producto.nombre,
    precio: priced.finalUnit,
    precioOriginal: priced.originalUnit,
    descuentoTotal: priced.discountTotal,
    imagenUrl: priced.producto.imagenUrl,
    pesoGramos: priced.producto.pesoGramos || 250,
    cantidad: priced.cantidad
  };
}

export async function prepararResumenCarrito(carrito = [], clienteId = null, welcomeProductId = null) {
  const rawItems = [];
  for (const item of carrito) {
    const productoId = positiveInt(item.productoId);
    const cantidad = positiveInt(item.cantidad);
    if (!productoId || !cantidad) continue;

    const producto = await ProductoService.obtenerPorId(productoId);
    if (!producto || producto.tipoVenta === 'CONSULTA' || producto.precio === null || producto.stock < 1) continue;
    rawItems.push({ producto, cantidad: Math.min(cantidad, producto.stock) });
  }
  const [client, settings] = await Promise.all([
    clienteId ? prisma.cliente.findUnique({ where: { id: clienteId } }) : null,
    PromotionSettingsService.get()
  ]);
  const eligibleClient = await WelcomeDiscountService.clientWithUsage(prisma, client);
  const pricing = calculatePromotions(rawItems, eligibleClient, settings, welcomeProductId);
  const items = pricing.items.map(toCartItem);
  const baseShipping = shippingSummary(items);
  const benefitShipping = shippingWithPromotions(
    baseShipping.pesoTotalGramos, pricing.totals.final, settings
  );
  return {
    carrito: items,
    subtotal: pricing.totals.final,
    subtotalOriginal: pricing.totals.original,
    discounts: pricing.totals,
    welcomeProductId: pricing.welcomeProductId,
    welcomeAvailable: Boolean(eligibleClient && settings.bienvenidaActiva
      && !eligibleClient.bienvenidaUsadaEn),
    promotions: settings,
    shipping: { ...baseShipping, ...benefitShipping }
  };
}
