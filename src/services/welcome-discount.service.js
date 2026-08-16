export class WelcomeDiscountService {
  static async clientWithUsage(db, client) {
    if (!client || client.bienvenidaUsadaEn) return client;
    const order = await db.pedido.findFirst({
      where: {
        clienteId: client.id,
        descuentoBienvenida: { gt: 0 }
      },
      select: { creadoEn: true },
      orderBy: { creadoEn: 'asc' }
    });
    if (!order) return client;
    await db.cliente.update({
      where: { id: client.id },
      data: { bienvenidaUsadaEn: order.creadoEn }
    });
    return { ...client, bienvenidaUsadaEn: order.creadoEn };
  }

  static async consume(db, clientId) {
    const result = await db.cliente.updateMany({
      where: { id: clientId, bienvenidaUsadaEn: null },
      data: { bienvenidaUsadaEn: new Date() }
    });
    if (result.count !== 1) {
      throw new Error('El descuento de bienvenida ya fue utilizado. Actualizá el carrito.');
    }
  }
}
