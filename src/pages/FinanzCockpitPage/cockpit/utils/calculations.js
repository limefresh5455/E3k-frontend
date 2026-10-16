

import { REVENUE_ACCOUNT_MAP, SUMMARY_KEYS } from "../constants";
import { companiesFor, periodMonths } from "./periods";

const KEYS = SUMMARY_KEYS;

export function quarterly(data, f, period) {
  const months = periodMonths(period);
  const all = months.map((m) => data.monthOfficial?.[f + "|" + m]);

  if (period === "2026-07" && !all.every(Boolean) && data.quarter[f]) {
    return { ...data.quarter[f], loaded: 3, missing: 0 };
  }
  const found = all.filter(Boolean);
  const out = { previous: null, loaded: found.length, missing: months.length - found.length };
  for (const k of KEYS) {
    out[k] = found.length ? found.reduce((sum, v) => sum + Number(v[k] || 0), 0) : null;
  }
  return out;
}

export function annualTotals(data, year, cc) {
  const result = { previous: null, loaded: 0, missing: 12, included: [], excluded: [], note: "" };
  for (const k of KEYS) result[k] = 0;
  const hasSSB = cc.includes("Schlauchservice");
  const hasTebo = cc.includes("Tebo AG");
  const sYtd = year === 2026 && hasSSB ? data.ytdOfficial?.["Schlauchservice|2026-09"] : null;
  const base = year === 2026 && hasSSB && sYtd;

  if (base) {

    const tebo9 = Array.from(
      { length: 9 },
      (_, i) => data.monthOfficial?.["Tebo AG|2026-" + String(i + 1).padStart(2, "0")],
    );
    if (hasTebo && !tebo9.every(Boolean)) {
      for (const k of KEYS) result[k] = null;
      result.missing = 12;
      result.note = "Kein Gruppentotal: Tebo Januar–September noch unvollständig.";
      return result;
    }
    for (const k of KEYS) {
      result[k] = Number(sYtd[k] || 0) + (hasTebo ? tebo9.reduce((t, v) => t + Number(v[k] || 0), 0) : 0);
    }
    result.included = Array.from({ length: 9 }, (_, i) => "2026-" + String(i + 1).padStart(2, "0"));
    for (let i = 10; i <= 12; i++) {
      const ym = year + "-" + String(i).padStart(2, "0");
      const v = cc.map((c) => data.monthOfficial?.[c + "|" + ym]);
      if (v.every(Boolean)) {
        for (const k of KEYS) result[k] += v.reduce((t, x) => t + Number(x[k] || 0), 0);
        result.included.push(ym);
      } else if (v.some(Boolean)) result.excluded.push(ym);
    }
    result.loaded = result.included.length;
    result.missing = 12 - result.loaded;
    result.note =
      "Januar–September: SSB aus bestätigter kumulierter ER, Tebo aus 9 Monats-ER. Juli–September nicht doppelt addiert. Gruppe vor Konsolidierung.";
    return result;
  }

  for (let m = 1; m <= 12; m++) {
    const ym = year + "-" + String(m).padStart(2, "0");
    const vals = cc.map((c) => data.monthOfficial?.[c + "|" + ym]);
    if (vals.every(Boolean)) {
      for (const k of KEYS) result[k] += vals.reduce((t, v) => t + Number(v[k] || 0), 0);
      result.included.push(ym);
    } else if (vals.some(Boolean)) result.excluded.push(ym);
  }
  result.loaded = result.included.length;
  result.missing = 12 - result.loaded;
  if (!result.loaded) for (const k of KEYS) result[k] = null;
  result.note = "Nur belegte Monate werden summiert. Fehlende Monatsabschlüsse sind keine Nullwerte.";
  return result;
}


