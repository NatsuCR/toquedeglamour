import { PromotionSettingsService } from '../services/promotion-settings.service.js';
import { ProductoService } from '../services/producto.service.js';

export class PromotionsController {
  static async render(req, res) {
    try {
      const [promotions, products] = await Promise.all([
        PromotionSettingsService.get(), ProductoService.obtenerTodos()
      ]);
      const flash = req.session.promotionsFlash || null;
      delete req.session.promotionsFlash;
      res.render('admin/promociones', {
        admin: res.locals.admin, promotions, products, flash
      });
    } catch (error) {
      res.status(500).send('No se pudo cargar la gestión de promociones.');
    }
  }

  static async update(req, res) {
    try {
      await PromotionSettingsService.update(req.body);
      req.session.promotionsFlash = { type: 'success', message: 'Promociones actualizadas.' };
    } catch (error) {
      req.session.promotionsFlash = { type: 'error', message: error.message };
    }
    res.redirect('/admin/promociones');
  }
}
