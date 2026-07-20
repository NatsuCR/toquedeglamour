import { roundMoney } from '../utils/money.js';

export const invoiceBrand = {
  wine: '#7b2446',
  wineDark: '#54172d',
  rose: '#fff1f6',
  gold: '#c7964a',
  ink: '#2f1b25',
  muted: '#75616b',
  line: '#ead2dc'
};

export const labelPago = {
  SINPE: 'SINPE Movil',
  DEPOSITO: 'Transaccion bancaria'
};

export const labelEntrega = {
  LOCAL: 'Retiro en local',
  DOMICILIO: 'Correos de Costa Rica'
};

export const moneyPdf = (amount) => `CRC ${new Intl.NumberFormat('es-CR', {
  maximumFractionDigits: 0
}).format(roundMoney(amount))}`;

export const clienteNombre = (pedido) => {
  const nombre = pedido.nombreCliente || pedido.cliente.nombre;
  const apellidos = pedido.apellidosCliente || pedido.cliente.apellidos;
  return `${nombre} ${apellidos}`;
};
