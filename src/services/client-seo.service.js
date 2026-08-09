const words = (slug) => String(slug || '').replace(/-/g, ' ');

export class ClientSeoService {
  static home() {
    return {
      canonical: '/',
      metaDescription: 'Cosméticos, nutrición, salud, hogar y belleza con entregas en Costa Rica. Compra Nutriplus, Farmasi, Dr. C. Tuna y más.',
      seoKeywords: 'cosméticos Costa Rica, Nutriplus, Farmasi, Dr. C. Tuna, Drapes Ross, salud, hogar, belleza'
    };
  }

  static catalog() {
    return {
      title: 'Catálogo de cosméticos, salud, hogar y belleza',
      canonical: '/catalogo',
      metaDescription: 'Compra cosméticos, nutrición, bienestar y artículos para el hogar en Costa Rica.',
      seoKeywords: 'catálogo, cosméticos, salud, nutrición, hogar, belleza, Costa Rica'
    };
  }

  static brand(brand) {
    return {
      title: `${brand.name} en Costa Rica`,
      canonical: `/catalogo/marca/${brand.slug}`,
      metaDescription: `Productos ${brand.name} disponibles en Toque de Glamour, Costa Rica.`,
      seoKeywords: `${brand.name}, productos, Costa Rica, Toque de Glamour`
    };
  }

  static category(slug) {
    return {
      title: `Catálogo de ${words(slug)}`,
      canonical: `/catalogo/categoria/${slug}`,
      seoKeywords: `${words(slug)}, productos, Costa Rica`
    };
  }

  static subcategory(category, subcategory) {
    return {
      title: `${words(subcategory)} - ${words(category)}`,
      canonical: `/catalogo/categoria/${category}/${subcategory}`,
      seoKeywords: `${words(subcategory)}, ${words(category)}, Costa Rica`
    };
  }

  static product(product) {
    return {
      title: `${product.nombre}${product.marca ? ` de ${product.marca}` : ''}`,
      canonical: `/producto/${product.id}/${product.slug}`,
      metaType: 'product', metaImage: product.imagenUrl, seoProduct: product,
      seoKeywords: [product.nombre, product.marca, product.categoria?.nombre,
        product.subcategoria?.nombre, 'Costa Rica'].filter(Boolean).join(', '),
      metaDescription: String(product.descripcion || `${product.nombre} en Toque de Glamour`).slice(0, 155)
    };
  }
}

export const aboutMeta = {
  title: 'Quiénes somos', canonical: '/quienes-somos',
  metaDescription: 'Conoce Toque de Glamour, tienda de cosméticos, salud, nutrición, hogar y belleza en San Carlos, Costa Rica.'
};

export const internationalMeta = {
  title: 'Pedidos internacionales de Farmasi',
  canonical: '/internacional',
  metaImage: '/img/farmasi-internacional.png',
  metaDescription: 'Compra productos Farmasi desde otros paises mediante la tienda oficial internacional vinculada con Toque de Glamour.',
  seoKeywords: 'Farmasi internacional, comprar Farmasi, Farmasi USA, productos Farmasi, Toque de Glamour'
};

export const locationMeta = {
  title: 'Ubicación en San Carlos', canonical: '/ubicacion',
  metaDescription: 'Visita Toque de Glamour en Muelle de San Carlos, Alajuela, Costa Rica.'
};
