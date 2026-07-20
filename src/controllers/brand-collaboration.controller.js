import { BrandCollaborationService } from '../services/brand-collaboration.service.js';

export class BrandCollaborationController {
  static async publico(req, res) {
    try {
      const colaboraciones = await BrandCollaborationService.listar();
      res.render('client/marcas', { user: res.locals.cliente, colaboraciones, title: 'Marcas' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error cargando marcas.');
    }
  }

  static async admin(req, res) {
    const colaboraciones = await BrandCollaborationService.listar({ incluirInactivas: true });
    res.render('admin/marcas', {
      admin: res.locals.admin,
      colaboraciones,
      error: req.query.error,
      success: req.query.success
    });
  }

  static async crear(req, res) {
    try {
      await BrandCollaborationService.crear(req.body, req.file);
      res.redirect('/admin/marcas?success=Colaboracion+agregada');
    } catch (error) {
      res.redirect(`/admin/marcas?error=${encodeURIComponent(error.message)}`);
    }
  }

  static async eliminar(req, res) {
    try {
      await BrandCollaborationService.eliminar(req.params.id);
      res.redirect('/admin/marcas?success=Colaboracion+eliminada');
    } catch (error) {
      res.redirect(`/admin/marcas?error=${encodeURIComponent(error.message)}`);
    }
  }
}
