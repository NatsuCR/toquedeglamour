import prisma from '../config/db.js';
import { FinanceExpensesService } from './finance-expenses.service.js';
import { FinanceStatsService } from './finance-stats.service.js';
import { FinanceSalesDataService } from './finance-sales-data.service.js';
import { dateWhere, details, localSale, webSale } from './finance-export-mappers.service.js';

const includeProducts = {
  comprobantePago: true,
  items: { include: { producto: { include: { categoria: true, subcategoria: true } } } }
};

export class FinanceExportDataService {
  static async build(query = {}) {
    const [summary, expenses, orders, localSales] = await Promise.all([
      FinanceStatsService.resumen(query),
      FinanceExpensesService.listar(query),
      prisma.pedido.findMany({
        where: dateWhere(query),
        orderBy: { creadoEn: 'asc' },
        include: includeProducts
      }),
      FinanceSalesDataService.list(query)
    ]);
    const sales = [...orders.map(webSale), ...localSales.map(localSale)]
      .sort((a, b) => a.fecha - b.fecha);
    const webDetails = orders.flatMap((order) => details({
      ...order,
      iva: Math.max(0, order.total - order.subtotal - order.costoEnvio)
    }, 'TIENDA WEB'));
    const localDetails = localSales.flatMap((sale) => details(sale, 'VENTA PRESENCIAL'));
    return { summary, expenses, sales, detail: [...webDetails, ...localDetails], query };
  }
}
