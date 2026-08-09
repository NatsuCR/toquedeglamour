import { AnalyticsRecordService } from './analytics-record.service.js';
import { startAdminActivity } from './admin-inactivity.service.js';

export async function startAdminSession(req, admin) {
  try {
    await AnalyticsRecordService.markAdmin(req.analyticsVisitKey);
  } catch (error) {
    console.error('[Analitica] No se pudo marcar la sesion interna:', error.message);
  }

  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) return reject(error);
      req.session.adminId = admin.id;
      req.session.adminCorreo = admin.correo;
      req.session.adminRol = admin.rol || 'ADMINISTRADOR';
      startAdminActivity(req);
      const destination = admin.rol === 'EMPLEADO'
        ? '/admin/ventas'
        : '/admin/dashboard';
      req.session.save((saveError) => {
        if (saveError) return reject(saveError);
        resolve(destination);
      });
    });
  });
}
