import prisma from '../config/db.js';
import { uniqueSlug } from '../utils/slug.js';
import {
  borrarImagenes,
  datosProducto,
  imagenesCreate,
  requiereVentaDirecta
} from './producto.helpers.js';
import { ProductoQueryService } from './producto-query.service.js';
import { ProductImageService } from './product-image.service.js';
import { borrarUploads } from './producto-upload.service.js';
import { missingProductFields } from './product-content.service.js';
import {
  faqCreateWithUploads,
  faqEntriesWithUploads
} from './product-faq-upload.service.js';

export class ProductoService extends ProductoQueryService {
  static async crear(data, imagenFiles) {
    if (requiereVentaDirecta(data) || missingProductFields(data).length) {
      borrarUploads(imagenFiles);
      throw new Error('Completa nombre, categoria y datos de venta requeridos.');
    }
    await this.validarSubcategoriaConUploads(data.categoriaId, data.subcategoriaId, imagenFiles);
    const productoData = this.datosConUploads(data, null, imagenFiles);
    const preguntasFrecuentes = faqCreateWithUploads(data, imagenFiles);
    return prisma.producto.create({
      data: {
        ...productoData,
        slug: await uniqueSlug(prisma.producto, data.nombre),
        imagenes: imagenesCreate(imagenFiles),
        preguntasFrecuentes
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
    if (requiereVentaDirecta(data) || missingProductFields(data, existe).length) {
      borrarUploads(imagenFiles);
      throw new Error('Completa los datos y el contenido requeridos para este producto.');
    }
    await this.validarSubcategoriaConUploads(
      data.categoriaId || existe.categoriaId,
      data.subcategoriaId,
      imagenFiles
    );
    const productoData = this.datosConUploads(data, existe, imagenFiles);
    const faqEntries = faqEntriesWithUploads(data, imagenFiles);
    return ProductImageService.update({
      productId: pid,
      productData: productoData,
      existingImages: existe.imagenes,
      newFiles: imagenFiles,
      removeImageIds: data.removeImageIds,
      faqEntries
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
