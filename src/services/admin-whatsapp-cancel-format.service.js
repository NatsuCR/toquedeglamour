import { formatMoneyCRC as money, roundMoney } from '../utils/money.js';
import { formatWeight } from './shipping.service.js';

const paymentLabels = {
  SINPE: 'SINPE Movil',
  DEPOSITO: 'Transferencia bancaria'
};

const value = (text, fallback = 'No indicado') => {
  const clean = String(text || '').trim();
  return clean || fallback;
};

const dateCR = (date = new Date()) => new Date(date).toLocaleString('es-CR', {
  timeZone: 'America/Costa_Rica'
});

function clienteTexto(pedido) {
  const nombre = `${value(pedido.nombreCliente || pedido.cliente?.nombre)} ${value(
    pedido.apellidosCliente || pedido.cliente?.apellidos,
    ''
  )}`.trim();
  return [
    `Cliente: ${nombre}`,
    `Correo: ${value(pedido.correoCliente || pedido.cliente?.correo)}`,
    `Cedula: ${value(pedido.cedulaCliente || pedido.cliente?.cedula)}`,
    `Celular 1: ${value(pedido.celular1Cliente || pedido.cliente?.celular1)}`,
    `Celular 2: ${value(pedido.celular2Cliente || pedido.cliente?.celular2)}`
  ].join('\n');
}

function productosTexto(pedido) {
  return pedido.items.map((item) => {
    const producto = item.producto || {};
    const marca = producto.marca ? ` (${producto.marca})` : '';
    const total = roundMoney(item.precioUnitario) * item.cantidad;
    return `- ${producto.nombre || 'Producto'}${marca} x${item.cantidad} | ${money(total)}`;
  }).join('\n') || 'Sin productos';
}

function entregaTexto(pedido) {
  if (pedido.tipoEntrega !== 'DOMICILIO') return 'Entrega: Retiro en local';
  const dir = pedido.direccionEnvio || {};
  return [
    'Entrega: Correos de Costa Rica',
    `Zona: ${value(dir.zonaEntrega)}`,
    `Provincia: ${value(dir.provincia)}`,
    `Canton: ${value(dir.canton)}`,
    `Distrito: ${value(dir.distrito)}`,
    `Direccion exacta: ${value(dir.direccionExacta)}`,
    `Descripcion de casa: ${value(dir.descripcionCasa)}`
  ].join('\n');
}

export function cancelacionClienteWhatsappTexto(pedido) {
  return [
    'Solicitud de devolucion/cancelacion',
    `Pedido: ${pedido.codigo || pedido.id}`,
    `Fecha del pedido: ${dateCR(pedido.creadoEn)}`,
    `Fecha de solicitud: ${dateCR(pedido.canceladoEn || new Date())}`,
    `Fecha actual: ${dateCR(new Date())}`,
    '',
    clienteTexto(pedido),
    '',
    `Motivo:\n${value(pedido.motivoCancelacion)}`,
    '',
    `Productos:\n${productosTexto(pedido)}`,
    '',
    `Metodo de pago: ${paymentLabels[pedido.metodoPago] || pedido.metodoPago}`,
    `Subtotal: ${money(pedido.subtotal)}`,
    `Peso total: ${formatWeight(pedido.pesoTotalGramos || 0)}`,
    `Envio: ${money(pedido.costoEnvio)}`,
    `Total: ${money(pedido.total)}`,
    '',
    entregaTexto(pedido),
    '',
    'Aviso al cliente: devolucion del dinero en revision para 8 dias habiles.'
  ].join('\n');
}
