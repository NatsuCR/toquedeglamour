export function catalogFilters(query = {}, overrides = {}) {
  const promotion = query.promocion === 'true';
  const consultation = query.consulta === 'true' && !promotion;
  return {
    q: query.q || '',
    cat: query.cat || '',
    subcat: query.subcat || '',
    marca: query.marca || '',
    sort: query.sort || '',
    disponible: query.disponible === 'true' && !consultation,
    consulta: consultation,
    promocion: promotion,
    minPrecio: query.minPrecio || '',
    maxPrecio: query.maxPrecio || '',
    ...overrides
  };
}
