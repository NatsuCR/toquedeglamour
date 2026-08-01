import prisma from '../config/db.js';
import { FinanceSettingsService } from './finance-settings.service.js';
import { FinanceExpensesService } from './finance-expenses.service.js';
import { FinanceSalesDataService, mergeFinanceSummary } from './finance-sales-data.service.js';
import { InventoryLossService } from './inventory-loss.service.js';
import {
  applyExpenses,
  applyLosses,
  emptyFinanceKpis,
  orderWhere,
  sumOrders,
  topFinanceEntries
} from './finance-summary-utils.service.js';

export class FinanceStatsService {
  static async resumen(query = {}) {
    const [settings, expenses, orders, localSales, losses] = await Promise.all([
      FinanceSettingsService.obtener(),
      FinanceExpensesService.listar(query),
      prisma.pedido.findMany({
        where: orderWhere(query),
        include: { items: { include: { producto: { include: { categoria: true } } } } },
        orderBy: { creadoEn: 'asc' }
      }),
      FinanceSalesDataService.list(query),
      InventoryLossService.list(query)
    ]);
    const sales = FinanceSalesDataService.summarize(localSales);
    const base = mergeFinanceSummary(sumOrders(orders), sales);
    applyExpenses(base.porFecha, expenses);
    applyLosses(base.porFecha, losses);
    const extraExpenses = expenses.reduce((sum, item) => sum + item.monto, 0);
    const lossSummary = InventoryLossService.summarize(losses);
    const grossProfit = base.totalSinIva - base.costosProductos;
    const kpis = {
      ...emptyFinanceKpis(settings),
      totalSinIva: base.totalSinIva,
      totalConIva: base.totalConIva,
      ivaEstimado: base.ivaEstimado,
      costosProductos: base.costosProductos,
      gastosAdicionales: extraExpenses,
      perdidasInventario: lossSummary.amount,
      unidadesPerdidas: lossSummary.units,
      comisionesEmpleados: sales.comisiones,
      montoVentasLocal: sales.ventasLocal,
      cantidadVentasLocal: sales.cantidadVentasLocal,
      gananciaTotal: grossProfit,
      gananciaNeta: grossProfit - extraExpenses - sales.comisiones - lossSummary.amount
    };
    Object.values(base.porFecha).forEach((row) => {
      row.neta = row.ingresos - row.costos - row.gastos - row.comisiones - row.perdidas;
    });
    return {
      kpis,
      graficos: {
        evolucion: base.porFecha,
        topProductos: topFinanceEntries(base.productos, 'cantidad'),
        topCategorias: topFinanceEntries(base.categorias, 'ganancia')
      }
    };
  }
}
