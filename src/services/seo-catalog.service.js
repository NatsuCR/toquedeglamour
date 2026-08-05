import prisma from '../config/db.js';
import { toSlug } from '../utils/slug.js';
import { BrandCollaborationService } from './brand-collaboration.service.js';

const FEATURED_BRANDS = [
  'Nutriplus',
  'Farmasi',
  'Nutriplus+',
  'Drapes Ross',
  'Dr. C. Tuna'
];

export const brandSlug = (value) => toSlug(String(value || '').replace(/\+/g, ' plus '));

const uniqueBrands = (values) => {
  const seen = new Set();
  return values.filter((value) => {
    const key = brandSlug(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export class SeoCatalogService {
  static async brands() {
    const [products, collaborations] = await Promise.all([
      prisma.producto.findMany({
        where: { marca: { not: null } },
        distinct: ['marca'],
        select: { marca: true }
      }),
      BrandCollaborationService.listar()
    ]);
    const names = uniqueBrands([
      ...FEATURED_BRANDS,
      ...products.map((item) => item.marca).filter(Boolean),
      ...collaborations.map((item) => item.marca).filter(Boolean)
    ]);
    return names.map((name) => ({ name, slug: brandSlug(name) }));
  }

  static async brandBySlug(slug) {
    const brands = await this.brands();
    return brands.find((brand) => brand.slug === slug) || null;
  }

  static async sitemapData() {
    const [categories, products, brands] = await Promise.all([
      prisma.categoria.findMany({
        select: {
          slug: true, creadoEn: true,
          subcategorias: { select: { slug: true, creadoEn: true } }
        }
      }),
      prisma.producto.findMany({
        select: { id: true, slug: true, actualizadoEn: true, imagenes: { select: { ruta: true } } }
      }),
      this.brands()
    ]);
    return { categories, products, brands };
  }
}
