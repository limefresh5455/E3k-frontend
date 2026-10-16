import { fmt } from "../utils/format";
import { collectCostAccounts } from "../utils/calculations";
import { companiesFor } from "../utils/periods";

function DiffTable({ rows }) {
  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Vorjahr CHF</th>
            <th>Aktuell CHF</th>
            <th>Veränderung CHF</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export function CostDriverDetails({ comp, data, selected }) {
  const yms = comp.months || [];
  const cp = comp.current;
  const pp = comp.prior;
  if (!cp || !pp || !yms.length) {
    return <p>Kein vollständiger Vergleich für die ausgewählte Periode verfügbar.</p>;
  }

  const burden = (v) => v.gross - v.staff - v.operation;
  const previous = burden(pp);
  const current = burden(cp);
  const diff = current - previous;
  const ratio = (v) => (v.revenue > 0 ? (100 * burden(v)) / v.revenue : null);
  const pr = ratio(pp);
  const cr = ratio(cp);

  const cc = companiesFor(selected);
  const curr = collectCostAccounts(data, cc, selected, yms, false);
  const old = collectCostAccounts(data, cc, selected, yms, true);
  const need = yms.length * cc.length;

  let accountRows = null;
  if (curr.covered === need && old.covered === need) {
    accountRows = [...new Set([...curr.map.keys(), ...old.map.keys()])]
      .map((key) => ({
        key,
        name: curr.map.get(key)?.name || old.map.get(key)?.name || key,
        current: curr.map.get(key)?.sum || 0,
        previous: old.map.get(key)?.sum || 0,
      }))
      .map((r) => ({ ...r, difference: r.current - r.previous }))
      .sort((a, b) => b.difference - a.difference)
      .slice(0, 5);
  }

  return (
    <>
      <p>
        <strong>Abgestimmter Vergleich aus den ER-Zwischensummen</strong> – gleicher Zeitraum im aktuellen
        Jahr und Vorjahr.
      </p>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Position</th>
              <th>Vorjahr CHF</th>
              <th>Aktuell CHF</th>
              <th>Veränderung CHF</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Betriebsertrag", "revenue"],
              ["Bruttogewinn", "gross"],
              ["Personalaufwand", "staff"],
              ["Betriebsgewinn", "operation"],
            ].map(([name, key]) => (
              <tr key={key}>
                <td>{name}</td>
                <td>{fmt(pp[key])}</td>
                <td>{fmt(cp[key])}</td>
                <td>{fmt(cp[key] - pp[key])}</td>
              </tr>
            ))}
            <tr>
              <th>Rechnerische übrige Ergebnisbelastung</th>
              <th>{fmt(previous)}</th>
              <th>{fmt(current)}</th>
              <th>{fmt(diff)}</th>
            </tr>
          </tbody>
        </table>
      </div>

      {pr !== null && cr !== null && (
        <p>
          <strong>Quote:</strong> {pr.toFixed(1)} % → {cr.toFixed(1)} % ({cr - pr >= 0 ? "+" : ""}
          {(cr - pr).toFixed(1)} Prozentpunkte). Die Betragsdifferenz ist nicht mit der reinen Quotenwirkung
          gleichzusetzen.
        </p>
      )}
      <p>
        <strong>Hinweis:</strong> KPI 9 ist eine Restgrösse und kein ausgewiesenes Konto «Betriebsaufwand».
        Der Brückeneffekt ergibt sich aus Bruttogewinn, Personalaufwand und Betriebsgewinn; Einmaleffekte
        müssen fachlich geprüft werden.
      </p>

      <h4>Einzelkonten – Kostenursachen</h4>
      {accountRows === null ? (
        <div className="caution">
          Eine belastbare Aufschlüsselung nach Einzelkonten ist noch nicht möglich: Daten für {curr.covered}/
          {need} aktuellen und {old.covered}/{need} Vorjahres-Firmenmonaten hinterlegt. Der obige
          ER-Summenvergleich ist dennoch verfügbar; fehlende Konten werden nicht als null angenommen.
        </div>
      ) : (
        accountRows.length > 0 && (
          <>
            <p>
              Grösste positive Veränderungen der gebuchten Salden – Vorzeichen und Kostenwirkung sind fachlich
              zu prüfen:
            </p>
            <DiffTable
              rows={accountRows.map((r) => (
                <tr key={r.key}>
                  <td>{r.name}</td>
                  <td>{fmt(r.previous)}</td>
                  <td>{fmt(r.current)}</td>
                  <td>{fmt(r.difference)}</td>
                </tr>
              ))}
            />
          </>
        )
      )}
    </>
  );
}

