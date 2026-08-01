import { SitemapService } from '../services/sitemap.service.js';

export class SeoController {
  static async sitemap(req, res) {
    try {
      res.type('application/xml').send(await SitemapService.xml(req));
    } catch (error) {
      console.error('Error generando sitemap:', error.message);
      res.status(500).type('text/plain').send('No se pudo generar el sitemap.');
    }
  }

  static robots(req, res) {
    res.type('text/plain').send(SitemapService.robots(req));
  }

  static notFound(req, res) {
    res.status(404).render('client/404', {
      user: res.locals.cliente,
      title: 'Página no encontrada',
      metaDescription: 'La página solicitada no existe en Toque de Glamour.',
      robots: 'noindex, follow'
    });
  }
}
