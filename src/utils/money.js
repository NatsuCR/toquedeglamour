const ROUND_STEP = 5;

export function roundMoney(amount) {
  const value = Number(amount) || 0;
  return Math.round(value / ROUND_STEP) * ROUND_STEP;
}

export function formatMoneyCRC(amount) {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0
  }).format(roundMoney(amount));
}
