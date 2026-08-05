import prisma from '../config/db.js';
import { borrarImagenes, includeProducto, mapProducto } from './producto.helpers.js';
import { borrarUploads } from './producto-upload.service.js';

function selectedIds(value, allowedIds) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values
    .map((item) => Number.parseInt(item, 10))
    .filter((id) => Number.isInteger(id) && allowedIds.has(id));
}

function uploadData(files = []) {
  return files.filter(Boolean).map((file) => ({
    ruta: `/uploads/productos/${file.filename}`,
    principal: false
  }));
}

export class ProductImageService {
  static async update({ productId, productData, existingImages, newFiles = [], removeImageIds }) {
    const allowed = new Set(existingImages.map((image) => image.id));
    const removeIds = selectedIds(removeImageIds, allowed);
    const removed = existingImages.filter((image) => removeIds.includes(image.id));
    const remaining = existingImages.filter((image) => !removeIds.includes(image.id));

    try {
      const product = await prisma.$transaction(async (tx) => {
        await tx.producto.update({ where: { id: productId }, data: productData });
        if (removeIds.length) {
          await tx.imagenProducto.deleteMany({ where: { productoId: productId, id: { in: removeIds } } });
        }
        const created = [];
        for (const image of uploadData(newFiles)) {
          created.push(await tx.imagenProducto.create({ data: { ...image, productoId: productId } }));
        }
        const preferred = remaining.find((image) => image.principal) || remaining[0] || created[0];
        await tx.imagenProducto.updateMany({ where: { productoId: productId }, data: { principal: false } });
        if (preferred) {
          await tx.imagenProducto.update({ where: { id: preferred.id }, data: { principal: true } });
        }
        return tx.producto.findUnique({ where: { id: productId }, include: includeProducto });
      });
      borrarImagenes(removed);
      return mapProducto(product);
    } catch (error) {
      borrarUploads(newFiles);
      throw error;
    }
  }
}
