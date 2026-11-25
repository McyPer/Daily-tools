// ==========================================================================
// KINETIC // MODULAR PERCENTAGE & DISCOUNT CALCULATION ENGINE
// ==========================================================================

export interface PercentOfResult {
  result: number;
  remainder: number;
  formula: string;
  valid: boolean;
}

export interface WhatPercentResult {
  percentage: number;
  complement: number;
  ratio: number;
  formula: string;
  valid: boolean;
}

export interface PercentChangeResult {
  percentChange: number;
  absoluteDiff: number;
  multiplier: number;
  direction: 'increase' | 'decrease' | 'unchanged';
  formula: string;
  valid: boolean;
}

export interface DiscountTaxResult {
  originalPrice: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
  taxAmount: number;
  finalPrice: number;
  effectiveChangePercent: number;
}

export function calculatePercentOf(percent: number, total: number): PercentOfResult {
  if (!Number.isFinite(percent) || !Number.isFinite(total)) {
    return { result: 0, remainder: 0, formula: '—', valid: false };
  }
  const result = (percent / 100) * total;
  const remainder = total - result;
  return {
    result,
    remainder,
    formula: `(${percent} ÷ 100) × ${total} = ${formatNum(result)}`,
    valid: true
  };
}

export function calculateWhatPercent(part: number, whole: number): WhatPercentResult {
  if (!Number.isFinite(part) || !Number.isFinite(whole) || whole === 0) {
    return {
      percentage: 0,
      complement: 0,
      ratio: 0,
      formula: 'Division by zero undefined',
      valid: false
    };
  }
  const ratio = part / whole;
  const percentage = ratio * 100;
  const complement = Math.max(0, 100 - percentage);
  return {
    percentage,
    complement,
    ratio,
    formula: `(${part} ÷ ${whole}) × 100 = ${formatNum(percentage)}%`,
    valid: true
  };
}

export function calculatePercentChange(fromVal: number, toVal: number): PercentChangeResult {
  if (!Number.isFinite(fromVal) || !Number.isFinite(toVal) || fromVal === 0) {
    return {
      percentChange: 0,
      absoluteDiff: 0,
      multiplier: 0,
      direction: 'unchanged',
      formula: 'Initial value cannot be 0',
      valid: false
    };
  }
  const absoluteDiff = toVal - fromVal;
  const percentChange = (absoluteDiff / Math.abs(fromVal)) * 100;
  const multiplier = toVal / fromVal;
  const direction =
    absoluteDiff > 0 ? 'increase' : absoluteDiff < 0 ? 'decrease' : 'unchanged';

  return {
    percentChange,
    absoluteDiff,
    multiplier,
    direction,
    formula: `((${toVal} − ${fromVal}) ÷ |${fromVal}|) × 100 = ${
      percentChange >= 0 ? '+' : ''
    }${formatNum(percentChange)}%`,
    valid: true
  };
}

export function calculateDiscountAndTax(
  price: number,
  discountPct: number,
  taxPct: number
): DiscountTaxResult {
  const safePrice = Number.isFinite(price) && price >= 0 ? price : 0;
  const safeDisc = Number.isFinite(discountPct) ? Math.min(100, Math.max(0, discountPct)) : 0;
  const safeTax = Number.isFinite(taxPct) ? Math.max(0, taxPct) : 0;

  const discountAmount = safePrice * (safeDisc / 100);
  const subtotalAfterDiscount = safePrice - discountAmount;
  const taxAmount = subtotalAfterDiscount * (safeTax / 100);
  const finalPrice = subtotalAfterDiscount + taxAmount;
  const effectiveChangePercent =
    safePrice > 0 ? ((finalPrice - safePrice) / safePrice) * 100 : 0;

  return {
    originalPrice: safePrice,
    discountAmount,
    subtotalAfterDiscount,
    taxAmount,
    finalPrice,
    effectiveChangePercent
  };
}

export function formatNum(n: number, maxDecimals = 4): string {
  if (!Number.isFinite(n)) return '0';
  return Number(n.toFixed(maxDecimals)).toLocaleString('en-US', {
    maximumFractionDigits: maxDecimals
  });
}
