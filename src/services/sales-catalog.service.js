const keyOf = (value) => value || 'Sin agrupar';

function ensureCategory(map, product) {
  const name = keyOf(product.categoria?.nombre);
  if (!map.has(name)) map.set(name, { nombre: name, subcategorias: new Map() });
  return map.get(name);
}

function ensureSubcategory(category, product) {
  const name = keyOf(product.subcategoria?.nombre || 'General');
  if (!category.subcategorias.has(name)) {
    category.subcategorias.set(name, { nombre: name, productos: [] });
  }
  return category.subcategorias.get(name);
}

export function buildSalesCatalog(products = []) {
  const map = new Map();
  products.forEach((product) => {
    const category = ensureCategory(map, product);
    ensureSubcategory(category, product).productos.push(product);
  });
  return [...map.values()].sort((a, b) => a.nombre.localeCompare(b.nombre)).map((category) => ({
    nombre: category.nombre,
    subcategorias: [...category.subcategorias.values()].sort((a, b) => a.nombre.localeCompare(b.nombre))
  }));
}
