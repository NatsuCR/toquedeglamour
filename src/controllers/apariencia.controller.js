import { AparienciaService } from '../services/apariencia.service.js';

export class AparienciaController {
  static async render(req, res) {
    const settings = await AparienciaService.obtenerAjustes();
    res.render('admin/apariencia', {
      admin: res.locals.admin,
      siteSettings: settings,
      error: req.query.error,
      success: req.query.success
    });
  }

  static async update(req, res) {
    try {
      await AparienciaService.guardarAjustes(req.body, req.files);
      res.redirect('/admin/apariencia?success=Apariencia+actualizada');
    } catch (error) {
      res.redirect(`/admin/apariencia?error=${encodeURIComponent(error.message)}`);
    }
  }
}
