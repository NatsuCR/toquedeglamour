import { roundMoney } from '../utils/money.js';

export function originalSubtotal(order) {
  const stored = roundMoney(order?.subtotalOriginal);
  return stored > 0 ? stored : roundMoney(order?.subtotal);
}

export function orderDiscountTotal(order) {
  return Math.max(0, originalSubtotal(order) - roundMoney(order?.subtotal));
}