export function qdata(data, selected, period) {
  const cc = companiesFor(selected);
  if (period.endsWith("-YEAR")) {
    const year = +period.slice(0, 4);
    const out = annualTotals(data, year, cc);
    const prev = annualTotals(data, year - 1, cc);
    out.previous = out.loaded === 12 && prev.loaded === 12 ? prev : null;
    return out;
  }
  const parts = cc.map((c) => quarterly(data, c, period));
  const o = {};
  for (const k of KEYS) {
    o[k] = parts.every((p) => p[k] !== null) ? parts.reduce((a, p) => a + p[k], 0) : null;
  }
  const prevMonths = periodMonths(period).map((ym) => String(+ym.slice(0, 4) - 1) + ym.slice(4));
  const priorVals = prevMonths.flatMap((ym) => cc.map((c) => data.monthOfficial?.[c + "|" + ym]));
  o.previous =
    priorVals.length === 3 * cc.length && priorVals.every(Boolean)
      ? Object.fromEntries(KEYS.map((k) => [k, priorVals.reduce((a, v) => a + Number(v[k]), 0)]))
      : null;
  o.loaded = Math.min(...parts.map((p) => p.loaded));
  o.missing = Math.max(...parts.map((p) => p.missing));
  return o;
}



export function groupRows(data, cc, month, cat) {
  return data.rows.filter((r) => r.Monat === month && cc.includes(r.Firma) && r.Kategorie === cat);
}

export function sumOfficial(data, f, ym) {
  const x = data.monthOfficial?.[f + "|" + ym];
  if (x) return x.revenue;
  const ix = ["2026-07", "2026-08", "2026-09"].indexOf(ym);
  return ix < 0 ? null : data.revenue[f][ix];
}

export function netOfficial(data, f, ym) {
  const x = data.monthOfficial?.[f + "|" + ym];
  if (x) return x.net;
  const ix = ["2026-07", "2026-08", "2026-09"].indexOf(ym);
  return ix < 0 ? null : data.profits[f][ix];
}

export function classifyRevenueRow(r) {
  return REVENUE_ACCOUNT_MAP[r.Firma]?.[String(r.Konto)] || "unclassified";
}

export function revenueSplitMonth(data, cc, ym) {
  const items = groupRows(data, cc, ym, "Umsatz");
  const totals = cc.map((c) => sumOfficial(data, c, ym));
  if (!totals.every((v) => v !== null)) return null;
  const byFirm = cc.map((c) => items.filter((r) => r.Firma === c));
  const official = totals.reduce((a, b) => a + b, 0);
  let material = 0,
    service = 0,
    other = 0,
    unclassified = 0;
  for (const r of items) {
    const cl = classifyRevenueRow(r);
    if (cl === "material") material += r.Betrag;
    else if (cl === "service") service += r.Betrag;
    else if (cl === "other") other += r.Betrag;
    else unclassified += r.Betrag;
  }
  const hasMissing = byFirm.some((rows) => !rows.length);
  const residual = Math.round((official - material - service - other - unclassified) * 100) / 100;
  return {
    material,
    service,
    other,
    unclassified,
    residual,
    official,
    hasMissing,
    fullyMapped: !hasMissing && Math.abs(residual) <= 0.15 && Math.abs(unclassified) <= 0.15,
  };
}

export function revenueSplitPeriod(data, cc, months) {
  const chunks = months.map((m) => revenueSplitMonth(data, cc, m)).filter(Boolean);
  if (!chunks.length) return null;
  const result = {
    material: 0,
    service: 0,
    other: 0,
    unclassified: 0,
    residual: 0,
    official: 0,
    hasMissing: false,
    months: chunks.length,
  };
  for (const x of chunks) {
    for (const k of ["material", "service", "other", "unclassified", "residual", "official"]) {
      result[k] += x[k];
    }
    result.hasMissing ||= x.hasMissing;
  }
  result.fullyMapped =
    !result.hasMissing && Math.abs(result.residual) <= 0.15 && Math.abs(result.unclassified) <= 0.15;
  return result;
}



