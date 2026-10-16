import { BFS_BENCHMARK_MARGIN } from "../constants";
import { money, pct } from "../utils/format";

export default function BenchmarkPanel({ selected, q }) {
  const rev = q.revenue;
  const margin = rev && q.net !== null ? (100 * q.net) / rev : null;
  const benchmark = BFS_BENCHMARK_MARGIN;
  const staff = selected === "Gruppe" ? 20 : 10;
  const active = q.loaded || 0;
  const annualPerWorker = rev && active ? ((rev / active) * 12) / staff : null;

  const cards = [
    ["Reingewinnmarge", margin === null ? "–" : pct(margin), "Aktuell ausgewählte Periode"],
    ["BFS-Referenz: Gewinnmarge", "2,2 %", "NOGA 46 · Berichtsjahr 2020"],
    [
      "Differenz zur BFS-Referenz",
      margin === null ? "–" : (margin - benchmark >= 0 ? "+" : "") + pct(margin - benchmark),
      "Prozentpunkte; Methoden und Jahre verschieden",
    ],
    [
      "Umsatz je Mitarbeitendem / Jahr",
      annualPerWorker === null ? "–" : money(annualPerWorker),
      "Annualisiert; Annahme " + staff + " Mitarbeitende (nicht FTE)",
    ],
    ["Materialaufwandquote", rev ? pct((100 * q.cost) / rev) : "–", "BFS-Vergleich noch nicht belastbar"],
    ["Personalaufwandquote", rev ? pct((100 * q.staff) / rev) : "–", "BFS-Vergleich noch nicht belastbar"],
  ];

  const mx = Math.max(10, margin || 0, benchmark);
  const Bar = ({ name, v, reference }) => (
    <div className={"benchmark-bar " + (reference ? "reference" : "")}>
      <span>{name}</span>
      <div className="benchmark-track">
        <div className="benchmark-fill" style={{ width: Math.max(0, Math.min(100, (v / mx) * 100)) + "%" }} />
      </div>
      <b>{pct(v)}</b>
    </div>
  );
  const ownName = selected === "Schlauchservice" ? "SSB" : selected === "Tebo AG" ? "Tebo AG" : "Gruppe";

  return (
    <section className="panel" id="benchmarkPanel">
      <div className="sectiontop">
        <div>
          <h2>Branchenvergleich Schweiz</h2>
          <p>BFS · Grosshandel ohne Motorfahrzeuge (NOGA 46) · historischer Referenzwert</p>
        </div>
        <span className="chip">BFS · Jahr 2020</span>
      </div>
      <p className="benchmark-intro">
        Orientierungsvergleich mit dem gesamten Schweizer Grosshandel. Keine spezifische Stichprobe von
        technischen Handels-KMU mit rund 10 Mitarbeitenden.
      </p>
      <div className="benchmark-grid">
        {cards.map(([label, value, small]) => (
          <div className="benchmark-item" key={label}>
            <div className="blabel">{label}</div>
            <strong>{value}</strong>
            <small>{small}</small>
          </div>
        ))}
      </div>
      <div className="benchmark-chart">
        {margin === null ? (
          <p>Keine aktuellen Quartalswerte vorhanden.</p>
        ) : (
          <Bar name={ownName} v={margin} reference={false} />
        )}
        <Bar name="BFS NOGA 46" v={benchmark} reference />
      </div>
      <div className="benchmark-method">
        Quelle: Bundesamt für Statistik (BFS),{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://dam-api.bfs.admin.ch/hub/api/dam/assets/22884231/master"
        >
          Buchhaltungsergebnisse schweizerischer Unternehmen 2019–2020, Tabelle TA3.46
        </a>
        . Gewinnmarge 2019: 3,5 %, 2020: 2,2 %.{" "}
        <strong>Nur historischer Orientierungswert, keine KMU-Benchmark-Einstufung.</strong> Grosshandel
        umfasst auch grosse internationale Handelsgesellschaften. Die BFS-Kennzahl und die aus der ER
        berechnete Reingewinnmarge können methodisch abweichen. Für eine verlässliche Vergleichsaussage
        benötigen wir aktuelle Vergleichsdaten der passenden Unternehmensgrössenklasse. Gruppe = ungeprüfte
        Addition ohne interne Eliminierungen. Umsatz/FTE noch nicht verfügbar; Mitarbeiterzahl ist eine grobe
        Annahme. Bei unvollständigen Quartalen sind die Kennzahlen vorläufig.
      </div>
    </section>
  );
}
