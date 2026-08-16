import { roundMoney } from '../utils/money.js';
import { calculateCartWeight } from './shipping.service.js';
import { calculatePromotions } from './promotion-pricing.service.js';

export async function prepararItemsPedido(tx, carrito, cliente, promotions, welcomeProductId) {
  if (!Array.isArray(carrito) || carrito.length === 0) {
    throw new Error('El carrito esta vacio.');
  }

  const products = [];

  for (const item of carrito) {
    const productoId = Number.parseInt(item.productoId, 10);
    const cantidad = Number.parseInt(item.cantidad, 10);
    if (!productoId || !cantidad || cantidad < 1) {
      throw new Error('Hay un producto invalido en el carrito.');
    }

    const producto = await tx.producto.findUnique({ where: { id: productoId } });
    if (!producto || producto.tipoVenta === 'CONSULTA' || producto.precio === null || producto.stock < cantidad) {
      throw new Error(`Stock insuficiente para ${item.nombre || 'un producto'}.`);
    }

    const updated = await tx.producto.updateMany({
      where: { id: productoId, stock: { gte: cantidad } },
      data: { stock: { decrement: cantidad } }
    });
    if (updated.count !== 1) {
      throw new Error(`Stock insuficiente para ${producto.nombre}.`);
    }

    products.push({ producto, cantidad });
  }
  const pricing = calculatePromotions(products, cliente, promotions, welcomeProductId);
  const items = pricing.items.map((item) => ({
    productoId: item.producto.id,
    cantidad: item.cantidad,
    precioUnitario: item.finalUnit,
    precioOriginal: item.originalUnit,
    descuentoTotal: item.discountTotal,
    costoUnitario: roundMoney(item.producto.costo || 0),
    pesoUnitarioGramos: Number.parseInt(item.producto.pesoGramos, 10) || 250
  }));
  return {
    items,
    subtotal: pricing.totals.final,
    subtotalOriginal: pricing.totals.original,
    discounts: pricing.totals,
    welcomeProductId: pricing.welcomeProductId,
    pesoTotalGramos: calculateCartWeight(items)
  };
}
