export const BASE_SHIPPING_COST = 4000;
export const BASE_WEIGHT_LIMIT_GRAMS = 2000;
export const EXTRA_KG_COST = 1000;

export function calculateShipping(totalWeightGrams) {
  const weight = Math.max(0, Number.parseInt(totalWeightGrams, 10) || 0);
  if (weight <= BASE_WEIGHT_LIMIT_GRAMS) return weight > 0 ? BASE_SHIPPING_COST : 0;
  const extraGrams = weight - BASE_WEIGHT_LIMIT_GRAMS;
  return BASE_SHIPPING_COST + Math.ceil(extraGrams / 1000) * EXTRA_KG_COST;
}

export function calculateCartWeight(items = []) {
  return items.reduce((sum, item) => {
    const weight = Number.parseInt(item.pesoGramos || item.pesoUnitarioGramos, 10) || 0;
    const quantity = Number.parseInt(item.cantidad, 10) || 0;
    return sum + weight * quantity;
  }, 0);
}

export function formatWeight(totalWeightGrams) {
  const grams = Math.max(0, Number.parseInt(totalWeightGrams, 10) || 0);
  if (grams > 1000) {
    const kg = new Intl.NumberFormat('es-CR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(grams / 1000);
    return `${grams} g / ${kg} kg`;
  }
  return `${grams} g`;
}

export function shippingSummary(items = []) {
  const pesoTotalGramos = calculateCartWeight(items);
  return {
    pesoTotalGramos,
    pesoTexto: formatWeight(pesoTotalGramos),
    costoEnvio: calculateShipping(pesoTotalGramos)
  };
}
