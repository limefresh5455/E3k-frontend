
import { fmt, money, pct } from "./format";

export function kpiValueFmt(v, type) {
  if (v === null || !Number.isFinite(v)) return "–";
  return type === "pct" ? pct(v) : type === "change" ? (v > 0 ? "+" : "") + fmt(v) + " CHF" : money(v);
}

export function buildKpis(x) {
  const cp = x.current;
  const pp = x.prior;
  const ratio = (a, b) => (Number.isFinite(a) && Number.isFinite(b) && b > 0 ? (a / b) * 100 : null);
  const growth = (a, b) => (Number.isFinite(a) && Number.isFinite(b) && b > 0 ? (a / b - 1) * 100 : null);
  const diff = (a, b) => (Number.isFinite(a) && Number.isFinite(b) ? a - b : null);
  const values = (c, p) => (c && p ? [c, p] : [null, null]);
  const [cRevenue, pRevenue] = values(cp?.revenue, pp?.revenue);

  const kpis = [
    {
      name: "1. Umsatzwachstum",
      v: growth(cRevenue, pRevenue),
      old: null,
      type: "pct",
      mode: "growth",
      threshold: 3,
      desc: "Prozentuale Umsatzveränderung gegenüber demselben Vorjahreszeitraum.",
    },
    {
      name: "2. Bruttomarge",
      v: cp ? ratio(cp.gross, cp.revenue) : null,
      old: pp ? ratio(pp.gross, pp.revenue) : null,
      type: "pct",
      direction: "up",
      threshold: 1,
      desc: "Bruttogewinn / Betriebsertrag.",
    },
    {
      name: "3. Materialaufwandquote",
      v: cp ? ratio(cp.cost, cp.revenue) : null,
      old: pp ? ratio(pp.cost, pp.revenue) : null,
      type: "pct",
      direction: "down",
      threshold: 1,
      desc: "Materialaufwand / Betriebsertrag.",
    },
    {
      name: "4. Personalaufwandquote",
      v: cp ? ratio(cp.staff, cp.revenue) : null,
      old: pp ? ratio(pp.staff, pp.revenue) : null,
      type: "pct",
      direction: "down",
      threshold: 1,
      desc: "Personalaufwand / Betriebsertrag.",
    },
    {
      name: "5. Betriebsgewinnmarge",
      v: cp ? ratio(cp.operation, cp.revenue) : null,
      old: pp ? ratio(pp.operation, pp.revenue) : null,
      type: "pct",
      direction: "up",
      threshold: 1,
      desc: "Betriebsgewinn gemäss ER / Betriebsertrag.",
    },
    {
      name: "6. Reingewinnmarge",
      v: cp ? ratio(cp.net, cp.revenue) : null,
      old: pp ? ratio(pp.net, pp.revenue) : null,
      type: "pct",
      direction: "up",
      threshold: 1,
      desc: "Reingewinn / Betriebsertrag; Tebo Juni ohne Eröffnungssaldo Konto 8000.",
    },
    {
      name: "7. Umsatz pro Mitarbeiter",
      v: null,
      old: null,
      type: "money",
      desc: "Nicht berechenbar ohne durchschnittliche Vollzeitäquivalente (FTE) je Jahr und Firma.",
    },
    {
      name: "8. Personalaufwand / Bruttogewinn",
      v: cp ? ratio(cp.staff, cp.gross) : null,
      old: pp ? ratio(pp.staff, pp.gross) : null,
      type: "pct",
      direction: "down",
      threshold: 2,
      desc: "Personalaufwand als Anteil des Bruttogewinns.",
    },
    {
      name: "9. Rechnerische übrige Ergebnisbelastung",
      v: cp ? ratio(cp.gross - cp.staff - cp.operation, cp.revenue) : null,
      old: pp ? ratio(pp.gross - pp.staff - pp.operation, pp.revenue) : null,
      type: "pct",
      direction: "down",
      threshold: 1,
      desc: "Bruttogewinn abzüglich Personal- und Betriebsgewinn, dividiert durch Umsatz. Keine isolierte Betriebsaufwandquote.",
    },
    {
      name: "10. Betriebsgewinnveränderung",
      v: cp && pp ? diff(cp.operation, pp.operation) : null,
      old: pp?.operation ?? null,
      type: "change",
      mode: "absolute",
      desc: "Betriebsgewinn aktuelle Periode minus Betriebsgewinn gleicher Vorjahreszeitraum.",
    },
  ];
  return { kpis, pRevenue };
}

/** Ampelstatus: [Farbklasse, Label] */
export function kpiStatus(k) {
  if (
    k.v === null ||
    !Number.isFinite(k.v) ||
    (!["growth", "absolute"].includes(k.mode) && (k.old === null || !Number.isFinite(k.old)))
  ) {
    return ["gray", "Keine Bewertung"];
  }
  if (k.mode === "absolute") {
    return k.v > 1000
      ? ["green", "Verbessert"]
      : k.v < -1000
        ? ["red", "Verschlechtert"]
        : ["yellow", "Stabil"];
  }
  const d = k.mode === "growth" ? k.v : (k.v - k.old) * (k.direction === "down" ? -1 : 1);
  const t = k.threshold || 1;
  return d >= t
    ? ["green", "Verbessert"]
    : d <= -t
      ? ["red", "Verschlechtert"]
      : ["yellow", "Stabil / prüfen"];
}


export function kpiSummaryText(x, period, ccs, data) {
  const annual = period.endsWith("-YEAR");
  let description = x.months.length
    ? "Gleiche Monate: " +
    x.months.map((m) => m.slice(5)).join(", ") +
    " (" +
    x.months[0].slice(0, 4) +
    " / " +
    (+x.months[0].slice(0, 4) - 1) +
    "). "
    : "Keine gemeinsamen belegten Monate mit Vorjahr. ";
  if (x.certified) description += "SSB Januar–September aus kumulierter ER. ";
  if (
    ccs.includes("Schlauchservice") &&
    period === "2026-YEAR" &&
    data.ytdOfficial?.["Schlauchservice|2026-09"]?.needsReconciliation
  ) {
    description +=
      "ACHTUNG: Nach SSB-Monatsimport muss die kumulierte ER erneut abgestimmt werden; KPI vorläufig! ";
  }
  if (annual && !x.completeYear) {
    description += "TEILJAHR: Es werden ausschliesslich die aufgeführten Vergleichsmonate verwendet. ";
  }
  if (!x.full) description += "Die Auswahl ist unvollständig; nur belegte Vergleichsmonate fliessen ein. ";
  description += "Gruppe nicht konsolidiert. KPI 7 benötigt FTE.";
  return description;
}
