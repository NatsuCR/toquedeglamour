import prisma from '../config/db.js';
import { FinanceExpensesService } from './finance-expenses.service.js';
import { FinanceStatsService } from './finance-stats.service.js';
import { FinanceSalesDataService } from './finance-sales-data.service.js';
import { dateWhere, details, localSale, webSale } from './finance-export-mappers.service.js';
import { InventoryLossService } from './inventory-loss.service.js';

const includeProducts = {
  comprobantePago: true,
  items: { include: { producto: { include: { categoria: true, subcategoria: true } } } }
};

function expenseProof(expense, query) {
  if (!expense.comprobanteRuta) return '';
  const base = query.siteUrl || 'http://localhost:3000';
  return {
    text: expense.comprobanteNombre || 'Ver comprobante',
    hyperlink: `${base}${expense.comprobanteRuta}`
  };
}

export class FinanceExportDataService {
  static async build(query = {}) {
    const [summary, expenses, orders, localSales, inventoryLosses] = await Promise.all([
      FinanceStatsService.resumen(query),
      FinanceExpensesService.listar(query),
      prisma.pedido.findMany({
        where: dateWhere(query),
        orderBy: { creadoEn: 'asc' },
        include: includeProducts
      }),
      FinanceSalesDataService.list(query),
      InventoryLossService.list(query)
    ]);
    const sales = [...orders.map(webSale), ...localSales.map(localSale)]
      .sort((a, b) => a.fecha - b.fecha);
    const webDetails = orders.flatMap((order) => details({ ...order, iva: order.ivaIncluido }, 'TIENDA WEB'));
    const localDetails = localSales.flatMap((sale) => details(sale, 'VENTA PRESENCIAL'));
    const losses = inventoryLosses.map((loss) => ({
      fecha: loss.creadoEn,
      sku: `PRD-${String(loss.productoId).padStart(4, '0')}`,
      producto: loss.producto.nombre,
      cantidad: loss.cantidad,
      costoUnitario: Number(loss.costoUnitario),
      montoPerdida: Number(loss.montoPerdida),
      motivo: loss.motivo,
      responsable: loss.administrador.correo
    }));
    const mappedExpenses = expenses.map((expense) => ({
      ...expense,
      comprobante: expenseProof(expense, query)
    }));
    return { summary, expenses: mappedExpenses, losses, sales, detail: [...webDetails, ...localDetails], query };
  }
}
