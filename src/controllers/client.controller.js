import { ProductoService } from '../services/producto.service.js';

export class ClientController {
  static async renderIndex(req, res) {
    try {
      const topVentas = await ProductoService.obtenerTopVentas(6);
      const nuevos = await ProductoService.obtenerNuevos(6);
      const idsUsados = [...topVentas.map(p => p.id), ...nuevos.map(p => p.id)];
      const sugeridos = await ProductoService.obtenerSugeridos(6, idsUsados);
      res.render('client/index', { user: res.locals.cliente, topVentas, nuevos, sugeridos });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error cargando el catalogo.');
    }
  }

  static async renderCatalogo(req, res) {
    try {
      const filtros = {
        q: req.query.q || '',
        cat: req.query.cat || '',
        subcat: req.query.subcat || '',
        sort: req.query.sort || '',
        disponible: req.query.disponible === 'true',
        minPrecio: req.query.minPrecio || '',
        maxPrecio: req.query.maxPrecio || ''
      };
      const productos = await ProductoService.obtenerFiltrados(filtros);
      const categorias = await ProductoService.obtenerCategoriasDisponibles();
      res.render('client/catalogo', { user: res.locals.cliente, productos, categorias, filtros });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error cargando el catalogo completo.');
    }
  }

  static renderQuienesSomos(req, res) {
    res.render('client/quienes-somos', { user: res.locals.cliente });
  }

  static renderUbicacion(req, res) {
    res.render('client/ubicacion', { user: res.locals.cliente });
  }

  static async renderProductoDetalle(req, res) {
    try {
      const producto = await ProductoService.obtenerPorId(req.params.id);
      if (!producto) return res.status(404).send('Producto no encontrado.');
      res.render('client/producto-detalle', {
        user: res.locals.cliente,
        producto,
        title: producto.nombre
      });
    } catch (error) {
      res.status(500).send('Error cargando producto.');
    }
  }
}
