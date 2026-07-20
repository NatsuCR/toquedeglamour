import { AparienciaService } from '../services/apariencia.service.js';
import { CategoriaService } from '../services/categoria.service.js';

export async function injectSiteSettings(req, res, next) {
  try {
    res.locals.siteSettings = await AparienciaService.obtenerAjustes();
  } catch (error) {
    res.locals.siteSettings = {};
  }
  try {
    res.locals.catalogoMenu = await CategoriaService.obtenerMenu();
  } catch (error) {
    res.locals.catalogoMenu = [];
  }
  next();
}
