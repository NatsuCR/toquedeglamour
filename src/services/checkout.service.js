import prisma from '../config/db.js';
import { CodigoPedidoService } from './codigo-pedido.service.js';
import { prepararItemsPedido } from './checkout-items.service.js';
import { OrderMailService } from './order-mail.service.js';
import { notificarAdminWhatsapp } from './admin-whatsapp.service.js';
import { FinanceSettingsService } from './finance-settings.service.js';
import { datosClientePedido, datosDireccionPedido, payloadPedido } from './checkout-payload.service.js';
import { shippingWithPromotions } from './shipping.service.js';
import { PromotionSettingsService } from './promotion-settings.service.js';
import { includedTax } from './tax.service.js';
import { WelcomeDiscountService } from './welcome-discount.service.js';

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
  static async procesarCompra(clienteId, carrito, body, archivo, welcomeProductId = null) {
    const canal = body.canalComprobante === 'WHATSAPP' ? 'WHATSAPP' : 'WEB';
    if (canal === 'WEB' && !archivo) {
      throw new Error('Debes adjuntar el comprobante o enviarlo por WhatsApp.');
    }
    const pedido = await prisma.$transaction(async (tx) => {
      const storedClient = await tx.cliente.findUnique({ where: { id: clienteId } });
      if (!storedClient) throw new Error('Cliente no encontrado.');
      const cliente = await WelcomeDiscountService.clientWithUsage(tx, storedClient);
      const tipoEntrega = body.tipoEntrega === 'DOMICILIO' ? 'DOMICILIO' : 'LOCAL';
      const datosCliente = datosClientePedido(body, cliente);
      const datosDireccion = tipoEntrega === 'DOMICILIO' ? datosDireccionPedido(body) : null;
      const promotions = await PromotionSettingsService.get(tx);
      const pricing = await prepararItemsPedido(tx, carrito, cliente, promotions, welcomeProductId);
      const { items, subtotal, subtotalOriginal, discounts, pesoTotalGramos } = pricing;
      if (discounts.welcome > 0) await WelcomeDiscountService.consume(tx, clienteId);
      const shipping = shippingWithPromotions(pesoTotalGramos, subtotal, promotions);
      const costoEnvio = tipoEntrega === 'DOMICILIO' ? shipping.costoEnvio : 0;
      const finance = await FinanceSettingsService.obtener();
      const ivaIncluido = includedTax(subtotal, finance.ivaActivo, finance.ivaPorcentaje);
      const codigo = await CodigoPedidoService.generarCodigo(tx, body.codigoPedido);
      await this.actualizarCliente(tx, clienteId, datosCliente, datosDireccion);
      const comprobanteRuta = archivo ? `/uploads/comprobantes/${archivo.filename}` : null;
      return tx.pedido.create({
        data: payloadPedido({
          clienteId, datosCliente, datosDireccion, tipoEntrega, items,
          subtotal, subtotalOriginal, discounts, ivaIncluido,
          costoEnvio, pesoTotalGramos, codigo, canal, comprobanteRuta, body, finance
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
