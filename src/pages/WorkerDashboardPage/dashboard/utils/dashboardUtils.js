export function formatCents(cents, currency = "CHF") {
  if (cents === null || cents === undefined || isNaN(cents)) {
    return "—";
  }
  const amount = cents / 100;
  const parts = amount.toFixed(2).split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `${integerPart}.${parts[1]} ${currency}`;
}

export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) {
    return "0";
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    if (dateStr.includes("T")) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toISOString().replace("T", " ").substring(0, 19);
      }
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function lookupCustomerName(customerId, customers = []) {
  if (!customerId) return "—";
  const found = customers.find((c) => c.id === customerId);
  return found ? found.name : customerId;
}

export function lookupArticleName(articleId, articles = []) {
  if (!articleId) return "—";
  const found = articles.find((a) => a.id === articleId);
  return found ? found.name : articleId;
}

export function lookupArticleCode(articleId, articles = []) {
  if (!articleId) return "";
  const found = articles.find((a) => a.id === articleId);
  return found ? found.code : "";
}

export function getStatusBadgeClass(status) {
  if (!status) return "badge-default";
  const s = String(status).toLowerCase();
  switch (s) {
    case "open":
      return "badge-warning";
    case "paid":
    case "completed":
      return "badge-success";
    case "issued":
      return "badge-info";
    case "sample-only":
    case "not-approved":
      return "badge-muted";
    default:
      return "badge-default";
  }
}

export function getDocTypeBadgeClass(type) {
  if (!type) return "badge-default";
  const t = String(type).toLowerCase();
  switch (t) {
    case "invoice":
      return "badge-emerald";
    case "delivery_note":
      return "badge-amber";
    case "order":
      return "badge-purple";
    case "quotation":
      return "badge-blue";
    case "proforma":
      return "badge-cyan";
    default:
      return "badge-default";
  }
}
