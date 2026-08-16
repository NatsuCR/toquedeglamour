import { ProductoService } from '../services/producto.service.js';
import { FinanceSettingsService } from '../services/finance-settings.service.js';
import { prepararResumenCarrito } from '../services/cart-summary.service.js';
import { roundMoney } from '../utils/money.js';
import { includedTax } from '../services/tax.service.js';

const numeroPositivo = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export class CartController {
  static async renderCarrito(req, res) {
    const resumen = await prepararResumenCarrito(
      req.session.carrito || [], res.locals.cliente?.id, req.session.welcomeProductId
    );
    req.session.carrito = resumen.carrito;
    const finance = await FinanceSettingsService.obtener();
    const iva = includedTax(resumen.subtotal, finance.ivaActivo, finance.ivaPorcentaje);
    res.render('client/carrito', {
      user: res.locals.cliente,
      carrito: resumen.carrito,
      subtotal: resumen.subtotal,
      finance,
      iva,
      shipping: resumen.shipping,
      total: roundMoney(resumen.subtotal + resumen.shipping.costoEnvio),
      ...resumen
    });
  }

  static seleccionarBienvenida(req, res) {
    const selected = numeroPositivo(req.body.productoId);
    const inCart = (req.session.carrito || []).some((item) => item.productoId === selected);
    req.session.welcomeProductId = inCart ? selected : null;
    req.session.save(() => res.redirect('/carrito'));
  }

  static async agregarItem(req, res) {
    try {
      const productoId = numeroPositivo(req.body.productoId);
      const cantidad = numeroPositivo(req.body.cantidad);
      if (!productoId || !cantidad) return res.status(400).send('Cantidad invalida.');

      const producto = await ProductoService.obtenerPorId(productoId);
      if (!producto || producto.tipoVenta === 'CONSULTA' || producto.precio === null || producto.stock < 1) {
        return res.status(400).send('Producto no disponible para carrito.');
      }

      req.session.carrito = req.session.carrito || [];
      const item = req.session.carrito.find((actual) => actual.productoId === productoId);
      const cantidadFinal = Math.min((item?.cantidad || 0) + cantidad, producto.stock);

      if (item) {
        item.cantidad = cantidadFinal;
        item.precio = roundMoney(producto.precio);
        item.pesoGramos = producto.pesoGramos || 250;
      }
      else {
          req.session.carrito.push({
            productoId,
            nombre: producto.nombre,
            precio: roundMoney(producto.precio),
            imagenUrl: producto.imagenUrl,
            pesoGramos: producto.pesoGramos || 250,
            cantidad: cantidadFinal
          });
      }

      req.session.save(() => res.redirect('/carrito'));
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al agregar al carrito.');
    }
  }

  static async actualizarItem(req, res) {
    try {
      const productoId = numeroPositivo(req.body.productoId);
      const cantidad = Number.parseInt(req.body.cantidad, 10);
      const carrito = req.session.carrito || [];
      const index = carrito.findIndex((item) => item.productoId === productoId);
      if (index === -1) return res.redirect('/carrito');

      if (!Number.isFinite(cantidad) || cantidad <= 0) carrito.splice(index, 1);
      else {
        const producto = await ProductoService.obtenerPorId(productoId);
        if (!producto || producto.tipoVenta === 'CONSULTA' || producto.precio === null || producto.stock < 1) {
          carrito.splice(index, 1);
        }
        else {
          carrito[index].cantidad = Math.min(cantidad, producto.stock);
          carrito[index].precio = roundMoney(producto.precio);
          carrito[index].pesoGramos = producto.pesoGramos || 250;
        }
      }

      req.session.carrito = carrito;
      req.session.save(() => res.redirect('/carrito'));
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al actualizar el carrito.');
    }
  }

  static eliminarItem(req, res) {
    const productoId = numeroPositivo(req.body.productoId);
    req.session.carrito = (req.session.carrito || []).filter((item) => item.productoId !== productoId);
    req.session.save(() => res.redirect('/carrito'));
  }
}
