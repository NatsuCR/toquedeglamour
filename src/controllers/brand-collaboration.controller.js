import { BrandCollaborationService } from '../services/brand-collaboration.service.js';

export class BrandCollaborationController {
  static async publico(req, res) {
    try {
      const colaboraciones = await BrandCollaborationService.listar();
      const marcas = colaboraciones.map((item) => item.marca).filter(Boolean);
      res.render('client/marcas', {
        user: res.locals.cliente, colaboraciones,
        title: 'Marcas y colaboraciones', canonical: '/marcas',
        metaDescription: `Conoce las marcas de Toque de Glamour: ${marcas.join(', ')} y más opciones de belleza, nutrición y hogar en Costa Rica.`,
        seoKeywords: [...marcas, 'Nutriplus', 'Farmasi', 'Dr. C. Tuna', 'Drapes Ross'].join(', ')
      });
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

  static async actualizar(req, res) {
    try {
      await BrandCollaborationService.actualizar(req.params.id, req.body, req.file);
      res.redirect('/admin/marcas?success=Colaboracion+actualizada');
    } catch (error) {
      res.redirect(`/admin/marcas?error=${encodeURIComponent(error.message)}`);
    }
  }
}
