import { roundMoney } from '../utils/money.js';
import { dateRange } from './finance-expenses.service.js';

export const emptyFlowRow = () => ({
  ingresos: 0, costos: 0, gastos: 0, comisiones: 0, perdidas: 0, iva: 0, neta: 0
});

export function orderWhere(query = {}) {
  const { from, to } = dateRange(query);
  const where = { estado: { not: 'RECHAZADO' } };
  if (from || to) where.creadoEn = {};
  if (from) where.creadoEn.gte = from;
  if (to) where.creadoEn.lte = to;
  return where;
}

export function emptyFinanceKpis(settings) {
  return {
    totalConIva: 0, totalSinIva: 0, ivaEstimado: 0,
    gananciaTotal: 0, gananciaNeta: 0, costosProductos: 0,
    gastosAdicionales: 0, perdidasInventario: 0, unidadesPerdidas: 0,
    comisionesEmpleados: 0, montoVentasLocal: 0, cantidadVentasLocal: 0,
    ivaActivo: settings.ivaActivo, ivaPorcentaje: settings.ivaPorcentaje
  };
}

export function sumOrders(orders) {
  const result = {
    totalSinIva: 0, totalConIva: 0, ivaEstimado: 0, costosProductos: 0,
    porFecha: {}, productos: {}, categorias: {}
  };
  orders.forEach((order) => {
    const date = order.creadoEn.toISOString().split('T')[0];
    result.porFecha[date] ||= emptyFlowRow();
    const total = roundMoney(order.total);
    const base = roundMoney(order.subtotal) + roundMoney(order.costoEnvio || 0);
    const tax = Math.max(0, total - base);
    result.totalConIva += total;
    result.totalSinIva += total - tax;
    result.ivaEstimado += tax;
    result.porFecha[date].ingresos += total - tax;
    result.porFecha[date].iva += tax;
    order.items.forEach((item) => {
      const cost = roundMoney(item.costoUnitario || 0) * item.cantidad;
      const sale = roundMoney(item.precioUnitario) * item.cantidad;
      result.costosProductos += cost;
      result.porFecha[date].costos += cost;
      const product = item.producto?.nombre || `Producto #${item.productoId}`;
      const category = item.producto?.categoria?.nombre || 'Sin categoría';
      result.productos[product] = (result.productos[product] || 0) + item.cantidad;
      result.categorias[category] = (result.categorias[category] || 0) + sale - cost;
    });
  });
  return result;
}

export function applyExpenses(rows, expenses) {
  expenses.forEach((expense) => {
    const date = expense.fecha.toISOString().split('T')[0];
    rows[date] ||= emptyFlowRow();
    rows[date].gastos += expense.monto;
  });
}

export function applyLosses(rows, losses) {
  losses.forEach((loss) => {
    const date = loss.creadoEn.toISOString().split('T')[0];
    rows[date] ||= emptyFlowRow();
    rows[date].perdidas += roundMoney(loss.montoPerdida);
  });
}

export const topFinanceEntries = (map, valueKey) => Object.entries(map)
  .sort((a, b) => b[1] - a[1]).slice(0, 5)
  .map(([nombre, value]) => ({ nombre, [valueKey]: value }));
