import { SeoCatalogService } from './seo-catalog.service.js';

const PUBLIC_ROUTES = [
  '/', '/catalogo', '/marcas', '/quienes-somos', '/ubicacion',
  '/terminos-condiciones', '/politica-privacidad', '/politica-envios',
  '/cambios-devoluciones'
];

const xmlEscape = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const cleanBase = (value) => String(value || '').replace(/\/$/, '');

export function siteBase(req) {
  return cleanBase(process.env.SITE_URL || `${req.protocol}://${req.get('host')}`);
}

export class SitemapService {
  static async urls(baseUrl) {
    const { categories, products, brands } = await SeoCatalogService.sitemapData();
    const routes = [...PUBLIC_ROUTES];
    categories.forEach((category) => {
      routes.push(`/catalogo/categoria/${category.slug}`);
      category.subcategorias.forEach((subcategory) => {
        routes.push(`/catalogo/categoria/${category.slug}/${subcategory.slug}`);
      });
    });
    brands.forEach((brand) => routes.push(`/catalogo/marca/${brand.slug}`));
    products.forEach((product) => routes.push(`/producto/${product.id}/${product.slug}`));
    return [...new Set(routes)].map((route) => `${baseUrl}${route}`);
  }

  static async xml(req) {
    const urls = await this.urls(siteBase(req));
    const nodes = urls.map((url) => `  <url><loc>${xmlEscape(url)}</loc></url>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${nodes}\n</urlset>`;
  }

  static robots(req) {
    const base = siteBase(req);
    return ['User-agent: *', 'Allow: /', 'Disallow: /admin/', 'Disallow: /perfil/',
      'Disallow: /checkout', 'Disallow: /carrito', 'Disallow: /soporte/',
      'Disallow: /login', 'Disallow: /registro', 'Disallow: /password/',
      `Sitemap: ${base}/sitemap.xml`, ''].join('\n');
  }
}
