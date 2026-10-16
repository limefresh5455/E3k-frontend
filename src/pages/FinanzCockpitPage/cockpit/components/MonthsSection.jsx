import React from "react";
import { CATS, MONTH_NAMES } from "../constants";
import { fmt, money } from "../utils/format";
import { groupRows, netOfficial, revenueSplitMonth, sumOfficial } from "../utils/calculations";
import { companiesFor, periodMonths } from "../utils/periods";

function SplitLine({ label, value }) {
  return (
    <div className="splitline">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function CategoryBlock({ data, selected, ym, cat, rev }) {
  const cc = companiesFor(selected);
  const items = groupRows(data, cc, ym, cat);
  const tot = cat === "Umsatz" ? rev : items.reduce((a, r) => a + r.Betrag, 0);
  const split = cat === "Umsatz" ? revenueSplitMonth(data, cc, ym) : null;
  const disclaimer =
    cat === "Umsatz"
      ? "ER-Betriebsertrag massgebend. Die Ertragsaufteilung erfolgt gemäss fester Kontenzuordnung. Unbekannte Beträge sind separat ausgewiesen."
      : "Summe der zugeordneten Importkonten, keine bestätigte Abschluss-Zwischensumme.";

  return (
    <details>
      <summary>
        <span>{cat}</span>
        <span>{fmt(tot)}</span>
      </summary>
      <div style={{ fontSize: 10, color: "#74859b", margin: "0 0 9px" }}>{disclaimer}</div>
      {cat === "Umsatz" &&
        (split ? (
          <>
            <SplitLine label="Material-Ertrag" value={fmt(split.material)} />
            <SplitLine label="Dienstleistungsertrag" value={fmt(split.service)} />
            <SplitLine label="Übrige Erlöse / Korrekturen" value={fmt(split.other)} />
            <SplitLine label="Nicht zugeordneter Ertrag" value={fmt(split.unclassified + split.residual)} />
          </>
        ) : (
          <SplitLine label="Ertragsaufteilung" value="keine vollständige ER vorhanden" />
        ))}
      <table className="items">
        <tbody>
          {items.length ? (
            items.map((r, i) => (
              <tr key={r.Firma + "|" + r.Konto + "|" + i}>
                <td>
                  {r.Konto +
                    " · " +
                    r.Kontobezeichnung +
                    (selected === "Gruppe"
                      ? " (" + (r.Firma === "Schlauchservice" ? "SSB" : "Tebo") + ")"
                      : "")}
                </td>
                <td>{fmt(r.Betrag)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2}>Keine importierten Einzelkonten in dieser Gruppe</td>
            </tr>
          )}
        </tbody>
      </table>
    </details>
  );
}

export default function MonthsSection({ data, selected, period }) {
  const cc = companiesFor(selected);
  const months = periodMonths(period);

  return (
    <section className="panel">
      <div className="sectiontop">
        <div>
          <h2>Monatsdetails &amp; Kontengruppen</h2>
          <p>Ausgewählter Zeitraum · Kontengruppe anklicken für Einzelkonten</p>
        </div>
        <span className="chip">{months.length + " Monate"}</span>
      </div>
      <div className="monthgrid">
        {months.map((ym) => {
          const name = MONTH_NAMES[+ym.slice(5) - 1];
          const vals = cc.map((c) => sumOfficial(data, c, ym));
          const netvals = cc.map((c) => netOfficial(data, c, ym));
          const rev = vals.every((v) => v !== null) ? vals.reduce((a, b) => a + b, 0) : null;
          const net = netvals.every((v) => v !== null) ? netvals.reduce((a, b) => a + b, 0) : null;
          return (
            <article className="month" key={ym}>
              <div className="monthhead">
                <h3>
                  {name} {ym.slice(0, 4)}
                </h3>
                <div className="monthstats">
                  <div>
                    <span className="muted">Betriebsertrag (ER)</span>
                    <strong>{money(rev)}</strong>
                  </div>
                  <div>
                    <span className="muted">Reingewinn (ER)</span>
                    <strong className={net < 0 ? "bad" : "good"}>{money(net)}</strong>
                  </div>
                </div>
              </div>
              <div className="groups">
                {CATS.map((cat) => (
                  <CategoryBlock key={cat} data={data} selected={selected} ym={ym} cat={cat} rev={rev} />
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
