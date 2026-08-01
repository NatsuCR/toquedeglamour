import { roundMoney } from '../utils/money.js';
import { calculateCartWeight } from './shipping.service.js';

export async function prepararItemsPedido(tx, carrito) {
  if (!Array.isArray(carrito) || carrito.length === 0) {
    throw new Error('El carrito esta vacio.');
  }

  let subtotal = 0;
  const items = [];

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

    const precioUnitario = roundMoney(producto.precio);
    const pesoUnitarioGramos = Number.parseInt(producto.pesoGramos, 10) || 250;
    subtotal += precioUnitario * cantidad;
    items.push({
      productoId,
      cantidad,
      precioUnitario,
      costoUnitario: roundMoney(producto.costo || 0),
      pesoUnitarioGramos
    });
  }

  return { items, subtotal, pesoTotalGramos: calculateCartWeight(items) };
}
