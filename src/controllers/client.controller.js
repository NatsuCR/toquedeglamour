import { ProductoService } from '../services/producto.service.js';
import { SeoCatalogService } from '../services/seo-catalog.service.js';
import {
  ClientSeoService, aboutMeta, internationalMeta, locationMeta
} from '../services/client-seo.service.js';

function getFilters(req, overrides = {}) {
  return {
    q: req.query.q || '', cat: req.query.cat || '', subcat: req.query.subcat || '',
    marca: req.query.marca || '', sort: req.query.sort || '',
    disponible: req.query.disponible === 'true', minPrecio: req.query.minPrecio || '',
    maxPrecio: req.query.maxPrecio || '', ...overrides
  };
}

async function renderCatalog(res, filtros, seo = {}) {
  const [categorias, marcas] = await Promise.all([
    ProductoService.obtenerCategoriasDisponibles(),
    ProductoService.obtenerMarcasDisponibles()
  ]);
  let category = filtros.cat ? categorias.find((item) => item.slug === filtros.cat) : null;
  let subcategory = null;
  if (filtros.subcat) {
    category = categorias.find((item) =>
      item.subcategorias?.some((sub) => sub.slug === filtros.subcat)
    );
    subcategory = category?.subcategorias?.find((sub) => sub.slug === filtros.subcat);
    if (category) filtros = { ...filtros, cat: category.slug };
  }
  if ((filtros.cat && !category) || (filtros.subcat && !subcategory)) {
    return res.status(404).render('client/404', { title: 'Catálogo no encontrado', robots: 'noindex, follow' });
  }
  const productos = await ProductoService.obtenerFiltrados(filtros);
  return res.render('client/catalogo', {
    user: res.locals.cliente, productos, categorias, marcas, filtros, ...seo
  });
}

export class ClientController {
  static async renderIndex(req, res) {
    try {
      const topVentas = await ProductoService.obtenerTopVentas(6);
      const nuevos = await ProductoService.obtenerNuevos(6);
      const idsUsados = [...topVentas.map(p => p.id), ...nuevos.map(p => p.id)];
      const sugeridos = await ProductoService.obtenerSugeridos(6, idsUsados);
      res.render('client/index', {
        user: res.locals.cliente, topVentas, nuevos, sugeridos,
        ...ClientSeoService.home()
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error cargando el catalogo.');
    }
  }

  static async renderCatalogo(req, res) {
    try {
      await renderCatalog(res, getFilters(req), ClientSeoService.catalog());
    } catch (error) {
      console.error(error);
      res.status(500).send('Error cargando el catalogo completo.');
    }
  }

  static async renderCatalogoMarca(req, res) {
    try {
      const brand = await SeoCatalogService.brandBySlug(req.params.marcaSlug);
      if (!brand) return res.status(404).render('client/404', { title: 'Marca no encontrada', robots: 'noindex, follow' });
      await renderCatalog(res, getFilters(req, { marca: brand.name }), ClientSeoService.brand(brand));
    } catch (error) {
      res.status(500).send('Error cargando la marca.');
    }
  }

  static async renderCatalogoCategoria(req, res) {
    const cat = req.params.categoriaSlug;
    await renderCatalog(res, getFilters(req, { cat }), ClientSeoService.category(cat));
  }

  static async renderCatalogoSubcategoria(req, res) {
    const cat = req.params.categoriaSlug;
    const subcat = req.params.subcategoriaSlug;
    await renderCatalog(res, getFilters(req, { cat, subcat }), ClientSeoService.subcategory(cat, subcat));
  }

  static renderQuienesSomos(req, res) {
    res.render('client/quienes-somos', { user: res.locals.cliente, ...aboutMeta });
  }

  static renderInternacional(req, res) {
    res.render('client/internacional', {
      user: res.locals.cliente,
      ...internationalMeta
    });
  }

  static renderUbicacion(req, res) {
    res.render('client/ubicacion', { user: res.locals.cliente, ...locationMeta });
  }

  static async renderProductoDetalle(req, res) {
    try {
      const producto = await ProductoService.obtenerPorId(req.params.id);
      if (!producto) return res.status(404).render('client/404', {
        title: 'Producto no encontrado', robots: 'noindex, follow'
      });
      res.render('client/producto-detalle', {
        user: res.locals.cliente,
        producto,
        ...ClientSeoService.product(producto)
      });
    } catch (error) {
      res.status(500).send('Error cargando producto.');
    }
  }
}
