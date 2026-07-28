import { FinanceSettingsService } from '../services/finance-settings.service.js';
import { FinanceExpensesService } from '../services/finance-expenses.service.js';
import { FinanceStatsService } from '../services/finance-stats.service.js';
import { FinanceExportService } from '../services/finance-export.service.js';

function flash(req) {
  const message = req.session.financeFlash || null;
  delete req.session.financeFlash;
  return message;
}

function setFlash(req, type, text) {
  req.session.financeFlash = { type, text };
}

function filtros(req) {
  return {
    fechaInicio: req.query.fechaInicio || '',
    fechaFin: req.query.fechaFin || ''
  };
}

export class FinanceController {
  static async render(req, res) {
    try {
      const query = filtros(req);
      const [settings, gastos, resumen] = await Promise.all([
        FinanceSettingsService.obtener(),
        FinanceExpensesService.listar(query),
        FinanceStatsService.resumen(query)
      ]);
      res.render('admin/finanzas', {
        admin: res.locals.admin,
        settings,
        gastos,
        resumen,
        filtros: query,
        flash: flash(req)
      });
    } catch (error) {
      console.error('Error cargando finanzas:', error.message);
      res.status(500).send('Error cargando finanzas.');
    }
  }

  static async actualizarIva(req, res) {
    try {
      await FinanceSettingsService.actualizar(req.body);
      setFlash(req, 'success', 'Configuracion de IVA actualizada.');
    } catch (error) {
      setFlash(req, 'error', error.message);
    }
    res.redirect('/admin/finanzas');
  }

  static async crearGasto(req, res) {
    try {
      await FinanceExpensesService.crear(req.body, req.file);
      setFlash(req, 'success', 'Gasto adicional registrado.');
    } catch (error) {
      setFlash(req, 'error', error.message);
    }
    res.redirect('/admin/finanzas');
  }

  static async eliminarGasto(req, res) {
    try {
      await FinanceExpensesService.eliminar(req.params.id);
      setFlash(req, 'success', 'Gasto eliminado.');
    } catch (error) {
      setFlash(req, 'error', error.message);
    }
    res.redirect('/admin/finanzas');
  }

  static async exportar(req, res) {
    try {
      const workbook = await FinanceExportService.excel(filtros(req));
      const stamp = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Costa_Rica'
      }).format(new Date());
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="finanzas-${stamp}.xlsx"`);
      res.send(Buffer.from(workbook));
    } catch (error) {
      console.error('Error exportando finanzas:', error.message);
      res.status(500).send('No se pudo exportar el reporte.');
    }
  }
}
