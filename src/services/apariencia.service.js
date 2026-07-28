import prisma from '../config/db.js';
import { getHeroSlides, prepareHeroSlides } from './apariencia-hero.service.js';

export const DEFAULT_SITE_SETTINGS = {
  logoUrl: '/img/toque-de-glamour.png',
  heroImageUrl: '/img/beauty-hero.png',
  heroImagesJson: '["/img/beauty-hero.png"]',
  heroSlidesJson: '[]',
  heroEyebrow: 'Belleza, salud y cuidado personal',
  heroTitle: 'Tu belleza, tu toque de glamour',
  heroText: 'Maquillaje, cuidado facial y productos de bienestar seleccionados para tu rutina diaria, regalos especiales y compras faciles desde casa.',
  heroPrimaryLabel: 'Ver catálogo',
  heroPrimaryHref: '/catalogo',
  heroSecondaryLabel: 'Conocer la marca',
  heroSecondaryHref: '/quienes-somos',
  topTitle: 'Más vendidos',
  topSubtitle: 'Los favoritos de nuestras clientas este año.',
  newTitle: 'Recién llegados',
  newSubtitle: 'Novedades para renovar tu rutina de belleza.',
  suggestedTitle: 'También te puede gustar',
  suggestedSubtitle: 'Una selección extra para descubrir algo nuevo.',
  primaryColor: '#7b2446',
  primaryStrongColor: '#54172d',
  secondaryColor: '#c7964a',
  accentColor: '#6f8f78'
};

const EDITABLE_KEYS = Object.keys(DEFAULT_SITE_SETTINGS);
const FIXED_HERO_ACTIONS = {
  heroPrimaryLabel: DEFAULT_SITE_SETTINGS.heroPrimaryLabel,
  heroPrimaryHref: DEFAULT_SITE_SETTINGS.heroPrimaryHref,
  heroSecondaryLabel: DEFAULT_SITE_SETTINGS.heroSecondaryLabel,
  heroSecondaryHref: DEFAULT_SITE_SETTINGS.heroSecondaryHref
};
const EDITABLE_CONTENT_KEYS = EDITABLE_KEYS.filter((key) => !(key in FIXED_HERO_ACTIONS));
const LEGACY_TEXT = {
  heroPrimaryLabel: ['Ver catalogo', 'Ver catálogo'],
  topTitle: ['Mas vendidos', 'Más vendidos'],
  topSubtitle: ['Los favoritos de nuestras clientas este ano.', 'Los favoritos de nuestras clientas este año.'],
  newTitle: ['Recien llegados', 'Recién llegados'],
  suggestedTitle: ['Tambien te puede gustar', 'También te puede gustar'],
  suggestedSubtitle: ['Una seleccion extra para descubrir algo nuevo.', 'Una selección extra para descubrir algo nuevo.']
};

export class AparienciaService {
  static async obtenerAjustes() {
    try {
      const rows = await prisma.ajusteSitio.findMany();
      const saved = rows.reduce((acc, row) => {
        acc[row.clave] = row.valor;
        return acc;
      }, {});
      Object.entries(LEGACY_TEXT).forEach(([key, [legacy, corrected]]) => {
        if (saved[key] === legacy) saved[key] = corrected;
      });
      const settings = { ...DEFAULT_SITE_SETTINGS, ...saved, ...FIXED_HERO_ACTIONS };
      const heroSlides = getHeroSlides(settings, DEFAULT_SITE_SETTINGS);
      const heroImages = heroSlides.map((slide) => slide.image);
      return { ...settings, heroSlides, heroImages, heroImageUrl: heroImages[0] };
    } catch (error) {
      console.warn('No se pudieron cargar ajustes visuales:', error.message);
      return {
        ...DEFAULT_SITE_SETTINGS,
        heroImages: [DEFAULT_SITE_SETTINGS.heroImageUrl],
        heroSlides: getHeroSlides(DEFAULT_SITE_SETTINGS, DEFAULT_SITE_SETTINGS)
      };
    }
  }

  static async guardarAjustes(data, files = {}) {
    const values = {};
    for (const key of EDITABLE_CONTENT_KEYS) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        values[key] = String(data[key] ?? '').trim();
      }
    }

    const logo = files.logo?.[0];
    if (logo) values.logoUrl = `/uploads/branding/${logo.filename}`;

    const baseSettings = { ...DEFAULT_SITE_SETTINGS, ...data };
    const heroSlides = prepareHeroSlides(baseSettings, data, files, DEFAULT_SITE_SETTINGS);
    const heroImages = heroSlides.map((slide) => slide.image);
    values.heroSlidesJson = JSON.stringify(heroSlides);
    values.heroImagesJson = JSON.stringify(heroImages);
    values.heroImageUrl = heroImages[0];
    values.heroEyebrow = heroSlides[0].eyebrow;
    values.heroTitle = heroSlides[0].title;
    values.heroText = heroSlides[0].text;

    await prisma.$transaction(
      Object.entries(values).map(([clave, valor]) =>
        prisma.ajusteSitio.upsert({
          where: { clave },
          update: { valor },
          create: { clave, valor }
        })
      )
    );

    return this.obtenerAjustes();
  }
}
