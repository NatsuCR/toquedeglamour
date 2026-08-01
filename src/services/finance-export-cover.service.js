const HEADER = '7B2446';
const GOLD = 'C7964A';
const SOFT = 'F8EAF0';
const WHITE = 'FFFFFF';

function cell(sheet, address, value, style = {}) {
  const target = sheet.getCell(address);
  target.value = value;
  Object.assign(target, style);
  return target;
}

function mergeLabel(sheet, row, label, value) {
  sheet.mergeCells(`A${row}:B${row}`);
  sheet.mergeCells(`C${row}:F${row}`);
  cell(sheet, `A${row}`, label, {
    font: { bold: true, color: { argb: `FF${HEADER}` } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${SOFT}` } }
  });
  cell(sheet, `C${row}`, value, {
    font: { color: { argb: 'FF32121F' } }
  });
}

function styleRange(sheet, from, to) {
  for (let row = from; row <= to; row += 1) {
    sheet.getRow(row).height = row === 1 ? 42 : 24;
    sheet.getRow(row).eachCell((item) => {
      item.alignment = { vertical: 'middle', wrapText: true };
      item.border = {
        top: { style: 'thin', color: { argb: 'FFE8CDD8' } },
        left: { style: 'thin', color: { argb: 'FFE8CDD8' } },
        bottom: { style: 'thin', color: { argb: 'FFE8CDD8' } },
        right: { style: 'thin', color: { argb: 'FFE8CDD8' } }
      };
    });
  }
}

export function addFinanceCover(workbook, data) {
  const sheet = workbook.addWorksheet('Portada', { properties: { tabColor: { argb: `FF${GOLD}` } } });
  sheet.columns = [{ width: 18 }, { width: 18 }, { width: 20 }, { width: 22 }, { width: 22 }, { width: 28 }];
  sheet.mergeCells('A1:F1');
  cell(sheet, 'A1', 'Reporte financiero - Toque de Glamour', {
    font: { bold: true, size: 22, color: { argb: `FF${WHITE}` } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${HEADER}` } },
    alignment: { vertical: 'middle', horizontal: 'center' }
  });
  mergeLabel(sheet, 3, 'Periodo', `${data.query.fechaInicio || 'Inicio'} a ${data.query.fechaFin || 'Actualidad'}`);
  mergeLabel(sheet, 4, 'Moneda', 'Colones costarricenses (CRC)');
  mergeLabel(sheet, 5, 'Contenido', 'Resumen, ventas, detalle de productos, gastos adicionales y mermas de inventario.');
  mergeLabel(sheet, 6, 'Uso', 'Control interno para revisar ingresos, costos, IVA, comisiones y perdidas.');
  mergeLabel(sheet, 7, 'Nota fiscal', 'Auxiliar contable. La facturacion electronica oficial se emite en el sistema autorizado por Hacienda.');
  mergeLabel(sheet, 8, 'Comisiones', 'Empleados: 10% del subtotal sin IVA en ventas presenciales. Administrador: 0%.');
  mergeLabel(sheet, 9, 'Cancelaciones', 'Pedidos cancelados se conservan para auditoria y no suman en indicadores financieros.');
  styleRange(sheet, 1, 9);
  sheet.views = [{ showGridLines: false }];
  return sheet;
}
