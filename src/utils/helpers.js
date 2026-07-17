export const asNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const text = String(value).trim().replace(/\s+/g, "").replace(/'/g, "");
  const normalized =
    text.includes(",") && !text.includes(".")
      ? text.replace(",", ".")
      : text.replace(/,/g, "");

  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
};
