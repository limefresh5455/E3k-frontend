import { useState } from "react";
import { xlsxToRows, extractEr } from "../utils/xlsxImport";
import { downloadFile } from "../utils/storage";
import { money } from "../utils/format";

const DEFAULT_MESSAGE =
  "Der Import ergänzt oder ersetzt nur den erkannten Monat. Vorhandene Monatsdaten bleiben erhalten. Bitte die heruntergeladene JSON-Sicherung regelmässig ausserhalb des Browsers aufbewahren.";

export default function ImportPanel({ data, onApplyEr, onRestore }) {
  const [pending, setPending] = useState([]);
  const [message, setMessage] = useState({ text: DEFAULT_MESSAGE, status: "" });

  const msg = (text, bad = false) => setMessage({ text, status: bad ? "error" : "ok" });

  const handleUpload = async (ev) => {
    const input = ev.target;
    const files = Array.from(input.files || []);
    const parsed = [];
    for (const file of files) {
      try {
        const rows = await xlsxToRows(file);
        const x = extractEr(rows, file.name);
        if (!/^20\d{2}-\d{2}$/.test(x.ym)) throw Error("Ungültiger Monat");
        parsed.push(x);
        msg("Excel gelesen: " + file.name + " – bitte die offiziellen Summen unten prüfen und übernehmen.");
      } catch (e) {
        msg(file.name + ": " + e.message, true);
      }
    }
    if (parsed.length) setPending((prev) => [...prev, ...parsed]);
    input.value = "";
  };

  const handleApply = (x, i) => {
    try {
      const stored = onApplyEr(x);
      setPending((prev) => prev.filter((_, idx) => idx !== i));
      msg(
        "Import abgeschlossen: " +
        x.firma +
        " " +
        x.ym +
        ". " +
        (stored
          ? "Daten lokal gespeichert."
          : "ACHTUNG: Browser-Speicher nicht verfügbar, jetzt unbedingt JSON-Sicherung herunterladen!") +
        " Quartalsübersicht aktualisiert, soweit die vollständigen Monatswerte vorliegen.",
        !stored,
      );
    } catch (e) {
      msg("Speichern nicht möglich: " + e.message, true);
    }
  };

  const handleBackup = () =>
    downloadFile(
      "Finanz_Cockpit_Sicherung_" + new Date().toISOString().slice(0, 10) + ".json",
      JSON.stringify({ version: 1, savedAt: new Date().toISOString(), data }, null, 2),
      "application/json",
    );

  const handleRestore = async (ev) => {
    const input = ev.target;
    try {
      const obj = JSON.parse(await input.files[0].text());
      const d = obj.data;
      if (!d || !Array.isArray(d.rows) || !d.quarter || !d.revenue || !d.profits) {
        throw Error("Ungültige Sicherung");
      }
      if (!window.confirm("Aktuelle lokale Daten durch diese Sicherung ersetzen?")) return;
      onRestore(d);
      msg("Sicherung erfolgreich geladen.");
    } catch (e) {
      msg("Sicherung nicht geladen: " + e.message, true);
    } finally {
      input.value = "";
    }
  };

  return (
    <section className="panel importpanel">
      <div className="sectiontop">
        <div>
          <h2>Monatliche Europa3000-Erfolgsrechnung importieren</h2>
          <p>Excel (.xlsx) direkt im Browser · vor dem Übernehmen geprüft · lokale Speicherung</p>
        </div>
        <div className="import-actions">
          <label className="action primary" htmlFor="fc-upload">
            Excel auswählen
          </label>
          <input type="file" id="fc-upload" accept=".xlsx" multiple hidden onChange={handleUpload} />
          <button type="button" className="action" onClick={handleBackup}>
            Sicherung herunterladen
          </button>
          <label className="action" htmlFor="fc-restore">
            Sicherung einlesen
          </label>
          <input type="file" id="fc-restore" accept=".json" hidden onChange={handleRestore} />
        </div>
      </div>

      <div className={"importmsg" + (message.status ? " " + message.status : "")}>{message.text}</div>

      <div>
        {pending.map((x, i) => {
          const exists = data.rows.some((r) => r.Firma === x.firma && r.Monat === x.ym);
          return (
            <div className="pendingitem" key={x.firma + "|" + x.ym + "|" + i}>
              <strong>
                {x.firma} · {x.ym}
              </strong>
              <span>
                Betriebsertrag: {money(x.summary.revenue)} · Bruttogewinn: {money(x.summary.gross)} ·
                Reingewinn: {money(x.summary.net)} · {x.records.length} Konten
              </span>
              <br />
              <small>
                {exists ? "Dieser Monat ist bereits vorhanden und wird beim Übernehmen ersetzt. " : ""}
                {Math.abs(x.accountRevenue - x.summary.revenue) > 0.15
                  ? "Achtung: Die Summe der Erlöskonten weicht vom offiziellen ER-Umsatz ab; offizielle Zwischensumme wird verwendet."
                  : "Erlöskonten stimmen mit der ER überein."}
              </small>
              <div>
                <button type="button" className="action primary" onClick={() => handleApply(x, i)}>
                  Geprüfte ER übernehmen
                </button>
                <button
                  type="button"
                  className="action"
                  onClick={() => setPending((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  Verwerfen
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
