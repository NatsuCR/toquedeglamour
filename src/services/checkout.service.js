import prisma from '../config/db.js';
import { CodigoPedidoService } from './codigo-pedido.service.js';
import { prepararItemsPedido } from './checkout-items.service.js';
import { OrderMailService } from './order-mail.service.js';
import { notificarAdminWhatsapp } from './admin-whatsapp.service.js';
import { FinanceSettingsService } from './finance-settings.service.js';
import { datosClientePedido, datosDireccionPedido, payloadPedido } from './checkout-payload.service.js';
export const COSTO_ENVIO_DOMICILIO = 3000;
const includePedido = {
  cliente: true,
  direccionEnvio: true,
  comprobantePago: true,
  items: { include: { producto: true } }
};
export class CheckoutService {
  static async prepararCheckout(clienteId) {
    const [cliente, ultimaDireccion, codigoPedido, finance] = await Promise.all([
      prisma.cliente.findUnique({ where: { id: clienteId } }),
      prisma.direccionCliente.findFirst({
        where: { clienteId },
        orderBy: { creadoEn: 'desc' }
      }),
      CodigoPedidoService.generarCodigo(),
      FinanceSettingsService.obtener()
    ]);
    return { cliente, ultimaDireccion, codigoPedido, finance };
  }
  static async procesarCompra(clienteId, carrito, body, archivo) {
    const canal = body.canalComprobante === 'WHATSAPP' ? 'WHATSAPP' : 'WEB';
    if (canal === 'WEB' && !archivo) {
      throw new Error('Debes adjuntar el comprobante o enviarlo por WhatsApp.');
    }
    const pedido = await prisma.$transaction(async (tx) => {
      const cliente = await tx.cliente.findUnique({ where: { id: clienteId } });
      if (!cliente) throw new Error('Cliente no encontrado.');
      const tipoEntrega = body.tipoEntrega === 'DOMICILIO' ? 'DOMICILIO' : 'LOCAL';
      const datosCliente = datosClientePedido(body, cliente);
      const datosDireccion = tipoEntrega === 'DOMICILIO' ? datosDireccionPedido(body) : null;
      const { items, subtotal } = await prepararItemsPedido(tx, carrito);
      const costoEnvio = tipoEntrega === 'DOMICILIO' ? COSTO_ENVIO_DOMICILIO : 0;
      const finance = await FinanceSettingsService.obtener();
      const codigo = await CodigoPedidoService.generarCodigo(tx, body.codigoPedido);
      await this.actualizarCliente(tx, clienteId, datosCliente, datosDireccion);
      const comprobanteRuta = archivo ? `/uploads/comprobantes/${archivo.filename}` : null;
      return tx.pedido.create({
        data: payloadPedido({
          clienteId, datosCliente, datosDireccion, tipoEntrega, items,
          subtotal, costoEnvio, codigo, canal, comprobanteRuta, body, finance
        }),
        include: includePedido
      });
    });
    OrderMailService.enviarConfirmacion(pedido).catch((error) => {
      console.error('No se pudo enviar la confirmacion:', error.message);
    });
    notificarAdminWhatsapp(pedido).catch((error) => {
      console.error('No se pudo notificar por WhatsApp:', error.message);
    });
    return pedido;
  }

  static async actualizarCliente(tx, clienteId, datosCliente, datosDireccion) {
    const { correo, ...perfil } = datosCliente;
    await tx.cliente.update({ where: { id: clienteId }, data: perfil });
    if (!datosDireccion) return;
    await tx.direccionCliente.create({
      data: { clienteId, ...datosDireccion, celular1: datosCliente.celular1, celular2: datosCliente.celular2 || null }
    });
  }
}
