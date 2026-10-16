

export const fmt = (n) =>
  typeof n === "number" && Number.isFinite(n)
    ? n.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "–";

export const money = (n) => (typeof n === "number" ? "CHF " + fmt(n) : "–");

export const pct = (n) =>
  typeof n === "number"
    ? n.toLocaleString("de-CH", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %"
    : "–";

export const ratio = (a, b) => (b ? pct((a / b) * 100) : "–");
