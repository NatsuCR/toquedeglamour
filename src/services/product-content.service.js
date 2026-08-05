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

function includesPrecautions(data, existing, consultation) {
  if (consultation) return false;
  if (data.incluyePrecauciones !== undefined) {
    return String(data.incluyePrecauciones) === 'true';
  }
  return existing?.incluyePrecauciones ?? Boolean(existing?.precauciones);
}

export function productContent(data, existing = null, consultation = false) {
  const type = consultation ? 'GENERAL' : productType(data, existing);
  const sustainable = includesSustainability(data, existing, consultation);
  const precautions = includesPrecautions(data, existing, consultation);
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
    precauciones: precautions ? value('precauciones') : null,
    incluyePrecauciones: precautions,
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
  ['modoUso', 'detallesTecnicos'].forEach((field) => {
    if (!content[field]) missing.push(field);
  });
  if (content.incluyePrecauciones && !content.precauciones) {
    missing.push('precauciones');
  }
  if (content.incluyeSostenibilidad && !content.sostenibilidad) {
    missing.push('sostenibilidad');
  }
  if (content.tipoProducto === 'COSMETICO' && !content.resultadosComprobados) {
    missing.push('resultadosComprobados');
  }
  return missing;
}
