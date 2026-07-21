import prisma from '../config/db.js';
import { uniqueSlug } from '../utils/slug.js';
import {
  borrarImagenes,
  datosProducto,
  imagenesCreate,
  requiereVentaDirecta,
  tieneImagenesNuevas
} from './producto.helpers.js';
import { ProductoQueryService } from './producto-query.service.js';
import { borrarUploads } from './producto-upload.service.js';

export class ProductoService extends ProductoQueryService {
  static async crear(data, imagenFiles) {
    if (!data.nombre || !data.categoriaId || requiereVentaDirecta(data)) {
      borrarUploads(imagenFiles);
      throw new Error('Completa nombre, categoria y datos de venta requeridos.');
    }
    await this.validarSubcategoriaConUploads(data.categoriaId, data.subcategoriaId, imagenFiles);
    const productoData = this.datosConUploads(data, null, imagenFiles);
    return prisma.producto.create({
      data: {
        ...productoData,
        slug: await uniqueSlug(prisma.producto, data.nombre),
        imagenes: imagenesCreate(imagenFiles)
      }
    });
  }

  static async actualizar(id, data, imagenFiles) {
    const pid = Number.parseInt(id, 10);
    const existe = await prisma.producto.findUnique({
      where: { id: pid }, include: { imagenes: true }
    });
    if (!existe) {
      borrarUploads(imagenFiles);
      throw new Error('Producto no encontrado.');
    }
    await this.validarSubcategoriaConUploads(
      data.categoriaId || existe.categoriaId,
      data.subcategoriaId,
      imagenFiles
    );
    const productoData = this.datosConUploads(data, existe, imagenFiles);
    if (tieneImagenesNuevas(imagenFiles)) {
      borrarImagenes(existe.imagenes);
      await prisma.imagenProducto.deleteMany({ where: { productoId: pid } });
    }
    return prisma.producto.update({
      where: { id: pid },
      data: { ...productoData, imagenes: imagenesCreate(imagenFiles) }
    });
  }

  static async eliminar(id) {
    const pid = Number.parseInt(id, 10);
    const existe = await prisma.producto.findUnique({
      where: { id: pid }, include: { imagenes: true }
    });
    if (!existe) throw new Error('Producto no encontrado.');
    borrarImagenes(existe.imagenes);
    return prisma.producto.delete({ where: { id: pid } });
  }

  static async validarSubcategoriaConUploads(categoriaId, subcategoriaId, imagenFiles) {
    try {
      await this.validarSubcategoria(categoriaId, subcategoriaId);
    } catch (error) {
      borrarUploads(imagenFiles);
      throw error;
    }
  }

  static datosConUploads(data, existente, imagenFiles) {
    try {
      return datosProducto(data, existente);
    } catch (error) {
      borrarUploads(imagenFiles);
      throw error;
    }
  }

  static async validarSubcategoria(categoriaId, subcategoriaId) {
    if (!subcategoriaId) return;
    const subcategoria = await prisma.subcategoria.findFirst({
      where: {
        id: Number.parseInt(subcategoriaId, 10),
        categoriaId: Number.parseInt(categoriaId, 10)
      }
    });
    if (!subcategoria) throw new Error('La subcategoria no pertenece a la categoria seleccionada.');
  }
}
