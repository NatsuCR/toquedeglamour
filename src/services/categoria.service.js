import prisma from '../config/db.js';
import { uniqueSlug } from '../utils/slug.js';

export class CategoriaService {
  static async obtenerTodas() {
    return prisma.categoria.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        subcategorias: {
          orderBy: { nombre: 'asc' },
          include: { _count: { select: { productos: true } } }
        },
        _count: { select: { productos: true, subcategorias: true } }
      }
    });
  }

  static async obtenerMenu() {
    return prisma.categoria.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        subcategorias: {
          orderBy: { nombre: 'asc' },
          include: {
            productos: {
              orderBy: { nombre: 'asc' },
              select: { id: true, nombre: true, slug: true, marca: true, tipoVenta: true }
            }
          }
        }
      }
    });
  }

  static async obtenerPorId(id) {
    return prisma.categoria.findUnique({
      where: { id: Number.parseInt(id, 10) },
      include: { subcategorias: { orderBy: { nombre: 'asc' } } }
    });
  }

  static async crear(data) {
    if (!data.nombre) throw new Error('El nombre de la categoria es obligatorio.');
    return prisma.categoria.create({
      data: {
        nombre: data.nombre.trim(),
        slug: await uniqueSlug(prisma.categoria, data.nombre),
        descripcion: data.descripcion ? data.descripcion.trim() : null
      }
    });
  }

  static async actualizar(id, data) {
    const cid = Number.parseInt(id, 10);
    const existe = await prisma.categoria.findUnique({ where: { id: cid } });
    if (!existe) throw new Error('Categoria no encontrada.');
    const nombre = data.nombre ? data.nombre.trim() : existe.nombre;
    const cambioNombre = nombre !== existe.nombre;

    return prisma.categoria.update({
      where: { id: cid },
      data: {
        nombre,
        slug: cambioNombre ? await uniqueSlug(prisma.categoria, nombre, cid) : existe.slug,
        descripcion: data.descripcion !== undefined ? data.descripcion.trim() : existe.descripcion
      }
    });
  }

  static async eliminar(id) {
    const cid = Number.parseInt(id, 10);
    const conteoProductos = await prisma.producto.count({ where: { categoriaId: cid } });
    if (conteoProductos > 0) {
      throw new Error(`No se puede eliminar porque tiene ${conteoProductos} producto(s).`);
    }
    return prisma.categoria.delete({ where: { id: cid } });
  }

  static async crearSubcategoria(categoriaId, data) {
    const cid = Number.parseInt(categoriaId, 10);
    if (!data.nombre) throw new Error('El nombre de la subcategoria es obligatorio.');
    const categoria = await prisma.categoria.findUnique({ where: { id: cid } });
    if (!categoria) throw new Error('Categoria no encontrada.');

    return prisma.subcategoria.create({
      data: {
        categoriaId: cid,
        nombre: data.nombre.trim(),
        slug: await uniqueSlug(prisma.subcategoria, `${categoria.nombre} ${data.nombre}`),
        descripcion: data.descripcion ? data.descripcion.trim() : null
      }
    });
  }

  static async eliminarSubcategoria(id) {
    const sid = Number.parseInt(id, 10);
    const productos = await prisma.producto.count({ where: { subcategoriaId: sid } });
    if (productos > 0) {
      throw new Error(`No se puede eliminar porque tiene ${productos} producto(s).`);
    }
    return prisma.subcategoria.delete({ where: { id: sid } });
  }
}
