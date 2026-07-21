import { CheckoutService } from '../services/checkout.service.js';
import { OrderWhatsappService } from '../services/order-whatsapp.service.js';
import { prepararResumenCarrito } from '../services/cart-summary.service.js';

export class CheckoutController {
  static async renderCheckout(req, res) {
    try {
      const resumen = await prepararResumenCarrito(req.session.carrito || []);
      if (resumen.carrito.length === 0) return res.redirect('/carrito');
      req.session.carrito = resumen.carrito;
      const datos = await CheckoutService.prepararCheckout(res.locals.cliente.id);
      const error = req.session.checkoutError || null;
      delete req.session.checkoutError;

      res.render('client/checkout', {
        user: datos.cliente,
        carrito: resumen.carrito,
        subtotal: resumen.subtotal,
        shipping: resumen.shipping,
        error,
        costoEnvioCorreos: resumen.shipping.costoEnvio,
        ...datos
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error cargando el checkout.');
    }
  }

  static async procesarCheckout(req, res) {
    try {
      const pedido = await CheckoutService.procesarCompra(
        res.locals.cliente.id,
        req.session.carrito,
        req.body,
        req.file
      );

      req.session.carrito = [];
      res.render('client/checkout-success', {
        user: pedido.cliente,
        pedido,
        whatsappLink: OrderWhatsappService.link(pedido)
      });
    } catch (error) {
      console.error(error);
      req.session.checkoutError = error.message;
      res.redirect('/checkout');
    }
  }
}
