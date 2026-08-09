import { SeoCatalogService } from './seo-catalog.service.js';

const PUBLIC_ROUTES = [
  '/', '/catalogo', '/marcas', '/internacional', '/quienes-somos', '/ubicacion',
  '/terminos-condiciones', '/politica-privacidad', '/politica-envios',
  '/cambios-devoluciones'
];

const escapeXml = (value) => String(value).replace(/&/g, '&amp;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');
const cleanBase = (value) => String(value || '').replace(/\/$/, '');
const isoDate = (value) => value ? new Date(value).toISOString().slice(0, 10) : null;
const absoluteUrl = (base, value) => /^https?:\/\//.test(value)
  ? value
  : `${base}${String(value).startsWith('/') ? value : `/${value}`}`;

export function siteBase(req) {
  return cleanBase(process.env.SITE_URL || `${req.protocol}://${req.get('host')}`);
}

function node(entry, baseUrl) {
  const lastmod = entry.lastmod ? `<lastmod>${isoDate(entry.lastmod)}</lastmod>` : '';
  const images = (entry.images || []).map((image) =>
    `<image:image><image:loc>${escapeXml(absoluteUrl(baseUrl, image))}</image:loc></image:image>`
  ).join('');
  return `  <url><loc>${escapeXml(`${baseUrl}${entry.path}`)}</loc>${lastmod}${images}</url>`;
}

export class SitemapService {
  static async entries() {
    const { categories, products, brands } = await SeoCatalogService.sitemapData();
    const entries = PUBLIC_ROUTES.map((path) => ({ path }));
    categories.forEach((category) => {
      entries.push({ path: `/catalogo/categoria/${category.slug}`, lastmod: category.creadoEn });
      category.subcategorias.forEach((subcategory) => entries.push({
        path: `/catalogo/categoria/${category.slug}/${subcategory.slug}`,
        lastmod: subcategory.creadoEn
      }));
    });
    brands.forEach((brand) => entries.push({ path: `/catalogo/marca/${brand.slug}` }));
    products.forEach((product) => entries.push({
      path: `/producto/${product.id}/${product.slug}`,
      lastmod: product.actualizadoEn,
      images: product.imagenes.map((image) => image.ruta)
    }));
    return [...new Map(entries.map((entry) => [entry.path, entry])).values()];
  }

  static async xml(req) {
    const base = siteBase(req);
    const nodes = (await this.entries()).map((entry) => node(entry, base)).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
      `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${nodes}\n</urlset>`;
  }

  static robots(req) {
    const base = siteBase(req);
    return ['User-agent: *', 'Allow: /', 'Disallow: /admin/', 'Disallow: /perfil/',
      'Disallow: /checkout', 'Disallow: /carrito', 'Disallow: /soporte/',
      'Disallow: /login', 'Disallow: /registro', 'Disallow: /password/',
      `Sitemap: ${base}/sitemap.xml`, ''].join('\n');
  }
}
