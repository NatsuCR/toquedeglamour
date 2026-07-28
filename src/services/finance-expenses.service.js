import prisma from '../config/db.js';
import { roundMoney } from '../utils/money.js';
import fs from 'fs';
import path from 'path';

const clean = (value) => String(value || '').trim();
const selectSql = `
  SELECT id, fecha, categoria, descripcion, monto, comprobante_ruta AS comprobanteRuta,
  comprobante_nombre AS comprobanteNombre, comprobante_mime AS comprobanteMime, creado_en AS creadoEn
  FROM gastos_adicionales`;

export function dateRange(query = {}) {
  const range = {};
  if (query.fechaInicio) range.from = new Date(`${query.fechaInicio}T00:00:00.000-06:00`);
  if (query.fechaFin) range.to = new Date(`${query.fechaFin}T23:59:59.999-06:00`);
  return range;
}

function normalizar(row) {
  return {
    id: Number(row.id),
    fecha: row.fecha,
    categoria: row.categoria || 'General',
    descripcion: row.descripcion,
    monto: roundMoney(row.monto),
    comprobanteRuta: row.comprobanteRuta,
    comprobanteNombre: row.comprobanteNombre,
    comprobanteMime: row.comprobanteMime,
    creadoEn: row.creadoEn
  };
}

function proof(file) {
  if (!file) return { ruta: null, nombre: null, mime: null };
  return {
    ruta: `/uploads/gastos/${file.filename}`,
    nombre: file.originalname,
    mime: file.mimetype
  };
}

function deleteProof(ruta) {
  if (!ruta?.startsWith('/uploads/gastos/')) return;
  const base = path.resolve('public/uploads/gastos');
  const filePath = path.resolve('public', ruta.replace(/^\//, ''));
  if (filePath.startsWith(base) && fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

export class FinanceExpensesService {
  static async listar(query = {}) {
    const { from, to } = dateRange(query);
    let rows;
    if (from && to) {
      rows = await prisma.$queryRawUnsafe(
        `${selectSql} WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC, id DESC`, from, to
      );
    } else if (from) {
      rows = await prisma.$queryRawUnsafe(
        `${selectSql} WHERE fecha >= ? ORDER BY fecha DESC, id DESC`, from
      );
    } else if (to) {
      rows = await prisma.$queryRawUnsafe(
        `${selectSql} WHERE fecha <= ? ORDER BY fecha DESC, id DESC`, to
      );
    } else {
      rows = await prisma.$queryRawUnsafe(`${selectSql} ORDER BY fecha DESC, id DESC`);
    }
    return rows.map(normalizar);
  }

  static async total(query = {}) {
    const gastos = await this.listar(query);
    return gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
  }

  static async crear(data, file = null) {
    const descripcion = clean(data.descripcion);
    const categoria = clean(data.categoria) || 'General';
    const monto = roundMoney(data.monto);
    if (!descripcion || monto <= 0) throw new Error('Descripcion y monto son obligatorios.');
    const fecha = data.fecha ? new Date(`${data.fecha}T12:00:00.000Z`) : new Date();
    const comprobante = proof(file);
    await prisma.$executeRaw`
      INSERT INTO gastos_adicionales
      (fecha, categoria, descripcion, monto, comprobante_ruta, comprobante_nombre, comprobante_mime)
      VALUES (${fecha}, ${categoria}, ${descripcion}, ${monto},
      ${comprobante.ruta}, ${comprobante.nombre}, ${comprobante.mime})`;
  }

  static async eliminar(id) {
    const gastoId = Number.parseInt(id, 10);
    if (!gastoId) throw new Error('Gasto invalido.');
    const rows = await prisma.$queryRaw`
      SELECT comprobante_ruta AS comprobanteRuta FROM gastos_adicionales WHERE id = ${gastoId}`;
    await prisma.$executeRaw`DELETE FROM gastos_adicionales WHERE id = ${gastoId}`;
    deleteProof(rows[0]?.comprobanteRuta);
  }
}