const DEFS = {
  1: {
    title: "Umsatzentwicklung",
    rows: [["Betriebsertrag", "revenue"]],
    note: "Umsatzwachstum = (Betriebsertrag aktuell / Betriebsertrag Vorjahr − 1) × 100. Die Material- und Dienstleistungsanteile können nur aus vollständig vorhandenen Erlöskonten abgeleitet werden.",
  },
  2: {
    title: "Bruttomarge",
    rows: [
      ["Betriebsertrag", "revenue"],
      ["Materialaufwand", "cost"],
      ["Bruttogewinn", "gross"],
    ],
    note: "Bruttomarge = Bruttogewinn / Betriebsertrag × 100. Veränderungen können aus Einkaufspreisen, Verkaufspreisen und Sortimentsmix entstehen; diese Ursachen sind allein aus der ER nicht belegbar.",
  },
  3: {
    title: "Materialaufwandquote",
    rows: [
      ["Betriebsertrag", "revenue"],
      ["Materialaufwand", "cost"],
      ["Bruttogewinn", "gross"],
    ],
    note: "Materialaufwandquote = Materialaufwand / Betriebsertrag × 100. Positive Materialaufwand-Differenzen zeigen zunächst höhere absolute Beträge, nicht automatisch schlechtere Konditionen.",
  },
  4: {
    title: "Personalaufwandquote",
    rows: [
      ["Betriebsertrag", "revenue"],
      ["Personalaufwand", "staff"],
      ["Bruttogewinn", "gross"],
    ],
    note: "Personalaufwandquote = Personalaufwand / Betriebsertrag × 100. FTE, Stellenwechsel und Einmaleffekte müssen separat geprüft werden.",
  },
  5: {
    title: "Betriebsgewinnmarge",
    rows: [
      ["Betriebsertrag", "revenue"],
      ["Bruttogewinn", "gross"],
      ["Personalaufwand", "staff"],
      ["Betriebsgewinn", "operation"],
    ],
    note: "Betriebsgewinnmarge = Betriebsgewinn / Betriebsertrag × 100. Einzelne Kostenursachen sind nicht allein aus den Zwischensummen ableitbar.",
  },
  6: {
    title: "Reingewinnmarge",
    rows: [
      ["Betriebsertrag", "revenue"],
      ["Betriebsgewinn", "operation"],
      ["Reingewinn", "net"],
    ],
    note: "Reingewinnmarge = Reingewinn / Betriebsertrag × 100. Tebo-Juni-Abschlusskonto 8000 ist gemäss vereinbarter Bereinigung separat behandelt; andere Sondereffekte nicht pauschal herausgerechnet.",
  },
  8: {
    title: "Personalaufwand zum Bruttogewinn",
    rows: [
      ["Bruttogewinn", "gross"],
      ["Personalaufwand", "staff"],
      ["Betriebsertrag", "revenue"],
    ],
    note: "Kennzahl = Personalaufwand / Bruttogewinn × 100. Sie zeigt, welcher Anteil der Wertschöpfung rechnerisch auf Personalkosten entfällt.",
  },
  10: {
    title: "Betriebsgewinnveränderung",
    rows: [
      ["Betriebsertrag", "revenue"],
      ["Bruttogewinn", "gross"],
      ["Personalaufwand", "staff"],
      ["Betriebsgewinn", "operation"],
    ],
    note: "Betriebsgewinnveränderung = Betriebsgewinn aktuell − Betriebsgewinn Vorjahr. Die Zahl ist eine absolute Veränderung in CHF und keine Marge.",
  },
};

