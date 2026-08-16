export function filtrosProducto(filtros) {
  const where = {};
  if (filtros.q) {
    const query = String(filtros.q).trim();
    const sku = query.match(/^PRD-?0*(\d+)$/i);
    where.OR = [{ nombre: { contains: query } }, { marca: { contains: query } }];
    if (sku) where.OR.push({ id: Number.parseInt(sku[1], 10) });
  }
  if (filtros.cat) where.categoria = { slug: filtros.cat };
  if (filtros.subcat) where.subcategoria = { slug: filtros.subcat };
  if (filtros.marca) where.marca = filtros.marca;
  if (filtros.promocion) {
    where.tipoVenta = 'DIRECTA';
    where.promocionActiva = true;
    where.promocionPorcentaje = { gt: 0 };
    if (filtros.disponible) where.stock = { gt: 0 };
  } else if (filtros.consulta) {
    where.tipoVenta = 'CONSULTA';
  } else if (filtros.disponible) {
    where.tipoVenta = 'DIRECTA';
    where.stock = { gt: 0 };
  }
  if (!filtros.consulta && (filtros.minPrecio || filtros.maxPrecio)) {
    where.precio = {};
    if (filtros.minPrecio) where.precio.gte = Number.parseFloat(filtros.minPrecio);
    if (filtros.maxPrecio) where.precio.lte = Number.parseFloat(filtros.maxPrecio);
  }
  return where;
}

export function ordenProducto(sort) {
  if (sort === 'asc') return { precio: 'asc' };
  if (sort === 'desc') return { precio: 'desc' };
  return { creadoEn: 'desc' };
}
