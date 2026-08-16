import { dateRange } from './finance-expenses.service.js';
import { roundMoney } from '../utils/money.js';
import { originalSubtotal, orderDiscountTotal } from './order-pricing.service.js';

export function dateWhere(query) {
  const { from, to } = dateRange(query);
  const where = {};
  if (from || to) where.creadoEn = {};
  if (from) where.creadoEn.gte = from;
  if (to) where.creadoEn.lte = to;
  return where;
}

export function webSale(order) {
  const shipping = roundMoney(order.costoEnvio);
  const tax = roundMoney(order.ivaIncluido || 0);
  const costs = order.items.reduce((sum, item) => sum + roundMoney(item.costoUnitario) * item.cantidad, 0);
  const base = roundMoney(order.total) - tax;
  return {
    fuente: 'TIENDA WEB', tipoComprobante: 'CONTROL INTERNO',
    claveHacienda: '', consecutivoHacienda: '', actividadEconomica: '',
    codigo: order.codigo || `PED-${order.id}`, fecha: order.creadoEn,
    estado: order.estado, responsable: 'Sistema web',
    cliente: `${order.nombreCliente || ''} ${order.apellidosCliente || ''}`.trim(),
    identificacion: order.cedulaCliente || '', correo: order.correoCliente || '',
    condicion: 'Contado', medioPago: order.metodoPago, moneda: 'CRC',
    subtotalProductos: roundMoney(order.subtotal), envio: shipping,
    subtotalOriginal: originalSubtotal(order),
    descuentos: orderDiscountTotal(order),
    descuentoBienvenida: roundMoney(order.descuentoBienvenida),
    baseSinIva: base, iva: tax, total: roundMoney(order.total),
    costos: costs, comision: 0, neto: base - costs,
    notas: order.motivoCancelacion || '',
    comprobantes: order.comprobantePago?.rutaArchivo || ''
  };
}

export function localSale(sale) {
  const costs = sale.items.reduce((sum, item) => sum + roundMoney(item.costoUnitario) * item.cantidad, 0);
  const proofs = (sale.adjuntos || []).map((proof) => proof.nombre).join(', ');
  return {
    fuente: 'VENTA PRESENCIAL', tipoComprobante: 'CONTROL INTERNO',
    claveHacienda: '', consecutivoHacienda: '', actividadEconomica: '',
    codigo: sale.codigo, fecha: sale.creadoEn, estado: 'COMPLETADA',
    responsable: sale.vendedor.correo, cliente: sale.clienteNombre || 'Consumidor final',
    identificacion: sale.clienteCedula || '', correo: '', condicion: 'Contado',
    medioPago: sale.metodoPago, moneda: 'CRC',
    subtotalProductos: roundMoney(sale.subtotal), envio: 0,
    subtotalOriginal: roundMoney(sale.subtotal), descuentos: 0,
    descuentoBienvenida: 0,
    baseSinIva: roundMoney(sale.total) - roundMoney(sale.iva), iva: roundMoney(sale.iva),
    total: roundMoney(sale.total), costos: costs, comision: roundMoney(sale.comision),
    neto: roundMoney(sale.total) - roundMoney(sale.iva) - costs - roundMoney(sale.comision),
    notas: sale.notas || '', comprobantes: proofs
  };
}

export function details(sale, source) {
  const base = roundMoney(sale.subtotal) - roundMoney(sale.iva || 0);
  const rate = base > 0 ? roundMoney(sale.iva || 0) / base : 0;
  return sale.items.map((item, index) => {
    const subtotal = roundMoney(item.precioUnitario) * item.cantidad;
    const product = item.producto || {};
    return {
      codigo: sale.codigo || `PED-${sale.id}`, fuente: source, linea: index + 1,
      sku: `PRD-${String(item.productoId).padStart(4, '0')}`,
      producto: product.nombre || `Producto #${item.productoId}`,
      marca: product.marca || '',
      categoria: [product.categoria?.nombre || '', product.subcategoria?.nombre || '']
        .filter(Boolean).join(' / '),
      cantidad: item.cantidad, unidad: 'Unid',
      precioUnitario: roundMoney(item.precioUnitario),
      costoUnitario: roundMoney(item.costoUnitario),
      subtotal,
      tarifaIva: rate, iva: roundMoney(subtotal * rate / (1 + rate)),
      totalLinea: subtotal,
      costoTotal: roundMoney(item.costoUnitario) * item.cantidad
    };
  });
}
