import prisma from '../config/db.js';
import { roundMoney } from '../utils/money.js';
import { FinanceSettingsService } from './finance-settings.service.js';
import { FinanceExpensesService, dateRange } from './finance-expenses.service.js';

function pedidoWhere(query = {}) {
  const { from, to } = dateRange(query);
  const where = { estado: { not: 'RECHAZADO' } };
  if (from || to) where.creadoEn = {};
  if (from) where.creadoEn.gte = from;
  if (to) where.creadoEn.lte = to;
  return where;
}

function emptyKpis(settings) {
  return {
    totalConIva: 0,
    totalSinIva: 0,
    ivaEstimado: 0,
    gananciaTotal: 0,
    gananciaNeta: 0,
    costosProductos: 0,
    gastosAdicionales: 0,
    ivaActivo: settings.ivaActivo,
    ivaPorcentaje: settings.ivaPorcentaje
  };
}

function sumarPedidos(pedidos) {
  let totalSinIva = 0;
  let totalConIva = 0;
  let ivaEstimado = 0;
  let costosProductos = 0;
  const porFecha = {};
  const productos = {};
  const categorias = {};

  pedidos.forEach((pedido) => {
    const fecha = pedido.creadoEn.toISOString().split('T')[0];
    porFecha[fecha] ||= { ingresos: 0, costos: 0, gastos: 0, iva: 0, neta: 0 };
    const total = roundMoney(pedido.total);
    const base = roundMoney(pedido.subtotal) + roundMoney(pedido.costoEnvio || 0);
    const iva = Math.max(0, total - base);
    totalConIva += total;
    totalSinIva += total - iva;
    ivaEstimado += iva;
    porFecha[fecha].ingresos += total - iva;
    porFecha[fecha].iva += iva;

    pedido.items.forEach((item) => {
      const costo = roundMoney(item.costoUnitario || 0) * item.cantidad;
      const venta = roundMoney(item.precioUnitario) * item.cantidad;
      costosProductos += costo;
      porFecha[fecha].costos += costo;
      const prod = item.producto?.nombre || `Producto #${item.productoId}`;
      productos[prod] = (productos[prod] || 0) + item.cantidad;
      const cat = item.producto?.categoria?.nombre || 'Sin categoria';
      categorias[cat] = (categorias[cat] || 0) + venta - costo;
    });
  });
  return { totalSinIva, totalConIva, ivaEstimado, costosProductos, porFecha, productos, categorias };
}

function aplicarGastos(porFecha, gastos) {
  gastos.forEach((gasto) => {
    const fecha = gasto.fecha.toISOString().split('T')[0];
    porFecha[fecha] ||= { ingresos: 0, costos: 0, gastos: 0, iva: 0, neta: 0 };
    porFecha[fecha].gastos += gasto.monto;
  });
}

function top(map, valueKey) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nombre, value]) => ({ nombre, [valueKey]: value }));
}

export class FinanceStatsService {
  static async resumen(query = {}) {
    const [settings, gastos, pedidos] = await Promise.all([
      FinanceSettingsService.obtener(),
      FinanceExpensesService.listar(query),
      prisma.pedido.findMany({
        where: pedidoWhere(query),
        include: { items: { include: { producto: { include: { categoria: true } } } } },
        orderBy: { creadoEn: 'asc' }
      })
    ]);
    const base = sumarPedidos(pedidos);
    aplicarGastos(base.porFecha, gastos);
    const gastosAdicionales = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
    const gananciaTotal = base.totalSinIva - base.costosProductos;
    const kpis = {
      ...emptyKpis(settings),
      totalSinIva: base.totalSinIva,
      totalConIva: base.totalConIva,
      ivaEstimado: base.ivaEstimado,
      costosProductos: base.costosProductos,
      gastosAdicionales,
      gananciaTotal,
      gananciaNeta: gananciaTotal - gastosAdicionales
    };
    Object.values(base.porFecha).forEach((row) => {
      row.neta = row.ingresos - row.costos - row.gastos;
    });
    return {
      kpis,
      graficos: {
        evolucion: base.porFecha,
        topProductos: top(base.productos, 'cantidad'),
        topCategorias: top(base.categorias, 'ganancia')
      }
    };
  }
}
