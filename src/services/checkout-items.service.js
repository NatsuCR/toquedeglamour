import { roundMoney } from '../utils/money.js';

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

    await tx.producto.update({
      where: { id: productoId },
      data: { stock: { decrement: cantidad } }
    });

    const precioUnitario = roundMoney(producto.precio);
    subtotal += precioUnitario * cantidad;
    items.push({
      productoId,
      cantidad,
      precioUnitario,
      costoUnitario: roundMoney(producto.costo || 0)
    });
  }

  return { items, subtotal };
}
