import prisma from '../config/db.js';

export const DEFAULT_SITE_SETTINGS = {
  logoUrl: '/img/logo-main.jpeg',
  heroImageUrl: '/img/beauty-hero.png',
  heroImagesJson: '["/img/beauty-hero.png"]',
  heroEyebrow: 'Belleza, salud y cuidado personal',
  heroTitle: 'Tu belleza, tu toque de glamour',
  heroText: 'Maquillaje, cuidado facial y productos de bienestar seleccionados para tu rutina diaria, regalos especiales y compras faciles desde casa.',
  heroPrimaryLabel: 'Ver catalogo',
  heroPrimaryHref: '/catalogo',
  heroSecondaryLabel: 'Conocer la marca',
  heroSecondaryHref: '/quienes-somos',
  topTitle: 'Mas vendidos',
  topSubtitle: 'Los favoritos de nuestras clientas este ano.',
  newTitle: 'Recien llegados',
  newSubtitle: 'Novedades para renovar tu rutina de belleza.',
  suggestedTitle: 'Tambien te puede gustar',
  suggestedSubtitle: 'Una seleccion extra para descubrir algo nuevo.',
  primaryColor: '#7b2446',
  primaryStrongColor: '#54172d',
  secondaryColor: '#c7964a',
  accentColor: '#6f8f78'
};

const EDITABLE_KEYS = Object.keys(DEFAULT_SITE_SETTINGS);

const asList = (value) => {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
};

const cleanImages = (images, fallback) => {
  const unique = [];
  for (const image of images) {
    const value = String(image || '').trim();
    if (value && !unique.includes(value)) unique.push(value);
  }
  return unique.length ? unique : [fallback];
};

const parseHeroImages = (settings) => {
  let images = [];
  try {
    images = JSON.parse(settings.heroImagesJson || '[]');
  } catch {
    images = [];
  }
  if (!Array.isArray(images)) images = asList(images);
  const legacyImage = String(settings.heroImageUrl || '').trim();
  if (legacyImage && !images.includes(legacyImage)) images.unshift(legacyImage);
  return cleanImages(images, DEFAULT_SITE_SETTINGS.heroImageUrl);
};

const removeValues = (value) => new Set(asList(value).map((item) => String(item)));

export class AparienciaService {
  static async obtenerAjustes() {
    try {
      const rows = await prisma.ajusteSitio.findMany();
      const saved = rows.reduce((acc, row) => {
        acc[row.clave] = row.valor;
        return acc;
      }, {});
      const settings = { ...DEFAULT_SITE_SETTINGS, ...saved };
      const heroImages = parseHeroImages(settings);
      return { ...settings, heroImages, heroImageUrl: heroImages[0] };
    } catch (error) {
      console.warn('No se pudieron cargar ajustes visuales:', error.message);
      return {
        ...DEFAULT_SITE_SETTINGS,
        heroImages: [DEFAULT_SITE_SETTINGS.heroImageUrl]
      };
    }
  }

  static async guardarAjustes(data, files = {}) {
    const values = {};
    for (const key of EDITABLE_KEYS) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        values[key] = String(data[key] ?? '').trim();
      }
    }

    const logo = files.logo?.[0];
    const hero = files.heroImage?.[0];
    const heroMany = files.heroImages || [];
    if (logo) values.logoUrl = `/uploads/branding/${logo.filename}`;

    const baseSettings = { ...DEFAULT_SITE_SETTINGS, ...data };
    let heroImages = parseHeroImages(baseSettings);
    const removed = removeValues(data.removeHeroImages);
    heroImages = heroImages.filter((image) => !removed.has(image));

    if (hero) heroImages.unshift(`/uploads/branding/${hero.filename}`);
    for (const image of heroMany) {
      heroImages.push(`/uploads/branding/${image.filename}`);
    }

    heroImages = cleanImages(heroImages, DEFAULT_SITE_SETTINGS.heroImageUrl);
    values.heroImagesJson = JSON.stringify(heroImages);
    values.heroImageUrl = heroImages[0];

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
