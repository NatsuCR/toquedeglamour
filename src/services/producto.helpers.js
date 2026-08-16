import fs from 'fs';
import path from 'path';
import { roundMoney } from '../utils/money.js';
import { parseProductWeight } from './product-weight.service.js';
import { productContent } from './product-content.service.js';

export const includeProducto = {
  categoria: true,
  subcategoria: true,
  imagenes: true,
  resenas: { orderBy: { creadoEn: 'desc' } },
  preguntasFrecuentes: { orderBy: { creadoEn: 'asc' } }
};

export const mapProducto = (p) => {
  if (!p) return p;
  const imagenes = ordenarImagenes(p.imagenes);
  return { ...p, imagenes, imagenUrl: imagenes[0]?.ruta || null };
};

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
  const promocionPorcentaje = consulta ? 0 : porcentajePromocion(data.promocionPorcentaje, existente);
  const promocionActiva = !consulta && (data.promocionActiva === 'on' || data.promocionActiva === true);
  if (promocionActiva && promocionPorcentaje < 1) throw new Error('Define un porcentaje para activar la promoción.');

  return {
    nombre: data.nombre ? data.nombre.trim() : existente?.nombre,
    marca: data.marca !== undefined
      ? (data.marca.trim() || null)
      : existente?.marca,
    ...productContent(data, existente, consulta),
    precio: consulta ? null : valorMoney(data.precio, existente?.precio),
    costo: consulta ? 0 : valorMoney(data.costo, existente?.costo || 0),
    stock: consulta ? 0 : valorEntero(data.stock, existente?.stock || 0),
    pesoGramos: consulta ? 0 : parseProductWeight(data.pesoGramos, existente?.pesoGramos),
    categoriaId: data.categoriaId ? Number.parseInt(data.categoriaId, 10) : existente?.categoriaId,
    subcategoriaId: data.subcategoriaId ? Number.parseInt(data.subcategoriaId, 10) : null,
    tipoVenta: tipo,
    textoAlternativoImg: data.nombre ? data.nombre.trim() : existente?.textoAlternativoImg,
    esNuevo: marcarNuevo,
    fechaNuevo: marcarNuevo && !existente?.esNuevo ? new Date() : (marcarNuevo ? existente?.fechaNuevo : null),
    promocionActiva,
    promocionPorcentaje
  };
}

function porcentajePromocion(value, existente) {
  const parsed = value === undefined ? Number(existente?.promocionPorcentaje || 0) : Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 90) {
    throw new Error('El porcentaje de promoción debe estar entre 0 y 90.');
  }
  return parsed;
}
export function borrarImagenes(imagenes) {
  (imagenes || []).forEach((img) => {
    const relativePath = img.ruta.startsWith('/') ? img.ruta.substring(1) : img.ruta;
    const oldPath = path.join(process.cwd(), 'public', relativePath);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  });
}

export function imagenesCreate(imagenFiles) {
  const archivos = Array.isArray(imagenFiles) ? imagenFiles.filter(Boolean) : [];
  if (archivos.length === 0) return undefined;
  return {
    create: archivos.map((file, index) => ({
      ruta: `/uploads/productos/${file.filename}`,
      principal: index === 0
    }))
  };
}

export function tieneImagenesNuevas(imagenFiles) {
  return Array.isArray(imagenFiles) && imagenFiles.length > 0;
}

function valorMoney(value, fallback) {
  return value !== undefined && value !== '' ? roundMoney(value) : fallback;
}

function valorEntero(value, fallback) {
  return value !== undefined && value !== '' ? Number.parseInt(value, 10) : fallback;
}

function ordenarImagenes(imagenes = []) {
  return [...imagenes].sort((a, b) => {
    if (a.principal !== b.principal) return a.principal ? -1 : 1;
    return a.id - b.id;
  });
}
