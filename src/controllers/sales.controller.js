import { SalesService } from '../services/sales.service.js';
import { FinanceSettingsService } from '../services/finance-settings.service.js';
import { buildSalesCatalog } from '../services/sales-catalog.service.js';
import { deleteSaleProofs } from '../middlewares/sales-proof-upload.middleware.js';

function takeFlash(req) {
  const flash = req.session.salesFlash || null;
  delete req.session.salesFlash;
  return flash;
}

function redirect(req, res, type, message) {
  req.session.salesFlash = { type, message };
  res.redirect('/admin/ventas');
}

export class SalesController {
  static async render(req, res) {
    try {
      const [productos, ventas, finance] = await Promise.all([
        SalesService.products(),
        SalesService.recent(),
        FinanceSettingsService.obtener()
      ]);
      res.render('admin/ventas', {
        admin: res.locals.admin,
        productos: buildSalesCatalog(productos),
        ventas,
        finance,
        flash: takeFlash(req),
        error: req.query.error
      });
    } catch (error) {
      console.error('Error cargando ventas presenciales:', error.message);
      res.status(500).send('No se pudo cargar el punto de venta.');
    }
  }

  static async create(req, res) {
    try {
      const venta = await SalesService.create(res.locals.admin, req.body, req.files);
      if (req.body.metodoPago === 'EFECTIVO') deleteSaleProofs(req.files);
      redirect(req, res, 'success', `Venta ${venta.codigo} registrada correctamente.`);
    } catch (error) {
      console.error('Error registrando venta presencial:', error.message);
      deleteSaleProofs(req.files);
      redirect(req, res, 'error', error.message || 'No se pudo registrar la venta.');
    }
  }
}
