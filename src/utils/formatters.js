// ─── CURRENCY FORMATTING ─────────────────────────────────────────────────────
/**
 * Formats a number into Indian Rupee notation (1,23,45,678).
 */
export const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

/**
 * Compact INR formatter (₹1.2L, ₹3.5Cr).
 */
export const compactINR = (amount) => {
  const n = Number(amount);
  if (isNaN(n)) return '₹0';
  if (Math.abs(n) >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (Math.abs(n) >= 1_00_000)    return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (Math.abs(n) >= 1_000)       return `₹${(n / 1_000).toFixed(1)}K`;
  return formatINR(n);
};

/**
 * Format percentage with sign.
 */
export const fmtPct = (n, decimals = 1) =>
  `${n >= 0 ? '+' : ''}${Number(n).toFixed(decimals)}%`;
