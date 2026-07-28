import ExcelJS from 'exceljs';
import {
  DETAIL_COLUMNS,
  EXPENSE_COLUMNS,
  SALES_COLUMNS,
  SUMMARY_COLUMNS
} from './finance-export-columns.js';

const HEADER = '7B2446';
const GOLD = 'C7964A';
const PALE = 'F8EAF0';
const MONEY = '"₡"#,##0';

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
    row.alignment = { vertical: 'top', wrapText: true };
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

function addReadme(workbook, data) {
  const sheet = workbook.addWorksheet('LEAME', { properties: { tabColor: { argb: `FF${GOLD}` } } });
  sheet.columns = [{ width: 28 }, { width: 92 }];
  sheet.addRows([
    ['Reporte', 'Control financiero y auxiliar de comprobantes - Toque de Glamour'],
    ['Periodo', `${data.query.fechaInicio || 'Inicio'} a ${data.query.fechaFin || 'Actualidad'}`],
    ['Normativa de referencia', 'Comprobantes electronicos de Costa Rica, estructura version 4.4.'],
    ['Alcance', 'Libro interno para conciliacion, inventario, IVA, costos y comisiones.'],
    ['Importante', 'No sustituye la factura o tiquete electronico XML firmado y validado por Hacienda.'],
    ['Campos pendientes oficiales', 'Clave de 50 digitos, consecutivo, actividad economica, datos del emisor y respuesta de Hacienda.'],
    ['Criterio de comision', '10% del subtotal sin IVA para ventas registradas por empleados; administrador 0%.'],
    ['Cancelaciones', 'Los pedidos rechazados se conservan para auditoria, pero no integran los indicadores financieros.']
  ]);
  sheet.getColumn(1).font = { bold: true, color: { argb: `FF${HEADER}` } };
  sheet.eachRow((row) => { row.alignment = { vertical: 'top', wrapText: true }; });
}

export class FinanceExportWorkbookService {
  static async create(data) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Toque de Glamour';
    workbook.created = new Date();
    addReadme(workbook, data);
    const kpis = Object.entries(data.summary.kpis).filter(([, value]) => typeof value === 'number');
    const summary = addRows(workbook, 'Resumen', SUMMARY_COLUMNS,
      kpis.map(([key, value]) => ({ indicador: key, monto: value })));
    moneyColumns(summary, ['monto']);
    const sales = addRows(workbook, 'Ventas', SALES_COLUMNS, data.sales);
    moneyColumns(sales, ['subtotalProductos', 'envio', 'baseSinIva', 'iva', 'total', 'costos', 'comision', 'neto']);
    sales.getColumn('fecha').numFmt = 'dd/mm/yyyy hh:mm';
    const detail = addRows(workbook, 'Detalle productos', DETAIL_COLUMNS, data.detail);
    moneyColumns(detail, ['precioUnitario', 'subtotal', 'iva', 'totalLinea', 'costo']);
    detail.getColumn('tarifaIva').numFmt = '0.00%';
    const expenses = addRows(workbook, 'Gastos', EXPENSE_COLUMNS, data.expenses);
    moneyColumns(expenses, ['monto']);
    expenses.getColumn('fecha').numFmt = 'dd/mm/yyyy';
    return workbook.xlsx.writeBuffer();
  }
}
