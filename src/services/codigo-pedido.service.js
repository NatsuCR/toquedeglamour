import prisma from '../config/db.js';

const CODIGO_PATTERN = /^\d{4}-\d+$/;

export class CodigoPedidoService {
  static async generarCodigo(db = prisma, preferido = null) {
    const limpio = String(preferido || '').trim();
    if (CODIGO_PATTERN.test(limpio)) {
      if (await this.existe(db, limpio)) {
        throw new Error('El codigo de pedido vencio. Recarga el checkout para generar uno nuevo.');
      }
      return limpio;
    }

    const totalPedidos = await db.pedido.count();
    for (let intento = 1; intento <= 30; intento += 1) {
      const prefijo = String(totalPedidos + intento).padStart(4, '0');
      const codigo = `${prefijo}-${Date.now() + intento}`;
      if (!(await this.existe(db, codigo))) return codigo;
    }

    throw new Error('No se pudo generar un codigo de pedido unico.');
  }

  static async existe(db, codigo) {
    const pedido = await db.pedido.findUnique({
      where: { codigo },
      select: { id: true }
    });
    return Boolean(pedido);
  }
}
