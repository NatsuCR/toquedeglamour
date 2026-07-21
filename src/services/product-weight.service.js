export const DEFAULT_PRODUCT_WEIGHT_GRAMS = 250;

export function parseProductWeight(value, fallback = null) {
  const hasValue = value !== undefined && value !== null && String(value).trim() !== '';
  if (!hasValue && fallback !== null && fallback !== undefined) {
    return Number.parseInt(fallback, 10) || DEFAULT_PRODUCT_WEIGHT_GRAMS;
  }
  if (!hasValue) throw new Error('El peso del producto en gramos es requerido.');

  const clean = String(value).trim();
  if (!/^[0-9]+$/.test(clean)) {
    throw new Error('El peso debe ser numerico, entero y sin letras.');
  }

  const grams = Number.parseInt(clean, 10);
  if (!Number.isFinite(grams) || grams <= 0) {
    throw new Error('El peso debe ser mayor que 0 gramos.');
  }
  return grams;
}

export function productWeightLabel(value) {
  const grams = Number.parseInt(value, 10) || DEFAULT_PRODUCT_WEIGHT_GRAMS;
  return `${grams} g`;
}
