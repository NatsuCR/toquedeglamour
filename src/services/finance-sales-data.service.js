import prisma from '../config/db.js';
import { roundMoney } from '../utils/money.js';
import { dateRange } from './finance-expenses.service.js';
import { emptyFlowRow } from './finance-summary-utils.service.js';

export class FinanceSalesDataService {
  static async list(query = {}) {
    const { from, to } = dateRange(query);
    const where = {};
    if (from || to) where.creadoEn = {};
    if (from) where.creadoEn.gte = from;
    if (to) where.creadoEn.lte = to;
    return prisma.ventaPresencial.findMany({
      where,
      orderBy: { creadoEn: 'asc' },
      include: {
        adjuntos: true,
        vendedor: true,
        items: { include: { producto: { include: { categoria: true, subcategoria: true } } } }
      }
    });
  }

  static summarize(sales) {
    const result = {
      totalSinIva: 0,
      totalConIva: 0,
      ivaEstimado: 0,
      costosProductos: 0,
      comisiones: 0,
      ventasLocal: 0,
      cantidadVentasLocal: 0,
      porFecha: {},
      productos: {},
      categorias: {}
    };
    sales.forEach((sale) => {
      const date = sale.creadoEn.toISOString().split('T')[0];
      result.porFecha[date] ||= emptyFlowRow();
      result.ventasLocal = (result.ventasLocal || 0) + roundMoney(sale.total);
      result.cantidadVentasLocal = (result.cantidadVentasLocal || 0) + 1;
      result.totalSinIva += roundMoney(sale.total) - roundMoney(sale.iva);
      result.totalConIva += roundMoney(sale.total);
      result.ivaEstimado += roundMoney(sale.iva);
      result.comisiones += roundMoney(sale.comision);
      result.porFecha[date].ingresos += roundMoney(sale.total) - roundMoney(sale.iva);
      result.porFecha[date].iva += roundMoney(sale.iva);
      result.porFecha[date].comisiones += roundMoney(sale.comision);
      const netRatio = Number(sale.total) > 0
        ? (roundMoney(sale.total) - roundMoney(sale.iva)) / roundMoney(sale.total) : 1;
      sale.items.forEach((item) => {
        const cost = roundMoney(item.costoUnitario) * item.cantidad;
        const income = roundMoney(item.precioUnitario) * item.cantidad;
        const name = item.producto?.nombre || `Producto #${item.productoId}`;
        const category = item.producto?.categoria?.nombre || 'Sin categoria';
        result.costosProductos += cost;
        result.porFecha[date].costos += cost;
        result.productos[name] = (result.productos[name] || 0) + item.cantidad;
        result.categorias[category] = (result.categorias[category] || 0)
          + roundMoney(income * netRatio) - cost;
      });
    });
    return result;
  }
}

export function mergeFinanceSummary(base, extra) {
  ['totalSinIva', 'totalConIva', 'ivaEstimado', 'costosProductos'].forEach((key) => {
    base[key] += extra[key];
  });
  ['productos', 'categorias'].forEach((group) => {
    Object.entries(extra[group]).forEach(([key, value]) => {
      base[group][key] = (base[group][key] || 0) + value;
    });
  });
  Object.entries(extra.porFecha).forEach(([date, values]) => {
    base.porFecha[date] ||= emptyFlowRow();
    Object.entries(values).forEach(([key, value]) => {
      base.porFecha[date][key] = (base.porFecha[date][key] || 0) + value;
    });
  });
  return base;
}
