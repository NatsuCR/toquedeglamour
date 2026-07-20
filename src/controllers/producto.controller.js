import { ProductoService } from '../services/producto.service.js';
import { CategoriaService } from '../services/categoria.service.js';

export class ProductoController {
  static async listar(req, res) {
    try {
      const categoriaSeleccionada = String(req.query.categoria || 'todos');
      const busquedaProducto = String(req.query.q || '').trim();
      const todosProductos = await ProductoService.obtenerTodos();
      const categorias = await CategoriaService.obtenerTodas();
      const porCategoria = categoriaSeleccionada === 'todos'
        ? todosProductos
        : todosProductos.filter((p) => p.categoria?.slug === categoriaSeleccionada);
      const productos = filtrarProductos(porCategoria, busquedaProducto);
      const conteos = contarPorCategoria(todosProductos);

      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(200).json(productos);
      }
      res.render('admin/productos', {
        admin: res.locals.admin,
        productos,
        categorias,
        categoriaSeleccionada,
        busquedaProducto,
        totalProductos: todosProductos.length,
        conteos,
        error: req.query.error,
        success: req.query.success
      });
    } catch (error) {
      res.status(500).send('Error al obtener productos.');
    }
  }

  static async crear(req, res) {
    try {
      await ProductoService.crear(req.body, req.file);
      res.redirect('/admin/productos?success=Producto+creado');
    } catch (error) {
      res.redirect(`/admin/productos?error=${encodeURIComponent(error.message)}`);
    }
  }

  static async actualizar(req, res) {
    try {
      await ProductoService.actualizar(req.params.id, req.body, req.file);
      res.redirect('/admin/productos?success=Producto+actualizado');
    } catch (error) {
      res.redirect(`/admin/productos?error=${encodeURIComponent(error.message)}`);
    }
  }

  static async eliminar(req, res) {
    try {
      await ProductoService.eliminar(req.params.id);
      res.redirect('/admin/productos?success=Producto+eliminado');
    } catch (error) {
      res.redirect(`/admin/productos?error=${encodeURIComponent(error.message)}`);
    }
  }
}

function contarPorCategoria(productos) {
  return productos.reduce((acc, producto) => {
    const slug = producto.categoria?.slug || 'sin-categoria';
    acc[slug] = (acc[slug] || 0) + 1;
    return acc;
  }, {});
}

function filtrarProductos(productos, busqueda) {
  if (!busqueda) return productos;
  const q = busqueda.toLowerCase();
  return productos.filter((p) => {
    const sku = `prd-${p.id.toString().padStart(4, '0')}`;
    const valores = [p.nombre, p.categoria?.nombre, p.subcategoria?.nombre, sku, p.id.toString().padStart(4, '0')];
    return valores.some((value) => String(value || '').toLowerCase().includes(q));
  });
}
