import { FinanceStatsService } from './finance-stats.service.js';
import { FinanceExpensesService } from './finance-expenses.service.js';
import { formatMoneyCRC } from '../utils/money.js';

const labels = {
  totalConIva: 'Total con IVA',
  totalSinIva: 'Total sin IVA',
  ivaEstimado: 'IVA registrado',
  gananciaTotal: 'Ganancia total',
  gananciaNeta: 'Ganancia neta',
  costosProductos: 'Costos de productos',
  gastosAdicionales: 'Gastos adicionales'
};

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function fecha(value) {
  return new Date(value).toLocaleDateString('es-CR');
}

function kpiRows(kpis) {
  return Object.entries(labels)
    .map(([key, label]) => `<tr><td>${label}</td><td>${formatMoneyCRC(kpis[key])}</td></tr>`)
    .join('');
}

function expenseRows(gastos) {
  if (!gastos.length) return '<tr><td colspan="5">Sin gastos registrados</td></tr>';
  return gastos.map((gasto) => `
    <tr>
      <td>${fecha(gasto.fecha)}</td>
      <td>${esc(gasto.categoria)}</td>
      <td>${esc(gasto.descripcion)}</td>
      <td>${formatMoneyCRC(gasto.monto)}</td>
      <td>${gasto.comprobanteRuta ? 'Adjunto' : 'Sin adjunto'}</td>
    </tr>
  `).join('');
}

export class FinanceExportService {
  static async excel(query = {}) {
    const [resumen, gastos] = await Promise.all([
      FinanceStatsService.resumen(query),
      FinanceExpensesService.listar(query)
    ]);
    return `<!doctype html>
      <html><head><meta charset="utf-8"></head>
      <body>
        <h1>Reporte financiero - Toque de Glamour</h1>
        <p>IVA activo: ${resumen.kpis.ivaActivo ? 'Si' : 'No'} (${resumen.kpis.ivaPorcentaje}%)</p>
        <table border="1">
          <thead><tr><th>Indicador</th><th>Monto</th></tr></thead>
          <tbody>${kpiRows(resumen.kpis)}</tbody>
        </table>
        <h2>Gastos adicionales</h2>
        <table border="1">
          <thead><tr><th>Fecha</th><th>Categoria</th><th>Descripcion</th><th>Monto</th><th>Comprobante</th></tr></thead>
          <tbody>${expenseRows(gastos)}</tbody>
        </table>
      </body></html>`;
  }
}
