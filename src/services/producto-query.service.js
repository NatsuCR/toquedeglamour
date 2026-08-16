import prisma from '../config/db.js';
import {
  includeProducto,
  mapProducto,
  mapProductos
} from './producto.helpers.js';
import { filtrosProducto, ordenProducto } from './product-filter.service.js';

export class ProductoQueryService {
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

  static async obtenerNuevos() {
    const productos = await prisma.producto.findMany({
      where: { esNuevo: true },
      include: includeProducto, orderBy: { fechaNuevo: 'desc' }
    });
    return mapProductos(productos);
  }

  static async obtenerPromociones() {
    const productos = await prisma.producto.findMany({
      where: {
        tipoVenta: 'DIRECTA',
        promocionActiva: true,
        promocionPorcentaje: { gt: 0 }
      },
      include: includeProducto,
      orderBy: { creadoEn: 'desc' }
    });
    return mapProductos(productos);
  }

  static async obtenerTopVentas(limit = 6) {
    const inicioAnio = new Date(new Date().getFullYear(), 0, 1);
    const topProductos = await prisma.itemPedido.groupBy({
      by: ['productoId'],
      _sum: { cantidad: true },
      where: { pedido: { creadoEn: { gte: inicioAnio }, estado: { not: 'RECHAZADO' } } },
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

  static async obtenerMarcasDisponibles() {
    const rows = await prisma.producto.findMany({
      where: { marca: { not: null } },
      distinct: ['marca'],
      select: { marca: true },
      orderBy: { marca: 'asc' }
    });
    return rows.map((item) => item.marca).filter(Boolean);
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
}
