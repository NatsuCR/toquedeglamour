import ExcelJS from 'exceljs';
import {
  DETAIL_COLUMNS,
  EXPENSE_COLUMNS,
  LOSS_COLUMNS,
  SALES_COLUMNS,
  SUMMARY_COLUMNS
} from './finance-export-columns.js';
import { addFinanceCover } from './finance-export-cover.service.js';

const HEADER = '7B2446';
const PALE = 'F8EAF0';
const MONEY = '"\u20a1"#,##0';
const PERCENT = '0.00%';

const SUMMARY_LABELS = {
  totalConIva: ['Total con IVA', 'dinero'],
  totalSinIva: ['Total sin IVA', 'dinero'],
  ivaEstimado: ['IVA estimado', 'dinero'],
  gananciaTotal: ['Ganancia total', 'dinero'],
  gananciaNeta: ['Ganancia neta', 'dinero'],
  costosProductos: ['Costos de productos', 'dinero'],
  gastosAdicionales: ['Gastos adicionales', 'dinero'],
  perdidasInventario: ['Perdidas de inventario', 'dinero'],
  unidadesPerdidas: ['Unidades perdidas', 'cantidad'],
  comisionesEmpleados: ['Comisiones de empleados', 'dinero'],
  montoVentasLocal: ['Monto de ventas presenciales', 'dinero'],
  cantidadVentasLocal: ['Ventas presenciales registradas', 'cantidad'],
  ivaPorcentaje: ['Porcentaje de IVA', 'porcentaje'],
  ivaActivo: ['IVA activo', 'estado']
};

function styleSheet(sheet) {
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: 'A1', to: sheet.getRow(1).getCell(sheet.columnCount).address };
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${HEADER}` } };
    cell.alignment = { vertical: 'middle', wrapText: true };
  });
  sheet.getRow(1).height = 30;
  sheet.eachRow((row, index) => {
    if (index > 1 && index % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${PALE}` } };
      });
    }
    row.height = index === 1 ? 30 : 24;
    row.alignment = { vertical: 'middle', wrapText: index === 1 };
  });
}

function addRows(workbook, name, columns, rows) {
  const sheet = workbook.addWorksheet(name);
  sheet.columns = columns;
  sheet.addRows(rows);
  styleSheet(sheet);
  return sheet;
}

function moneyColumns(sheet, keys) {
  keys.forEach((key) => { sheet.getColumn(key).numFmt = MONEY; });
}

function linkColumn(sheet, key) {
  sheet.getColumn(key).eachCell((cell, index) => {
    if (index === 1 || !cell.value?.hyperlink) return;
    cell.font = { color: { argb: 'FF0563C1' }, underline: true };
  });
}

function summaryRows(kpis) {
  return Object.entries(kpis).map(([key, value]) => {
    const [label, type] = SUMMARY_LABELS[key] || [key, 'valor'];
    return {
      indicador: label,
      valor: type === 'porcentaje' ? Number(value || 0) / 100 : value,
      tipo: type
    };
  });
}

function styleSummary(sheet) {
  moneyColumns(sheet, ['valor']);
  sheet.eachRow((row, index) => {
    if (index === 1) return;
    const type = row.getCell('tipo').value;
    if (type === 'cantidad') row.getCell('valor').numFmt = '#,##0';
    if (type === 'porcentaje') row.getCell('valor').numFmt = PERCENT;
    if (type === 'estado') row.getCell('valor').numFmt = 'General';
  });
}

function addReadme(workbook, data) {
  return addFinanceCover(workbook, data);
}

export class FinanceExportWorkbookService {
  static async create(data) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Toque de Glamour';
    workbook.created = new Date();
    addReadme(workbook, data);
    const summary = addRows(workbook, 'Resumen', SUMMARY_COLUMNS, summaryRows(data.summary.kpis));
    styleSummary(summary);
    const sales = addRows(workbook, 'Ventas', SALES_COLUMNS, data.sales);
    moneyColumns(sales, ['subtotalProductos', 'envio', 'baseSinIva', 'iva', 'total', 'costos', 'comision', 'neto']);
    sales.getColumn('fecha').numFmt = 'dd/mm/yyyy hh:mm';
    const detail = addRows(workbook, 'Detalle productos', DETAIL_COLUMNS, data.detail);
    moneyColumns(detail, ['precioUnitario', 'costoUnitario', 'subtotal', 'iva', 'totalLinea', 'costoTotal']);
    detail.getColumn('tarifaIva').numFmt = '0.00%';
    const expenses = addRows(workbook, 'Gastos adicionales', EXPENSE_COLUMNS, data.expenses);
    moneyColumns(expenses, ['monto']);
    linkColumn(expenses, 'comprobante');
    expenses.getColumn('fecha').numFmt = 'dd/mm/yyyy';
    const losses = addRows(workbook, 'Mermas inventario', LOSS_COLUMNS, data.losses);
    moneyColumns(losses, ['costoUnitario', 'montoPerdida']);
    losses.getColumn('fecha').numFmt = 'dd/mm/yyyy hh:mm';
    return workbook.xlsx.writeBuffer();
  }
}
