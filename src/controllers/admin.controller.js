import { AuthService } from '../services/auth.service.js';
import { resetLoginAttempts } from '../middlewares/auth.middleware.js';
import prisma from '../config/db.js';
import { FinanceStatsService } from '../services/finance-stats.service.js';
import { AnalyticsReportService } from '../services/analytics-report.service.js';
import { startAdminSession } from '../services/admin-session.service.js';
import { touchAdminActivity } from '../services/admin-inactivity.service.js';

export class AdminController {
  static renderLoginForm(req, res) {
    const error = req.session.loginError || (req.query.inactividad
      ? 'Tu sesion se cerro despues de 3 horas sin actividad.'
      : null);
    delete req.session.loginError;
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(200).json({ message: 'Por favor inicia sesion en /admin/login' });
    }
    res.render('admin/login', { error, admin: null });
  }

  static activity(req, res) {
    touchAdminActivity(req, res);
  }

  static async processLogin(req, res) {
    try {
      const admin = await AuthService.loginAdmin(req.body.correo, req.body.password);
      if (!admin) {
        req.session.loginError = 'Credenciales invalidas. Verifica tu correo y contrasena.';
        return res.redirect('/admin/login');
      }
      const destino = await startAdminSession(req, admin);
      resetLoginAttempts(req.ip);
      res.redirect(destino);
    } catch (error) {
      console.error('Error en login admin:', error.message);
      req.session.loginError = 'Ocurrio un error inesperado al procesar el login.';
      res.redirect('/admin/login');
    }
  }

  static async logout(req, res) {
    try {
      await AuthService.logoutAdmin(req);
      res.clearCookie('toquedeglamour_sid');
      res.redirect('/admin/login');
    } catch {
      res.status(500).send('Error al intentar cerrar sesion.');
    }
  }

  static async renderDashboard(req, res) {
    try {
      const [totalPedidos, totalVentasLocal, totalClientes, stockBajo, recientes, resumen, analytics] = await Promise.all([
        prisma.pedido.count({ where: { estado: { not: 'RECHAZADO' } } }),
        prisma.ventaPresencial.count(),
        prisma.cliente.count(),
        prisma.producto.count({ where: { stock: { lte: 5 } } }),
        prisma.pedido.findMany({
          take: 5,
          orderBy: { creadoEn: 'desc' },
          include: { cliente: true }
        }),
        FinanceStatsService.resumen(),
        AnalyticsReportService.summary()
      ]);
      res.render('admin/dashboard', {
        admin: res.locals.admin,
        stats: {
          pedidos: totalPedidos,
          ventasLocal: totalVentasLocal,
          clientes: totalClientes,
          stockBajo,
          visitas: analytics.visits,
          visitantesUnicos: analytics.uniqueVisitors,
          ...resumen.kpis
        },
        pedidosRecientes: recientes
      });
    } catch (error) {
      console.error('Error cargando dashboard:', error.message);
      res.status(500).send('Error interno cargando dashboard');
    }
  }

  static async getDashboardStats(req, res) {
    try {
      res.json(await FinanceStatsService.resumen(req.query));
    } catch (error) {
      console.error('Error en API de Dashboard:', error.message);
      res.status(500).json({ error: 'Error interno obteniendo estadisticas' });
    }
  }
}
