import { roundMoney } from '../utils/money.js';
import { zonaEntregaPorUbicacion } from './geo-zone.service.js';

const limpiar = (value) => String(value || '').trim();
const requerido = (value, label) => {
  const limpio = limpiar(value);
  if (!limpio) throw new Error(`${label} es requerido.`);
  return limpio;
};

export function datosClientePedido(body, cliente) {
  return {
    nombre: requerido(body.nombre || cliente.nombre, 'Nombre'),
    apellidos: requerido(body.apellidos || cliente.apellidos, 'Apellidos'),
    correo: requerido(body.correo || cliente.correo, 'Correo').toLowerCase(),
    cedula: requerido(body.cedula || cliente.cedula, 'Cedula'),
    celular1: requerido(body.celular1 || cliente.celular1, 'Celular 1'),
    celular2: limpiar(body.celular2 || cliente.celular2)
  };
}

export function datosDireccionPedido(body) {
  const direccion = {
    provincia: requerido(body.provincia, 'Provincia'),
    canton: requerido(body.canton, 'Canton'),
    distrito: requerido(body.distrito, 'Distrito'),
    direccionExacta: requerido(body.direccionExacta, 'Direccion exacta'),
    descripcionCasa: limpiar(body.descripcionCasa) || null
  };
  return { ...direccion, zonaEntrega: zonaEntregaPorUbicacion(direccion.provincia, direccion.canton) };
}

export function payloadPedido(data) {
  const subtotal = roundMoney(data.subtotal);
  const costoEnvio = roundMoney(data.costoEnvio);
  const iva = data.finance?.ivaActivo
    ? roundMoney(subtotal * (Number(data.finance.ivaPorcentaje) / 100))
    : 0;
  const payload = {
    codigo: data.codigo,
    clienteId: data.clienteId,
    nombreCliente: data.datosCliente.nombre,
    apellidosCliente: data.datosCliente.apellidos,
    correoCliente: data.datosCliente.correo,
    cedulaCliente: data.datosCliente.cedula,
    celular1Cliente: data.datosCliente.celular1,
    celular2Cliente: data.datosCliente.celular2 || null,
    subtotal,
    costoEnvio,
    pesoTotalGramos: Number.parseInt(data.pesoTotalGramos, 10) || 0,
    total: roundMoney(subtotal + costoEnvio + iva),
    estado: 'PENDIENTE_VERIFICACION',
    fase: 'PREPARACION',
    tipoEntrega: data.tipoEntrega,
    metodoPago: data.body.metodoPago === 'DEPOSITO' ? 'DEPOSITO' : 'SINPE',
    canalComprobante: data.canal,
    items: { create: data.items },
    comprobantePago: { create: { rutaArchivo: data.comprobanteRuta, enviadoPorWhatsapp: data.canal === 'WHATSAPP' } }
  };
  if (data.datosDireccion) {
    payload.direccionEnvio = { create: { ...data.datosDireccion, codigoPostal: '00000' } };
  }
  return payload;
}
