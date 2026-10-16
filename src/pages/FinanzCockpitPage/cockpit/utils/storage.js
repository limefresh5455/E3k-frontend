import INITIAL_DATA from "../data/initialData";
import { STORAGE_KEY } from "../constants";

export const cloneData = (o) => JSON.parse(JSON.stringify(o));


export function normalizeData(DATA) {

  DATA.monthOfficial ??= {};
  for (const [k, v] of Object.entries(INITIAL_DATA.monthOfficial || {})) {
    if (!Object.prototype.hasOwnProperty.call(DATA.monthOfficial, k)) {
      DATA.monthOfficial[k] = cloneData(v);
    }
  }


  if (DATA.monthOfficial["Tebo AG|2026-06"]) {
    const june = DATA.monthOfficial["Tebo AG|2026-06"];
    if (Math.abs(june.net - -236466.97) < 0.001 && Math.abs(june.operation - -70440.56) < 0.001) {
      june.net = 45640.56;
      june.operation = 70440.56;
      june.closingTransfer = 141226.41;
      june.sourceNote = "Betriebsgewinn CHF 70’440.56 - direkte Steuern CHF 24’800.00; Konto 8000 separat";
    }
  }
  (DATA.rows || []).forEach((r) => {
    if (
      r.Firma === "Tebo AG" &&
      r.Monat === "2026-06" &&
      String(r.Konto) === "8000" &&
      Math.abs(r.Betrag - 141226.41) < 0.001
    ) {
      r.Kategorie = "Abschlussbuchung";
      r.Kontobezeichnung = "Eröffnungssaldo (Jahresabschluss, nicht operativ)";
    }
  });

  for (const [ym, op, tax] of [
    ["2025-06", 29338.72, 11800],
    ["2026-06", 70440.56, 24800],
  ]) {
    const v = DATA.monthOfficial?.["Tebo AG|" + ym];
    if (v) {
      const expected = +(op - tax).toFixed(2);
      if (Math.abs(Number(v.operation) - op) > 0.009 || Math.abs(Number(v.net) - expected) > 0.009) {
        v.operation = op;
        v.net = expected;
        v.sourceNote =
          "Geprueft anhand Tebo-Juni-ER: Betriebsgewinn abzüglich direkte Steuern; Konto 8000 getrennt.";
      }
    }
  }


  DATA.ytdOfficial ??= {};
  DATA.ytdOfficial["Schlauchservice|2026-09"] ??= {
    revenue: 2012113.33,
    cost: 957045.96,
    gross: 1055067.37,
    staff: 616555.67,
    operation: 213734.82,
    net: 219883.02,
    through: "2026-09",
    source: "ERjan-sep.xlsx (01.01.–30.09.2026)",
  };
  return DATA;
}


export function loadData() {
  let data = cloneData(INITIAL_DATA);
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        if (obj.rows && obj.revenue && obj.quarter && obj.profits) data = obj;
      } catch (e) {
        console.warn("Gespeicherte Daten unlesbar", e);
      }
    }
  } catch (e) {
    console.warn("Lokaler Speicher nicht verfügbar", e);
  }
  return normalizeData(data);
}


export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn("Lokale Speicherung nicht verfügbar", e);
    return false;
  }
}


export function applyEr(data, x) {
  const next = cloneData(data);
  const months = ["2026-07", "2026-08", "2026-09"];
  const idx = months.indexOf(x.ym);

  next.rows = next.rows.filter((r) => !(r.Firma === x.firma && r.Monat === x.ym)).concat(x.records);
  next.monthOfficial ??= {};
  next.monthOfficial[x.firma + "|" + x.ym] = x.summary;

  if (x.firma === "Schlauchservice" && x.ym >= "2026-01" && x.ym <= "2026-09") {
    next.ytdOfficial ??= {};
    if (next.ytdOfficial["Schlauchservice|2026-09"]) {
      next.ytdOfficial["Schlauchservice|2026-09"].needsReconciliation = true;
    }
  }
  if (idx >= 0) {
    next.revenue[x.firma][idx] = x.summary.revenue;
    next.profits[x.firma][idx] = x.summary.net;
  }
  return next;
}

export function downloadFile(name, content, type) {
  const b = new Blob([content], { type });
  const a = document.createElement("a");
  const url = URL.createObjectURL(b);
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
