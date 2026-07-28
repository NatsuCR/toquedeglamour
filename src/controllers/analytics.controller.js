import { AnalyticsRecordService } from '../services/analytics-record.service.js';
import { AnalyticsReportService } from '../services/analytics-report.service.js';

export class AnalyticsController {
  static async recordClick(req, res) {
    try {
      if (req.session?.adminId) return res.sendStatus(204);
      await AnalyticsRecordService.recordClick(req.analyticsVisitKey, req.body || {});
      res.sendStatus(204);
    } catch (error) {
      console.error('[Analitica] No se pudo registrar el clic:', error.message);
      res.sendStatus(204);
    }
  }

  static async renderAdmin(req, res) {
    try {
      const analytics = await AnalyticsReportService.summary();
      res.render('admin/analitica', {
        admin: res.locals.admin,
        analytics,
        query: req.query
      });
    } catch (error) {
      console.error('[Analitica] No se pudo cargar el informe:', error.message);
      res.status(500).send('No se pudo cargar la analitica.');
    }
  }

  static async clearAll(req, res) {
    try {
      await AnalyticsRecordService.clearAll();
      res.redirect('/admin/analitica?limpiado=1');
    } catch (error) {
      console.error('[Analitica] No se pudo eliminar el historial:', error.message);
      res.status(500).send('No se pudo eliminar el historial de navegacion.');
    }
  }
}
