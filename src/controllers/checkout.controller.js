import { CheckoutService, COSTO_ENVIO_DOMICILIO } from '../services/checkout.service.js';
import { OrderWhatsappService } from '../services/order-whatsapp.service.js';
import { roundMoney } from '../utils/money.js';

const normalizarCarrito = (carrito) => carrito.map((item) => ({
  ...item,
  precio: roundMoney(item.precio)
}));

export class CheckoutController {
  static async renderCheckout(req, res) {
    try {
      const carrito = normalizarCarrito(req.session.carrito || []);
      if (carrito.length === 0) return res.redirect('/carrito');
      req.session.carrito = carrito;

      const subtotal = carrito.reduce((sum, item) => sum + roundMoney(item.precio) * item.cantidad, 0);
      const datos = await CheckoutService.prepararCheckout(res.locals.cliente.id);
      const error = req.session.checkoutError || null;
      delete req.session.checkoutError;

      res.render('client/checkout', {
        user: datos.cliente,
        carrito,
        subtotal,
        error,
        costoEnvioDomicilio: COSTO_ENVIO_DOMICILIO,
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
