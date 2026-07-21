import { ProductoService } from './producto.service.js';
import { roundMoney } from '../utils/money.js';
import { shippingSummary } from './shipping.service.js';

const positiveInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

function toCartItem(producto, cantidad) {
  return {
    productoId: producto.id,
    nombre: producto.nombre,
    precio: roundMoney(producto.precio),
    imagenUrl: producto.imagenUrl,
    pesoGramos: producto.pesoGramos || 250,
    cantidad
  };
}

export async function prepararResumenCarrito(carrito = []) {
  const items = [];
  for (const item of carrito) {
    const productoId = positiveInt(item.productoId);
    const cantidad = positiveInt(item.cantidad);
    if (!productoId || !cantidad) continue;

    const producto = await ProductoService.obtenerPorId(productoId);
    if (!producto || producto.tipoVenta === 'CONSULTA' || producto.precio === null || producto.stock < 1) continue;
    items.push(toCartItem(producto, Math.min(cantidad, producto.stock)));
  }

  const subtotal = items.reduce((sum, item) => sum + roundMoney(item.precio) * item.cantidad, 0);
  return {
    carrito: items,
    subtotal,
    shipping: shippingSummary(items)
  };
}
