import prisma from '../config/db.js';

async function restaurarPedidosActivos(tx, clienteId) {
  const pedidos = await tx.pedido.findMany({
    where: {
      clienteId,
      estado: { in: ['PENDIENTE_VERIFICACION', 'PAGO_CONFIRMADO', 'EN_PREPARACION', 'ENVIADO'] }
    },
    include: { items: true }
  });

  for (const pedido of pedidos) {
    for (const item of pedido.items) {
      await tx.producto.update({
        where: { id: item.productoId },
        data: { stock: { increment: item.cantidad } }
      });
    }
  }
}

export class AdminClientService {
  static async eliminarCliente(clienteId) {
    return prisma.$transaction(async (tx) => {
      const cliente = await tx.cliente.findUnique({ where: { id: clienteId } });
      if (!cliente) throw new Error('Cliente no encontrado.');
      await restaurarPedidosActivos(tx, clienteId);
      await tx.ticketSoporte.deleteMany({ where: { clienteId } });
      await tx.pedido.deleteMany({ where: { clienteId } });
      await tx.direccionCliente.deleteMany({ where: { clienteId } });
      await tx.cliente.delete({ where: { id: clienteId } });
      return cliente;
    });
  }
}
