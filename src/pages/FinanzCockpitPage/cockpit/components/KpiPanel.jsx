import { kpiComparablePeriod } from "../utils/calculations";
import { companiesFor } from "../utils/periods";
import { buildKpis, kpiStatus, kpiSummaryText, kpiValueFmt } from "../utils/kpis";
import { money } from "../utils/format";
import { CostDriverDetails, KpiOtherDetails } from "./KpiDetails";

export default function KpiPanel({ data, selected, period }) {
  const ccs = companiesFor(selected);
  const x = kpiComparablePeriod(data, period, ccs);
  const { kpis, pRevenue } = buildKpis(x);
  const annual = period.endsWith("-YEAR");

  return (
    <section className="panel" id="kpiPanel">
      <div className="sectiontop">
        <div>
          <h2>10 Finanz-KPI · Vorjahresvergleich</h2>
          <p>Ampeln für denselben belegten Zeitraum beider Jahre</p>
        </div>
        <span className="chip">{x.months.length + "/" + (annual ? 12 : 3) + " Monate verglichen"}</span>
      </div>
      <div className="kpi-summary">{kpiSummaryText(x, period, ccs, data)}</div>
      <div className="kpi-grid">
        {kpis.map((k) => {
          const [color, label] = kpiStatus(k);
          const previous =
            k.mode === "growth"
              ? "Vorjahresumsatz: " + (pRevenue === null ? "–" : money(pRevenue))
              : k.mode === "absolute"
                ? "Betriebsgewinn Vorjahr: " + kpiValueFmt(k.old, "money")
                : "Vorjahr: " + kpiValueFmt(k.old, k.type);
          const index = Number(k.name.split(".")[0]);
          return (
            <article className="kpi-card" key={k.name}>
              <div className="kpi-top">
                <div className="kpi-name">{k.name}</div>
                <span className={"kpi-status " + color}>{label}</span>
              </div>
              <div className="kpi-values">
                <strong>{kpiValueFmt(k.v, k.type)}</strong>
                <span>{previous}</span>
              </div>
              <div className="kpi-context">{k.desc}</div>
              <details className="kpi-drilldown">
                <summary>Vorjahresvergleich und Details anzeigen</summary>
                <div className="analysis-inner">
                  {index === 9 ? (
                    <CostDriverDetails comp={x} data={data} selected={selected} />
                  ) : (
                    <KpiOtherDetails index={index} comp={x} />
                  )}
                </div>
              </details>
            </article>
          );
        })}
      </div>
      <p className="kpi-legend">
        Ampelschwellen sind Management-Prüfregeln, keine amtlichen Branchenrichtwerte. Grün = günstige
        Entwicklung, Gelb = beobachten, Rot = prüfen, Grau = kein belastbarer Vergleich. Ergebnis- und
        Gewinnwachstum sind bei negativen Vorjahresgewinnen nur als absolute Veränderung zu interpretieren.
        Gruppe = Addition ohne Konsolidierung.
      </p>
    </section>
  );
}