export function kpiComparablePeriod(data, period, ccs) {
  const months = periodMonths(period);
  const year = Number(period.slice(0, 4));
  const last = period.endsWith("-YEAR") ? 9 : months.length;
  let window = period.endsWith("-YEAR") ? months.slice(0, last) : months;
  const isSSB = ccs.includes("Schlauchservice");
  const hasYtd = period === "2026-YEAR" && isSSB && data.ytdOfficial?.["Schlauchservice|2026-09"];
  if (period.endsWith("-YEAR") && year !== 2026) window = months;

  const present = (company, ym) => {
    const x = data.monthOfficial?.[company + "|" + ym];
    return x && KEYS.every((k) => Number.isFinite(Number(x[k])));
  };
  const valid = window.filter((ym) =>
    ccs.every((c) =>
      hasYtd && c === "Schlauchservice"
        ? +ym.slice(5) <= 9
        : period === "2026-07" && c === "Schlauchservice" && data.quarter?.Schlauchservice
          ? true
          : !!present(c, ym),
    ),
  );
  const previous = valid.filter((ym) =>
    ccs.every((c) => present(c, String(+ym.slice(0, 4) - 1) + ym.slice(4))),
  );


  const cumulative = !!hasYtd && previous.length === 9 && valid.length === 9;

  const sum = (arr, previousYear = false) => {
    const out = {};
    KEYS.forEach((k) => (out[k] = 0));
    for (const ym of arr) {
      const target = (previousYear ? String(+ym.slice(0, 4) - 1) : ym.slice(0, 4)) + ym.slice(4);
      for (const c of ccs) {
        const v = data.monthOfficial[c + "|" + target];
        if (!v) return null;
        for (const k of KEYS) out[k] += Number(v[k]);
      }
    }
    return out;
  };

  let current = null;
  let prior = null;
  if (cumulative) {
    current = {};
    for (const k of KEYS) current[k] = Number(data.ytdOfficial["Schlauchservice|2026-09"][k]);
    if (ccs.includes("Tebo AG")) {
      for (const ym of previous) {
        const v = data.monthOfficial["Tebo AG|" + ym];
        if (!v) {
          current = null;
          break;
        }
        for (const k of KEYS) current[k] += Number(v[k]);
      }
    }
    prior = sum(previous, true);
  } else if (period === "2026-07" && isSSB && data.quarter?.Schlauchservice && previous.length === 3) {
    current = {};
    for (const k of KEYS) current[k] = Number(data.quarter.Schlauchservice[k]);
    if (ccs.includes("Tebo AG")) {
      for (const ym of previous) {
        const t = data.monthOfficial["Tebo AG|" + ym];
        if (!t) {
          current = null;
          break;
        }
        for (const k of KEYS) current[k] += Number(t[k]);
      }
    }
    prior = sum(previous, true);
  } else if (previous.length) {
    current = sum(previous, false);
    prior = sum(previous, true);
  }

  return {
    current,
    prior,
    months: previous,
    planned: window,
    full: previous.length === window.length,
    completeYear: period.endsWith("-YEAR") && previous.length === 12,
    certified: cumulative,
  };
}


export function collectCostAccounts(data, cc, selected, months, prior) {
  const target = new Map();
  const covered = new Set();
  for (const ym of months) {
    const targetMonth = (prior ? String(Number(ym.slice(0, 4)) - 1) : ym.slice(0, 4)) + ym.slice(4);
    for (const c of cc) {
      const rr = data.rows.filter(
        (r) =>
          r.Monat === targetMonth &&
          r.Firma === c &&
          r.Kategorie !== "Umsatz" &&
          r.Kategorie !== "Materialaufwand" &&
          r.Kategorie !== "Personalaufwand",
      );
      if (rr.length) covered.add(c + "|" + targetMonth);
      for (const r of rr) {
        const key = c + "|" + r.Konto;
        const o = target.get(key) || {
          name: (selected === "Gruppe" ? c + " · " : "") + r.Konto + " " + r.Kontobezeichnung,
          sum: 0,
        };
        o.sum += Number(r.Betrag) || 0;
        target.set(key, o);
      }
    }
  }
  return { map: target, covered: covered.size };
}
