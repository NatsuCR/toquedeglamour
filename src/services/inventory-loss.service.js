import prisma from '../config/db.js';
import { roundMoney } from '../utils/money.js';
import { dateRange } from './finance-expenses.service.js';

const parsePositiveInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
};

export class InventoryLossService {
  static async products() {
    return prisma.producto.findMany({
      where: { tipoVenta: 'DIRECTA', stock: { gt: 0 } },
      orderBy: [{ categoria: { nombre: 'asc' } }, { nombre: 'asc' }],
      include: { categoria: true, subcategoria: true }
    });
  }

  static async list(query = {}) {
    const { from, to } = dateRange(query);
    const where = {};
    if (from || to) where.creadoEn = {};
    if (from) where.creadoEn.gte = from;
    if (to) where.creadoEn.lte = to;
    return prisma.mermaInventario.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
      include: { producto: true, administrador: true }
    });
  }

  static async create(data, adminId) {
    const productId = parsePositiveInt(data.productoId);
    const quantity = parsePositiveInt(data.cantidad);
    const reason = String(data.motivo || '').trim();
    if (!productId || !quantity || reason.length < 5) {
      throw new Error('Selecciona un producto, una cantidad válida y explica el motivo.');
    }
    return prisma.$transaction(async (tx) => {
      const product = await tx.producto.findUnique({ where: { id: productId } });
      if (!product || product.tipoVenta !== 'DIRECTA') throw new Error('Producto no disponible para ajuste.');
      const updated = await tx.producto.updateMany({
        where: { id: productId, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } }
      });
      if (updated.count !== 1) throw new Error(`Solo hay ${product.stock} unidades disponibles.`);
      const unitCost = roundMoney(product.costo);
      return tx.mermaInventario.create({
        data: {
          productoId: productId,
          registradoPor: Number(adminId),
          cantidad: quantity,
          costoUnitario: unitCost,
          montoPerdida: roundMoney(unitCost * quantity),
          motivo: reason
        }
      });
    });
  }

  static summarize(items) {
    return items.reduce((result, item) => ({
      amount: result.amount + roundMoney(item.montoPerdida),
      units: result.units + item.cantidad
    }), { amount: 0, units: 0 });
  }
}
