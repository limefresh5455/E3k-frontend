import { annualTotals } from "../utils/calculations";
import { money } from "../utils/format";

/** Nur für "Gruppe" + Kalenderjahr 2026 sichtbar: Datenstand Januar–September. */
export default function CoveragePanel({ data, selected, period }) {
  if (selected !== "Gruppe" || period !== "2026-YEAR") return null;
  const ss = data.ytdOfficial?.["Schlauchservice|2026-09"];
  const te = annualTotals(data, 2026, ["Tebo AG"]);
  const gr = annualTotals(data, 2026, ["Schlauchservice", "Tebo AG"]);

  return (
    <section className="panel" id="coveragePanel">
      <h2>Kalenderjahr 2026 – Datenstand Januar bis September</h2>
      <p className="subtitle">Zahlen beider Firmen für denselben Zeitraum. Oktober–Dezember fehlen.</p>
      <div className="cards" style={{ marginTop: 18 }}>
        <article className="card">
          <label>SSB · Januar–September</label>
          <strong>{money(ss?.revenue)}</strong>
          <small>Reingewinn {money(ss?.net)}</small>
        </article>
        <article className="card">
          <label>Tebo · Januar–September</label>
          <strong>{money(te.revenue)}</strong>
          <small>Reingewinn {money(te.net)}</small>
        </article>
        <article className="card">
          <label>Gruppe · Januar–September</label>
          <strong>{money(gr.revenue)}</strong>
          <small>Reingewinn {money(gr.net)}</small>
        </article>
        <article className="card">
          <label>Fehlende Monate</label>
          <strong>Okt–Dez 2026</strong>
          <small>Bei beiden Firmen noch nicht vorhanden</small>
        </article>
      </div>
      <div className="note">
        Gruppe = Summe beider Firmen vor Eliminierung gegenseitiger Leistungen. Kein kompletter
        Jahresabschluss.
      </div>
    </section>
  );
}
