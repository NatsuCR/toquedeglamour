import { formatMoneyCRC as money, roundMoney } from '../utils/money.js';
import { formatWeight } from './shipping.service.js';

const pago = {
  SINPE: 'SINPE Movil',
  DEPOSITO: 'Transaccion bancaria'
};

const entrega = {
  LOCAL: 'Retiro en local',
  DOMICILIO: 'Correos de Costa Rica'
};

function productosTexto(pedido) {
  return pedido.items.map((item) => {
    const marca = item.producto.marca ? ` (${item.producto.marca})` : '';
    const linea = `${item.cantidad} x ${item.producto.nombre}${marca}`;
    return `- ${linea} | ${money(roundMoney(item.precioUnitario) * item.cantidad)}`;
  }).join('\n');
}

function direccionTexto(pedido) {
  if (pedido.tipoEntrega !== 'DOMICILIO' || !pedido.direccionEnvio) return 'Retiro en local';
  const dir = pedido.direccionEnvio;
  const casa = dir.descripcionCasa ? ` Casa: ${dir.descripcionCasa}` : '';
  const zona = dir.zonaEntrega ? `Zona ${dir.zonaEntrega}. ` : '';
  return `${zona}${dir.provincia}, ${dir.canton}, ${dir.distrito}. ${dir.direccionExacta}.${casa}`;
}

function ivaTexto(pedido) {
  const base = roundMoney(pedido.subtotal) + roundMoney(pedido.costoEnvio || 0);
  const iva = Math.max(0, roundMoney(pedido.total) - base);
  return iva > 0 ? [`IVA: ${money(iva)}`] : [];
}

export class OrderWhatsappService {
  static link(pedido, telefono = '50685203998') {
    const cliente = `${pedido.nombreCliente || pedido.cliente.nombre} ${pedido.apellidosCliente || pedido.cliente.apellidos}`;
    const cedula = pedido.cedulaCliente || pedido.cliente.cedula || 'No indicada';
    const texto = [
      'Hola, envio el comprobante de pago.',
      `Pedido: ${pedido.codigo}`,
      `Cliente: ${cliente}`,
      `Cedula: ${cedula}`,
      '',
      'Productos:',
      productosTexto(pedido),
      '',
      `Subtotal: ${money(pedido.subtotal)}`,
      `Peso total: ${formatWeight(pedido.pesoTotalGramos || 0)}`,
      `Envio: ${money(pedido.costoEnvio)}`,
      ...ivaTexto(pedido),
      `Total: ${money(pedido.total)}`,
      `Metodo de pago: ${pago[pedido.metodoPago] || pedido.metodoPago}`,
      `Entrega: ${entrega[pedido.tipoEntrega] || pedido.tipoEntrega}`,
      `Direccion/retiro: ${direccionTexto(pedido)}`,
      '',
      'Adjunto el comprobante por este medio.'
    ].join('\n');
    return `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;
  }
}
