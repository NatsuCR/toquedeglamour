import prisma from '../config/db.js';
import { roundMoney } from '../utils/money.js';
import { FinanceSettingsService } from './finance-settings.service.js';

const PAYMENT_METHODS = new Set(['EFECTIVO', 'SINPE', 'TARJETA', 'TRANSFERENCIA', 'OTRO']);
const clean = (value) => String(value || '').trim();
const toNumber = (value) => Number.parseFloat(String(value || '').replace(',', '.'));

function parseItems(value) {
  let parsed;
  try {
    parsed = JSON.parse(value || '[]');
  } catch {
    throw new Error('La seleccion de productos no es valida.');
  }
  const items = parsed
    .map((item) => ({
      productoId: Number.parseInt(item.productoId, 10),
      cantidad: Number.parseInt(item.cantidad, 10),
      precioManual: toNumber(item.precioManual)
    }))
    .filter((item) => item.productoId > 0 && item.cantidad > 0);
  if (!items.length) throw new Error('Agrega al menos un producto a la venta.');
  return items;
}

function attachments(files = []) {
  const proofs = files.filter(Boolean).map((file) => ({
    ruta: `/uploads/ventas/${file.filename}`,
    nombre: file.originalname,
    mime: file.mimetype
  }));
  return proofs.length ? { create: proofs } : undefined;
}

export class SalesService {
  static async products() {
    return prisma.producto.findMany({
      where: {
        OR: [
          { tipoVenta: 'CONSULTA' },
          { tipoVenta: 'DIRECTA', precio: { not: null } }
        ]
      },
      include: { categoria: true, subcategoria: true, imagenes: true },
      orderBy: { nombre: 'asc' }
    });
  }

  static async recent() {
    return prisma.ventaPresencial.findMany({
      take: 30,
      orderBy: { creadoEn: 'desc' },
      include: {
        vendedor: true,
        adjuntos: true,
        items: { include: { producto: { include: { categoria: true, subcategoria: true } } } }
      }
    });
  }

  static async create(seller, data, files = []) {
    const requested = parseItems(data.itemsJson);
    const settings = await FinanceSettingsService.obtener();
    return prisma.$transaction(async (tx) => {
      const products = await tx.producto.findMany({
        where: { id: { in: requested.map((item) => item.productoId) } }
      });
      const saleItems = [];
      let subtotal = 0;
      for (const requestedItem of requested) {
        const product = products.find((item) => item.id === requestedItem.productoId);
        if (!product) {
          throw new Error('Uno de los productos ya no esta disponible.');
        }
        const consultation = product.tipoVenta === 'CONSULTA';
        const price = consultation ? roundMoney(requestedItem.precioManual) : roundMoney(product.precio);
        if (price <= 0) throw new Error(`Define un precio valido para ${product.nombre}.`);
        if (!consultation) {
          const updated = await tx.producto.updateMany({
            where: { id: product.id, stock: { gte: requestedItem.cantidad } },
            data: { stock: { decrement: requestedItem.cantidad } }
          });
          if (!updated.count) throw new Error(`Stock insuficiente para ${product.nombre}.`);
        }
        subtotal += price * requestedItem.cantidad;
        saleItems.push({
          productoId: product.id,
          cantidad: requestedItem.cantidad,
          precioUnitario: price,
          costoUnitario: roundMoney(product.costo)
        });
      }
      const iva = settings.ivaActivo
        ? roundMoney(subtotal * (settings.ivaPorcentaje / 100))
        : 0;
      const commission = seller.rol === 'EMPLEADO' ? roundMoney(subtotal * 0.1) : 0;
      return tx.ventaPresencial.create({
        data: {
          codigo: `VP-${Date.now()}-${seller.id}`,
          vendedorId: seller.id,
          clienteNombre: clean(data.clienteNombre) || null,
          clienteCedula: clean(data.clienteCedula) || null,
          metodoPago: PAYMENT_METHODS.has(data.metodoPago) ? data.metodoPago : 'EFECTIVO',
          subtotal,
          iva,
          total: roundMoney(subtotal + iva),
          comision: commission,
          notas: clean(data.notas) || null,
          items: { create: saleItems },
          adjuntos: data.metodoPago === 'EFECTIVO' ? undefined : attachments(files)
        },
        include: { vendedor: true, adjuntos: true, items: { include: { producto: true } } }
      });
    });
  }
}
