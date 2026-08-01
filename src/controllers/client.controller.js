import { ProductoService } from '../services/producto.service.js';
import { SeoCatalogService } from '../services/seo-catalog.service.js';

function getFilters(req, overrides = {}) {
  return {
    q: req.query.q || '', cat: req.query.cat || '', subcat: req.query.subcat || '',
    marca: req.query.marca || '', sort: req.query.sort || '',
    disponible: req.query.disponible === 'true', minPrecio: req.query.minPrecio || '',
    maxPrecio: req.query.maxPrecio || '', ...overrides
  };
}

async function renderCatalog(res, filtros, seo = {}) {
  const [productos, categorias, marcas] = await Promise.all([
    ProductoService.obtenerFiltrados(filtros),
    ProductoService.obtenerCategoriasDisponibles(),
    ProductoService.obtenerMarcasDisponibles()
  ]);
  const category = filtros.cat ? categorias.find((item) => item.slug === filtros.cat) : null;
  const subcategory = filtros.subcat
    ? category?.subcategorias?.find((item) => item.slug === filtros.subcat)
    : null;
  if ((filtros.cat && !category) || (filtros.subcat && !subcategory)) {
    return res.status(404).render('client/404', { title: 'Catálogo no encontrado', robots: 'noindex, follow' });
  }
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
      res.render('client/index', { user: res.locals.cliente, topVentas, nuevos, sugeridos });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error cargando el catalogo.');
    }
  }

  static async renderCatalogo(req, res) {
    try {
      await renderCatalog(res, getFilters(req), { title: 'Catálogo', canonical: '/catalogo' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error cargando el catalogo completo.');
    }
  }

  static async renderCatalogoMarca(req, res) {
    try {
      const brand = await SeoCatalogService.brandBySlug(req.params.marcaSlug);
      if (!brand) return res.status(404).render('client/404', { title: 'Marca no encontrada', robots: 'noindex, follow' });
      await renderCatalog(res, getFilters(req, { marca: brand.name }), {
        title: `${brand.name} en Costa Rica`, canonical: `/catalogo/marca/${brand.slug}`,
        metaDescription: `Productos ${brand.name} disponibles en Toque de Glamour, Costa Rica.`
      });
    } catch (error) {
      res.status(500).send('Error cargando la marca.');
    }
  }

  static async renderCatalogoCategoria(req, res) {
    const cat = req.params.categoriaSlug;
    await renderCatalog(res, getFilters(req, { cat }), {
      title: `Catálogo de ${cat.replace(/-/g, ' ')}`, canonical: `/catalogo/categoria/${cat}`
    });
  }

  static async renderCatalogoSubcategoria(req, res) {
    const cat = req.params.categoriaSlug;
    const subcat = req.params.subcategoriaSlug;
    await renderCatalog(res, getFilters(req, { cat, subcat }), {
      title: `${subcat.replace(/-/g, ' ')} - ${cat.replace(/-/g, ' ')}`,
      canonical: `/catalogo/categoria/${cat}/${subcat}`
    });
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
      if (!producto) return res.status(404).render('client/404', {
        title: 'Producto no encontrado', robots: 'noindex, follow'
      });
      res.render('client/producto-detalle', {
        user: res.locals.cliente,
        producto,
        title: producto.nombre,
        canonical: `/producto/${producto.id}/${producto.slug}`,
        metaDescription: String(producto.descripcion || `${producto.nombre} en Toque de Glamour`).slice(0, 155)
      });
    } catch (error) {
      res.status(500).send('Error cargando producto.');
    }
  }
}
