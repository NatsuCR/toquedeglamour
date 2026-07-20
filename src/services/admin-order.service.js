import prisma from '../config/db.js';

export const pedidoIncludeCompleto = {
  cliente: true,
  items: { include: { producto: true } },
  direccionEnvio: true,
  comprobantePago: true
};

async function restaurarStock(tx, items) {
  for (const item of items) {
    await tx.producto.update({
      where: { id: item.productoId },
      data: { stock: { increment: item.cantidad } }
    });
  }
}

async function reservarStock(tx, items) {
  for (const item of items) {
    const result = await tx.producto.updateMany({
      where: { id: item.productoId, stock: { gte: item.cantidad } },
      data: { stock: { decrement: item.cantidad } }
    });
    if (result.count === 0) throw new Error(`Stock insuficiente para reactivar ${item.producto?.nombre || 'producto'}.`);
  }
}

function estaCompletado(pedido) {
  return pedido.estado === 'ENTREGADO' || pedido.fase === 'COMPLETADO';
}

export class AdminOrderService {
  static async actualizarPedido(pedidoId, data) {
    return prisma.$transaction(async (tx) => {
      const actual = await tx.pedido.findUnique({
        where: { id: pedidoId },
        include: pedidoIncludeCompleto
      });
      if (!actual) throw new Error('Pedido no encontrado.');

      const nuevoEstado = data.estado || actual.estado;
      if (actual.estado !== 'RECHAZADO' && nuevoEstado === 'RECHAZADO') {
        await restaurarStock(tx, actual.items);
      }
      if (actual.estado === 'RECHAZADO' && nuevoEstado !== 'RECHAZADO') {
        await reservarStock(tx, actual.items);
      }

      const pedido = await tx.pedido.update({
        where: { id: pedidoId },
        data,
        include: pedidoIncludeCompleto
      });
      return { pedido, completadoNuevo: !estaCompletado(actual) && estaCompletado(pedido) };
    });
  }
}
