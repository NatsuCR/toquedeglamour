import fs from 'fs';
import path from 'path';
import { roundMoney } from '../utils/money.js';

export const includeProducto = {
  categoria: true,
  subcategoria: true,
  imagenes: true
};

export const mapProducto = (p) => p && ({
  ...p,
  imagenUrl: p.imagenes?.[0]?.ruta || null
});

export const mapProductos = (productos) => productos.map(mapProducto);

export function tipoVenta(data) {
  return data.tipoVenta === 'CONSULTA' ? 'CONSULTA' : 'DIRECTA';
}

export function requiereVentaDirecta(data) {
  const directa = tipoVenta(data) === 'DIRECTA';
  return directa && (data.precio === undefined || data.precio === '' ||
    data.stock === undefined || data.stock === '');
}

export function datosProducto(data, existente = null) {
  const tipo = tipoVenta(data);
  const consulta = tipo === 'CONSULTA';
  const marcarNuevo = data.esNuevo === 'on' || data.esNuevo === true;

  return {
    nombre: data.nombre ? data.nombre.trim() : existente?.nombre,
    descripcion: data.descripcion !== undefined
      ? (data.descripcion.trim() || 'Sin descripcion')
      : existente?.descripcion,
    precio: consulta ? null : valorMoney(data.precio, existente?.precio),
    costo: consulta ? 0 : valorMoney(data.costo, existente?.costo || 0),
    stock: consulta ? 0 : valorEntero(data.stock, existente?.stock || 0),
    categoriaId: data.categoriaId ? Number.parseInt(data.categoriaId, 10) : existente?.categoriaId,
    subcategoriaId: data.subcategoriaId ? Number.parseInt(data.subcategoriaId, 10) : null,
    tipoVenta: tipo,
    textoAlternativoImg: data.nombre ? data.nombre.trim() : existente?.textoAlternativoImg,
    esNuevo: marcarNuevo,
    fechaNuevo: marcarNuevo && !existente?.esNuevo ? new Date() : (marcarNuevo ? existente?.fechaNuevo : null)
  };
}

export function filtrosProducto(filtros) {
  const where = {};
  if (filtros.q) where.nombre = { contains: filtros.q };
  if (filtros.cat) where.categoria = { slug: filtros.cat };
  if (filtros.subcat) where.subcategoria = { slug: filtros.subcat };
  if (filtros.disponible) {
    where.tipoVenta = 'DIRECTA';
    where.stock = { gt: 0 };
  }
  if (filtros.minPrecio || filtros.maxPrecio) {
    where.precio = {};
    if (filtros.minPrecio) where.precio.gte = Number.parseFloat(filtros.minPrecio);
    if (filtros.maxPrecio) where.precio.lte = Number.parseFloat(filtros.maxPrecio);
  }
  return where;
}

export function ordenProducto(sort) {
  if (sort === 'asc') return { precio: 'asc' };
  if (sort === 'desc') return { precio: 'desc' };
  return { creadoEn: 'desc' };
}

export function borrarImagenes(imagenes) {
  (imagenes || []).forEach((img) => {
    const relativePath = img.ruta.startsWith('/') ? img.ruta.substring(1) : img.ruta;
    const oldPath = path.join(process.cwd(), 'public', relativePath);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  });
}

export function imagenCreate(imagenFile) {
  if (!imagenFile) return undefined;
  return { create: { ruta: `/uploads/productos/${imagenFile.filename}`, principal: true } };
}

function valorMoney(value, fallback) {
  return value !== undefined && value !== '' ? roundMoney(value) : fallback;
}

function valorEntero(value, fallback) {
  return value !== undefined && value !== '' ? Number.parseInt(value, 10) : fallback;
}
