import React from "react";
import { fmt, money, pct, ratio } from "../utils/format";
import { companiesFor, periodMonths, quarterLabel, quarterLabelForPeriod } from "../utils/periods";
import { revenueSplitPeriod } from "../utils/calculations";

const SPLIT_ROWS = ["materialRevenue", "serviceRevenue", "otherRevenue", "openRevenue"];

function splitValue(split, k) {
  if (!split) return null;
  if (k === "materialRevenue") return split.material;
  if (k === "serviceRevenue") return split.service;
  if (k === "otherRevenue") return split.other;
  return split.unclassified + split.residual;
}

export default function QuarterSection({ data, selected, period, periods, onPeriodChange, q }) {
  const cc = companiesFor(selected);
  const p = q.previous;
  const annual = period.endsWith("-YEAR");
  const label = annual
    ? "Kalenderjahr " + period.slice(0, 4)
    : selected === "Gruppe"
      ? quarterLabelForPeriod(period)
      : quarterLabel(selected, period);

  const pm = periodMonths(period);
  const endMonth = +pm[pm.length - 1].slice(5);
  const pYear = pm[0].slice(0, 4);
  const quarterDate =
    "01." +
    pm[0].slice(5) +
    "." +
    pYear +
    "–" +
    new Date(Date.UTC(+pYear, endMonth, 0)).getUTCDate() +
    "." +
    pm[pm.length - 1].slice(5) +
    "." +
    pYear;

  const subtitle =
    quarterDate +
    " · Geschäftsjahr SSB: Jan–Dez; Tebo: Jul–Jun" +
    (q.missing
      ? " · " + (annual ? "Teiljahr" : "Teilperiode") + " / " + q.loaded + " von " + pm.length + " Monaten"
      : "");

  const noPrev = "Vorjahr nicht vollständig vergleichbar";
  const metrics = [
    ["Betriebsertrag", money(q.revenue), p ? "Vorjahr " + money(p.revenue) : noPrev],
    [
      "Bruttomarge",
      q.revenue ? pct((q.gross / q.revenue) * 100) : "–",
      p ? "Vorjahr " + pct((p.gross / p.revenue) * 100) : noPrev,
    ],
    ["Betriebsgewinn gemäss ER", money(q.operation), p ? "Vorjahr " + money(p.operation) : noPrev],
    ["Reingewinn", money(q.net), p ? "Vorjahr " + money(p.net) : noPrev],
  ];
  const extraMetrics = [
    [
      "Materialaufwandquote",
      ratio(q.cost, q.revenue),
      p ? "Vorjahr " + ratio(p.cost, p.revenue) : "Materialaufwand / Umsatz",
    ],
    [
      "Personalaufwandquote",
      ratio(q.staff, q.revenue),
      p ? "Vorjahr " + ratio(p.staff, p.revenue) : "Personalaufwand / Umsatz",
    ],
    [
      "Betriebsgewinnmarge",
      ratio(q.operation, q.revenue),
      p ? "Vorjahr " + ratio(p.operation, p.revenue) : "Betriebsgewinn gemäss ER / Umsatz",
    ],
    [
      "Reingewinnmarge",
      ratio(q.net, q.revenue),
      p ? "Vorjahr " + ratio(p.net, p.revenue) : "Reingewinn / Umsatz",
    ],
  ];

  const splitNow = revenueSplitPeriod(data, cc, pm);
  const splitPrev = p
    ? revenueSplitPeriod(
      data,
      cc,
      pm.map((m) => String(+m.slice(0, 4) - 1) + m.slice(4)),
    )
    : null;

  let rows = [["revenue", "Betriebsertrag"]];
  if (splitNow || splitPrev) {
    rows.push(
      ["materialRevenue", "Material-Ertrag"],
      ["serviceRevenue", "Dienstleistungsertrag"],
      ["otherRevenue", "Übrige Erlöse / Korrekturen"],
      ["openRevenue", "Nicht zugeordneter Ertrag"],
    );
  }
  rows = rows.concat([
    ["cost", "Materialaufwand"],
    ["gross", "Bruttogewinn"],
    ["staff", "Personalaufwand"],
    ["operation", "Betriebsgewinn gemäss ER"],
    ["net", "Reingewinn"],
  ]);

  const baseNote =
    selected === "Tebo AG"
      ? "Tebo: Geschäftsjahr Juli bis Juni. Die offiziellen Quartalskennzahlen kommen aus der kumulierten ER. Einzelne Monatskonten stimmen nicht vollständig mit allen Quartals-Zwischensummen überein; eine Kontengruppen-Summe ist daher keine bestätigte EBITDA-/EBIT-Berechnung."
      : selected === "Schlauchservice"
        ? "SSB: Geschäftsjahr Januar bis Dezember. Historische ER-Zwischensummen werden mit Monatswerten abgeglichen."
        : "Gruppe: Kalenderzeitgleiche Addition vor Konsolidierung; nur belegte Monate werden einbezogen.";

  const note =
    (q.note ? q.note + " " : "") +
    (q.missing
      ? "Achtung: " +
      (annual ? "Kalenderjahr" : "Quartal") +
      " unvollständig. Es fehlen " +
      q.missing +
      " Monatswerte; Summen umfassen nur vorhandene, abgestimmte Monate. "
      : "") +
    (annual
      ? "Kalenderjahr ist für beide Firmen Januar–Dezember (Tebo: über zwei Geschäftsjahre). " +
      (q.excluded?.length
        ? "Für die Gruppe wurden Monate ohne Daten beider Firmen ausgeschlossen: " +
        q.excluded.join(", ") +
        ". "
        : "")
      : "") +
    " Ertragsaufteilung gemäss fester Kontenliste. Nicht klassifizierte Konten und Differenzen zur offiziellen ER werden separat als nicht zugeordnet gezeigt; bei Tebo fehlen derzeit die Erlöskonten. " +
    baseNote;

  return (
    <section className="panel">
      <div className="sectiontop">
        <div>
          <h2>{selected + " · " + label}</h2>
          <p className="subtitle">{subtitle}</p>
        </div>
        <select
          className="chip period-select"
          aria-label="Quartal oder gesamtes Kalenderjahr auswählen"
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
        >
          {periods.map((v) => (
            <option key={v} value={v}>
              {quarterLabelForPeriod(v)}
            </option>
          ))}
        </select>
      </div>

      <div className="cards">
        {metrics.map(([name, value, small]) => (
          <article className="card" key={name}>
            <label>{name}</label>
            <strong>{value}</strong>
            <small>{small}</small>
          </article>
        ))}
      </div>
      <div className="cards cards-secondary">
        {extraMetrics.map(([name, value, small]) => (
          <article className="card" key={name}>
            <label>{name}</label>
            <strong>{value}</strong>
            <small>{small}</small>
          </article>
        ))}
      </div>

      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Position</th>
              <th>{label + (q.missing ? " (bisher)" : "")}</th>
              <th>Vorjahreszeitraum</th>
              <th>Veränderung</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([k, name]) => {
              const isSplit = SPLIT_ROWS.includes(k);
              const current = isSplit ? splitValue(splitNow, k) : q[k];
              const prevVal = isSplit ? splitValue(splitPrev, k) : p ? p[k] : null;
              const diff = current !== null && prevVal !== null ? current - prevVal : null;
              const cls = (["gross", "net"].includes(k) ? "total" : "") + (isSplit ? " subrow" : "");
              return (
                <tr key={k} className={cls}>
                  <td>{name}</td>
                  <td>{current === null ? "–" : fmt(current)}</td>
                  <td>{prevVal === null ? "–" : fmt(prevVal)}</td>
                  <td>{diff === null ? "–" : fmt(diff)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="note">{note}</div>
    </section>
  );
}
