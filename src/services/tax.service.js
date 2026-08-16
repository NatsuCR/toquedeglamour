import { roundMoney } from '../utils/money.js';

export function includedTax(total, active, percentage) {
  const amount = roundMoney(total);
  const rate = Number(percentage) || 0;
  if (!active || rate <= 0 || amount <= 0) return 0;
  return roundMoney(amount * rate / (100 + rate));
}

export function amountWithoutTax(total, tax) {
  return roundMoney(total) - roundMoney(tax);
}
