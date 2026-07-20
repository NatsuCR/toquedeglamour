import fs from 'fs';
import prisma from '../config/db.js';
import { uniqueSlug } from '../utils/slug.js';
import { borrarImagenes, datosProducto, filtrosProducto, imagenCreate, includeProducto, mapProducto, mapProductos, ordenProducto, requiereVentaDirecta } from './producto.helpers.js';
export class ProductoService {
  static async obtenerTodos() {
    const productos = await prisma.producto.findMany({
      include: includeProducto, orderBy: { creadoEn: 'desc' }
    });
    return mapProductos(productos);
  }

  static async obtenerRecientes(limit = 6) {
    const productos = await prisma.producto.findMany({
      take: limit, include: includeProducto, orderBy: { creadoEn: 'desc' }
    });
    return mapProductos(productos);
  }

  static async obtenerNuevos(limit = 6) {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    const productos = await prisma.producto.findMany({
      where: { esNuevo: true, fechaNuevo: { gte: hace30Dias } },
      take: limit, include: includeProducto, orderBy: { fechaNuevo: 'desc' }
    });
    return mapProductos(productos);
  }

  static async obtenerTopVentas(limit = 6) {
    const inicioAnio = new Date(new Date().getFullYear(), 0, 1);
    const topProductos = await prisma.itemPedido.groupBy({
      by: ['productoId'],
      _sum: { cantidad: true },
      where: { pedido: { creadoEn: { gte: inicioAnio } } },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: limit
    });
    const ids = topProductos.map((t) => t.productoId);
    if (ids.length === 0) return [];
    const productos = await prisma.producto.findMany({ where: { id: { in: ids } }, include: includeProducto });
    return ids.map((id) => mapProducto(productos.find((p) => p.id === id))).filter(Boolean);
  }

  static async obtenerSugeridos(limit = 6, excluirIds = []) {
    const where = excluirIds.length > 0 ? { id: { notIn: excluirIds } } : {};
    const productos = await prisma.producto.findMany({
      where, take: limit, include: includeProducto, orderBy: { creadoEn: 'desc' }
    });
    return mapProductos(productos);
  }

  static async obtenerCategoriasDisponibles() {
    return prisma.categoria.findMany({
      orderBy: { nombre: 'asc' },
      include: { subcategorias: { orderBy: { nombre: 'asc' } } }
    });
  }

  static async obtenerFiltrados(filtros) {
    const productos = await prisma.producto.findMany({
      where: filtrosProducto(filtros), orderBy: ordenProducto(filtros.sort), include: includeProducto
    });
    return mapProductos(productos);
  }

  static async obtenerPorId(id) {
    const producto = await prisma.producto.findUnique({
      where: { id: Number.parseInt(id, 10) }, include: includeProducto
    });
    return mapProducto(producto);
  }

  static async crear(data, imagenFile) {
    if (!data.nombre || !data.categoriaId || requiereVentaDirecta(data)) {
      if (imagenFile) fs.unlinkSync(imagenFile.path);
      throw new Error('Completa nombre, categoria y datos de venta requeridos.');
    }
    await this.validarSubcategoria(data.categoriaId, data.subcategoriaId);
    return prisma.producto.create({
      data: {
        ...datosProducto(data),
        slug: await uniqueSlug(prisma.producto, data.nombre),
        imagenes: imagenCreate(imagenFile)
      }
    });
  }

  static async actualizar(id, data, imagenFile) {
    const pid = Number.parseInt(id, 10);
    const existe = await prisma.producto.findUnique({ where: { id: pid }, include: { imagenes: true } });
    if (!existe) {
      if (imagenFile) fs.unlinkSync(imagenFile.path);
      throw new Error('Producto no encontrado.');
    }
    await this.validarSubcategoria(data.categoriaId || existe.categoriaId, data.subcategoriaId);
    if (imagenFile) {
      borrarImagenes(existe.imagenes);
      await prisma.imagenProducto.deleteMany({ where: { productoId: pid } });
    }
    return prisma.producto.update({
      where: { id: pid },
      data: { ...datosProducto(data, existe), imagenes: imagenCreate(imagenFile) }
    });
  }

  static async eliminar(id) {
    const pid = Number.parseInt(id, 10);
    const existe = await prisma.producto.findUnique({ where: { id: pid }, include: { imagenes: true } });
    if (!existe) throw new Error('Producto no encontrado.');
    borrarImagenes(existe.imagenes);
    return prisma.producto.delete({ where: { id: pid } });
  }

  static async validarSubcategoria(categoriaId, subcategoriaId) {
    if (!subcategoriaId) return;
    const subcategoria = await prisma.subcategoria.findFirst({
      where: { id: Number.parseInt(subcategoriaId, 10), categoriaId: Number.parseInt(categoriaId, 10) }
    });
    if (!subcategoria) throw new Error('La subcategoria no pertenece a la categoria seleccionada.');
  }
}
