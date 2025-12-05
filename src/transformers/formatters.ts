/**
 * Formatters for template values - used by Handlebars helpers
 */
export const formatters: Record<string, (v: unknown) => string> = {
  // Currency: $1,234.56
  currency: (v) => {
    const n = Number(v);
    return `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  // Price (4 decimals): $0.1234
  price: (v) => `$${Number(Number(v).toFixed(4))}`,

  // Percent: 12.34%
  percent: (v) => `${Number(v).toFixed(2)}%`,

  // Signed percent: +12.34% or -12.34%
  signedPercent: (v) => {
    const n = Number(v);
    const sign = n >= 0 ? "+" : "";
    return `${sign}${n.toFixed(2)}%`;
  },

  // Signed currency: +$1,234.56 or -$1,234.56
  signedCurrency: (v) => {
    const n = Number(v);
    const sign = n >= 0 ? "+" : "-";
    return `${sign}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  // Integer with commas: 1,234
  integer: (v) => Math.round(Number(v)).toLocaleString("en-US"),

  // Number with commas: 1,234.56
  number: (v) => Number(v).toLocaleString("en-US"),

  // Compact: 1.2K, 3.4M, 5.6B
  compact: (v) => {
    const n = Number(v);
    const abs = Math.abs(n);
    if (abs >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return n.toString();
  },

  // Uppercase
  upper: (v) => String(v).toUpperCase(),

  // Lowercase
  lower: (v) => String(v).toLowerCase(),

  // Capitalize first letter
  capitalize: (v) => {
    const s = String(v);
    return s.charAt(0).toUpperCase() + s.slice(1);
  },

  // Truncate with ellipsis (50 chars default)
  truncate: (v) => {
    const s = String(v);
    return s.length > 50 ? `${s.slice(0, 47)}...` : s;
  },

  // JSON stringify
  json: (v) => JSON.stringify(v),
};

