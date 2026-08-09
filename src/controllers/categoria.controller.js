import { CategoriaService } from '../services/categoria.service.js';

export class CategoriaController {
  static async listar(req, res) {
    try {
      const categorias = await CategoriaService.obtenerTodas();
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(200).json(categorias);
      }
      res.render('admin/categorias', {
        admin: res.locals.admin,
        categorias,
        error: req.query.error,
        success: req.query.success
      });
    } catch (error) {
      res.status(500).send('Error al obtener categorias.');
    }
  }

  static async crear(req, res) {
    try {
      await CategoriaService.crear(req.body);
      res.redirect('/admin/categorias?success=Categoria+creada');
    } catch (error) {
      res.redirect(`/admin/categorias?error=${encodeURIComponent(error.message)}`);
    }
  }

  static async actualizar(req, res) {
    try {
      await CategoriaService.actualizar(req.params.id, req.body);
      res.redirect('/admin/categorias?success=Categoria+actualizada');
    } catch (error) {
      res.redirect(`/admin/categorias?error=${encodeURIComponent(error.message)}`);
    }
  }

  static async eliminar(req, res) {
    try {
      await CategoriaService.eliminar(req.params.id);
      res.redirect('/admin/categorias?success=Categoria+eliminada');
    } catch (error) {
      res.redirect(`/admin/categorias?error=${encodeURIComponent(error.message)}`);
    }
  }

  static async crearSubcategoria(req, res) {
    try {
      await CategoriaService.crearSubcategoria(req.params.id, req.body);
      res.redirect('/admin/categorias?success=Subcategoria+creada');
    } catch (error) {
      res.redirect(`/admin/categorias?error=${encodeURIComponent(error.message)}`);
    }
  }

  static async actualizarSubcategoria(req, res) {
    try {
      await CategoriaService.actualizarSubcategoria(req.params.id, req.body);
      res.redirect('/admin/categorias?success=Subcategoria+actualizada');
    } catch (error) {
      res.redirect(`/admin/categorias?error=${encodeURIComponent(error.message)}`);
    }
  }

  static async eliminarSubcategoria(req, res) {
    try {
      await CategoriaService.eliminarSubcategoria(req.params.id);
      res.redirect('/admin/categorias?success=Subcategoria+eliminada');
    } catch (error) {
      res.redirect(`/admin/categorias?error=${encodeURIComponent(error.message)}`);
    }
  }
}
