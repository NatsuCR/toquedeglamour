const clean = (value) => String(value || '').trim();

export function productType(data, existing = null) {
  if (data.tipoProducto === 'COSMETICO') return 'COSMETICO';
  if (data.tipoProducto === 'GENERAL') return 'GENERAL';
  return existing?.tipoProducto || 'GENERAL';
}

function includesSustainability(data, existing, consultation) {
  if (consultation) return false;
  if (data.incluyeSostenibilidad !== undefined) {
    return String(data.incluyeSostenibilidad) === 'true';
  }
  return existing?.incluyeSostenibilidad ?? Boolean(existing?.sostenibilidad);
}

export function productContent(data, existing = null, consultation = false) {
  const type = consultation ? 'GENERAL' : productType(data, existing);
  const sustainable = includesSustainability(data, existing, consultation);
  const value = (field) => {
    if (consultation && field !== 'descripcion') return null;
    if (data[field] !== undefined) return clean(data[field]) || null;
    return existing?.[field] || null;
  };

  return {
    tipoProducto: type,
    descripcion: value('descripcion') || 'Sin descripcion',
    modoUso: value('modoUso'),
    detallesTecnicos: value('detallesTecnicos'),
    precauciones: value('precauciones'),
    sostenibilidad: sustainable ? value('sostenibilidad') : null,
    incluyeSostenibilidad: sustainable,
    resultadosComprobados: type === 'COSMETICO'
      ? value('resultadosComprobados')
      : null
  };
}

export function missingProductFields(data, existing = null) {
  const consultation = data.tipoVenta === 'CONSULTA';
  const content = productContent(data, existing, consultation);
  const missing = [];
  if (!clean(data.nombre || existing?.nombre)) missing.push('nombre');
  if (!(data.categoriaId || existing?.categoriaId)) missing.push('categoria');
  if (!clean(content.descripcion) || content.descripcion === 'Sin descripcion') {
    missing.push('descripcion');
  }
  if (consultation) return missing;
  ['modoUso', 'detallesTecnicos', 'precauciones'].forEach((field) => {
    if (!content[field]) missing.push(field);
  });
  if (content.incluyeSostenibilidad && !content.sostenibilidad) {
    missing.push('sostenibilidad');
  }
  if (content.tipoProducto === 'COSMETICO' && !content.resultadosComprobados) {
    missing.push('resultadosComprobados');
  }
  return missing;
}