/** Details für alle KPIs ausser Nr. 9. */
export function KpiOtherDetails({ index, comp }) {
  const cp = comp.current;
  const pp = comp.prior;

  if (index === 7) {
    return (
      <p>
        Keine FTE-Daten für die ausgewählten Jahre vorhanden. Für einen belastbaren Umsatz pro Mitarbeiter
        werden die durchschnittlichen Vollzeitäquivalente von beiden Jahren und – in der Gruppensicht – von
        beiden Firmen benötigt. Es wird kein fiktiver Personalbestand eingesetzt.
      </p>
    );
  }
  if (!cp || !pp || !comp.months.length) {
    return <p>Keine ausreichend vollständigen und vergleichbaren ER-Summen für diesen Zeitraum vorhanden.</p>;
  }
  const d = DEFS[index];
  if (!d) return <p>Kein Detailvergleich verfügbar.</p>;

  const quota = (numer, denom) => (Number(denom) > 0 ? (100 * Number(numer)) / Number(denom) : null);
  const f = (v) => (v === null ? "–" : v.toFixed(2) + " %");
  let old = null;
  let now = null;
  const unit = index === 1 ? "% Wachstum" : "Prozentpunkte";
  if (index === 1) now = Number(pp.revenue) > 0 ? 100 * (Number(cp.revenue) / Number(pp.revenue) - 1) : null;
  if (index === 2) [old, now] = [quota(pp.gross, pp.revenue), quota(cp.gross, cp.revenue)];
  if (index === 3) [old, now] = [quota(pp.cost, pp.revenue), quota(cp.cost, cp.revenue)];
  if (index === 4) [old, now] = [quota(pp.staff, pp.revenue), quota(cp.staff, cp.revenue)];
  if (index === 5) [old, now] = [quota(pp.operation, pp.revenue), quota(cp.operation, cp.revenue)];
  if (index === 6) [old, now] = [quota(pp.net, pp.revenue), quota(cp.net, cp.revenue)];
  if (index === 8) [old, now] = [quota(pp.staff, pp.gross), quota(cp.staff, cp.gross)];

  let summary = null;
  if (index === 10) {
    summary = (
      <p>
        <strong>Differenz:</strong> {fmt(Number(cp.operation) - Number(pp.operation))} CHF.
      </p>
    );
  } else if (index === 1) {
    summary = (
      <p>
        <strong>Umsatzwachstum:</strong> {f(now)} gegenüber Vorjahr.
      </p>
    );
  } else if (old !== null && now !== null) {
    summary = (
      <p>
        <strong>Quote:</strong> {f(old)} → {f(now)} ({now - old >= 0 ? "+" : ""}
        {(now - old).toFixed(2)} {unit}).
      </p>
    );
  }

  return (
    <>
      <p>
        <strong>{d.title} – ER-Vorjahresvergleich</strong>
      </p>
      <DiffTable
        rows={d.rows.map(([name, key]) => {
          const a = Number(pp[key]);
          const b = Number(cp[key]);
          return (
            <tr key={key}>
              <td>{name}</td>
              <td>{fmt(a)}</td>
              <td>{fmt(b)}</td>
              <td>{fmt(b - a)}</td>
            </tr>
          );
        })}
      />
      {summary}
      <p>{d.note}</p>
      {!comp.full && (
        <div className="caution">
          Teilperiode: Es wurden nur die {comp.months.length} verfügbaren vergleichbaren Monate ausgewertet.
          Kein vollständiger Jahreswert.
        </div>
      )}
      <p>
        <strong>Einzelkonten:</strong> Detaillierte Ursachen nach Konto sind nur bei vollständigen
        Kontenwerten für beide Vergleichszeiträume belastbar. Die dargestellte Abweichung basiert auf
        offiziellen ER-Zwischensummen.
      </p>
    </>
  );
}
