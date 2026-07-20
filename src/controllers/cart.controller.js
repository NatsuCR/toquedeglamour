import { ProductoService } from '../services/producto.service.js';
import { FinanceSettingsService } from '../services/finance-settings.service.js';
import { roundMoney } from '../utils/money.js';

const subtotalCarrito = (carrito) => carrito.reduce(
  (sum, item) => sum + roundMoney(item.precio) * Number(item.cantidad),
  0
);
const normalizarCarrito = (carrito) => carrito.map((item) => ({
  ...item,
  precio: roundMoney(item.precio)
}));

const numeroPositivo = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export class CartController {
  static async renderCarrito(req, res) {
    const carrito = normalizarCarrito(req.session.carrito || []);
    req.session.carrito = carrito;
    const subtotal = subtotalCarrito(carrito);
    const finance = await FinanceSettingsService.obtener();
    const iva = finance.ivaActivo ? roundMoney(subtotal * (finance.ivaPorcentaje / 100)) : 0;
    res.render('client/carrito', {
      user: res.locals.cliente,
      carrito,
      subtotal,
      finance,
      iva,
      total: roundMoney(subtotal + iva)
    });
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
      }
      else {
        req.session.carrito.push({
          productoId,
          nombre: producto.nombre,
          precio: roundMoney(producto.precio),
          imagenUrl: producto.imagenUrl,
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
