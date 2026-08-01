import { AparienciaService } from '../services/apariencia.service.js';
import { CategoriaService } from '../services/categoria.service.js';

export async function injectSiteSettings(req, res, next) {
  res.locals.siteUrl = String(process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  res.locals.canonicalPath = req.path;
  const privatePaths = ['/login', '/registro', '/verificar', '/password', '/carrito', '/checkout', '/perfil', '/soporte'];
  if (privatePaths.some((path) => req.path === path || req.path.startsWith(`${path}/`))) {
    res.locals.robots = 'noindex, nofollow';
  }
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
