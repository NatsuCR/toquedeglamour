import { formatMoneyCRC as money, roundMoney } from '../utils/money.js';

const paymentLabels = {
  SINPE: 'SINPE Movil',
  DEPOSITO: 'Transaccion bancaria'
};

const value = (text, fallback = 'No indicado') => {
  const clean = String(text || '').trim();
  return clean || fallback;
};

function productosTexto(pedido) {
  return pedido.items.map((item) => {
    const total = roundMoney(item.precioUnitario) * item.cantidad;
    return `- ${item.producto.nombre} x${item.cantidad} | ${money(total)}`;
  }).join('\n') || 'Sin productos';
}

function clienteTexto(pedido) {
  const nombre = `${value(pedido.nombreCliente || pedido.cliente.nombre)} ${value(
    pedido.apellidosCliente || pedido.cliente.apellidos,
    ''
  )}`.trim();
  return [
    `Cliente: ${nombre}`,
    `Correo: ${value(pedido.correoCliente || pedido.cliente.correo)}`,
    `Cedula: ${value(pedido.cedulaCliente || pedido.cliente.cedula)}`,
    `Celular 1: ${value(pedido.celular1Cliente || pedido.cliente.celular1)}`,
    `Celular 2: ${value(pedido.celular2Cliente || pedido.cliente.celular2)}`
  ].join('\n');
}

function entregaDomicilio(pedido) {
  const dir = pedido.direccionEnvio || {};
  return [
    'Entrega: Correos de Costa Rica',
    `Provincia: ${value(dir.provincia)}`,
    `Canton: ${value(dir.canton)}`,
    `Distrito: ${value(dir.distrito)}`,
    `Direccion exacta: ${value(dir.direccionExacta)}`,
    `Descripcion de casa: ${value(dir.descripcionCasa)}`,
    `Costo de envio: ${money(pedido.costoEnvio)}`
  ].join('\n');
}

function entregaLocal(pedido) {
  return [
    'Entrega: Retiro en local',
    `Nombre retiro: ${value(pedido.nombreCliente || pedido.cliente.nombre)}`,
    `Cedula retiro: ${value(pedido.cedulaCliente || pedido.cliente.cedula)}`,
    `Celular retiro: ${value(pedido.celular1Cliente || pedido.cliente.celular1)}`,
    'Costo de envio: Gratis'
  ].join('\n');
}

function entregaTexto(pedido) {
  return pedido.tipoEntrega === 'DOMICILIO' ? entregaDomicilio(pedido) : entregaLocal(pedido);
}

function comprobanteTexto(pedido) {
  const proof = pedido.comprobantePago;
  if (proof?.enviadoPorWhatsapp) return 'Comprobante: cliente lo enviara por WhatsApp';
  if (!proof?.rutaArchivo) return 'Comprobante: pendiente';
  return [
    'Comprobante: adjunto en la web',
    'Revisar archivo en Administracion > Pedidos'
  ].join('\n');
}

function ivaTexto(pedido) {
  const base = roundMoney(pedido.subtotal) + roundMoney(pedido.costoEnvio || 0);
  const iva = Math.max(0, roundMoney(pedido.total) - base);
  return iva > 0 ? [`IVA: ${money(iva)}`] : [];
}

export function pedidoWhatsappTexto(pedido) {
  return [
    'Nuevo pago en Toque de Glamour',
    `Pedido: ${pedido.codigo || pedido.id}`,
    '',
    clienteTexto(pedido),
    '',
    `Productos:\n${productosTexto(pedido)}`,
    '',
    `Metodo de pago: ${paymentLabels[pedido.metodoPago] || pedido.metodoPago}`,
    `Subtotal: ${money(pedido.subtotal)}`,
    `Envio: ${money(pedido.costoEnvio)}`,
    ...ivaTexto(pedido),
    `Total: ${money(pedido.total)}`,
    '',
    entregaTexto(pedido),
    '',
    comprobanteTexto(pedido)
  ].join('\n');
}

export function ticketWhatsappTexto(ticket) {
  const cliente = ticket.cliente || {};
  const nombre = `${cliente.nombre || ''} ${cliente.apellidos || ''}`.trim();
  const primerMensaje = ticket.mensajes?.[0]?.mensaje || 'Sin mensaje inicial';
  return [
    'Nuevo ticket de soporte en Toque de Glamour',
    `Ticket: #${ticket.id}`,
    `Cliente: ${nombre || 'Cliente'}`,
    `Correo: ${value(cliente.correo)}`,
    `Asunto: ${ticket.asunto}`,
    `Mensaje: ${primerMensaje}`
  ].join('\n');
}
