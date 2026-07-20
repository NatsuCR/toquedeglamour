import prisma from '../config/db.js';

const KEY = 'brandCollaborationsJson';

const DEFAULT_COLLABORATIONS = [{
  id: 'farmasi-toque-glamour',
  marca: 'Farmasi',
  titulo: 'Farmasi x Toque de Glamour',
  descripcion: 'Farmasi colabora con Toque de Glamour para ampliar la seleccion de productos de belleza y cuidado personal.',
  imagenUrl: '/uploads/marcas/colaboracion-farmasi-toque-glamour.png',
  enlace: '/catalogo',
  activa: true
}];

const normalize = (item) => ({
  id: String(item.id || Date.now()),
  marca: String(item.marca || '').trim(),
  titulo: String(item.titulo || '').trim(),
  descripcion: String(item.descripcion || '').trim(),
  imagenUrl: String(item.imagenUrl || '').trim(),
  enlace: String(item.enlace || '').trim(),
  activa: item.activa !== false
});

const clean = (items) => items
  .map(normalize)
  .filter((item) => item.marca && item.titulo && item.imagenUrl);

const parseItems = (value) => {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export class BrandCollaborationService {
  static async listar({ incluirInactivas = false } = {}) {
    const row = await prisma.ajusteSitio.findUnique({ where: { clave: KEY } });
    const items = row ? clean(parseItems(row.valor)) : DEFAULT_COLLABORATIONS;
    return incluirInactivas ? items : items.filter((item) => item.activa);
  }

  static async guardar(items) {
    await prisma.ajusteSitio.upsert({
      where: { clave: KEY },
      update: { valor: JSON.stringify(clean(items)) },
      create: { clave: KEY, valor: JSON.stringify(clean(items)) }
    });
  }

  static async crear(data, file) {
    const imagenUrl = file ? `/uploads/marcas/${file.filename}` : '';
    if (!imagenUrl) throw new Error('Debes subir una imagen de colaboracion.');

    const nueva = normalize({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      marca: data.marca,
      titulo: data.titulo || `${data.marca} x Toque de Glamour`,
      descripcion: data.descripcion,
      enlace: data.enlace || '/catalogo',
      imagenUrl,
      activa: data.activa === 'on'
    });

    const items = await this.listar({ incluirInactivas: true });
    await this.guardar([nueva, ...items]);
  }

  static async eliminar(id) {
    const items = await this.listar({ incluirInactivas: true });
    await this.guardar(items.filter((item) => item.id !== id));
  }
}
