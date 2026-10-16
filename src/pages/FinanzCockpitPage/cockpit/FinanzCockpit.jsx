import React, { useMemo, useState } from "react";
import "./FinanzCockpit.css";
import CockpitHeader from "./components/CockpitHeader";
import QuarterSection from "./components/QuarterSection";
import CoveragePanel from "./components/CoveragePanel";
import KpiPanel from "./components/KpiPanel";
import BenchmarkPanel from "./components/BenchmarkPanel";
import ImportPanel from "./components/ImportPanel";
import MonthsSection from "./components/MonthsSection";
import { applyEr, loadData, normalizeData, cloneData, saveData } from "./utils/storage";
import { availablePeriods } from "./utils/periods";
import { qdata } from "./utils/calculations";


export default function FinanzCockpit({ onLogout }) {
  const [data, setData] = useState(loadData);
  const [selected, setSelected] = useState("Schlauchservice");
  const [selectedPeriod, setSelectedPeriod] = useState("2026-07");

  const periods = useMemo(() => availablePeriods(data), [data]);
  const period = periods.includes(selectedPeriod) ? selectedPeriod : periods[periods.length - 1];

  const q = useMemo(() => qdata(data, selected, period), [data, selected, period]);

  const handleApplyEr = (x) => {
    const next = applyEr(data, x);
    const stored = saveData(next);
    setData(next);
    setSelectedPeriod(
      x.ym.slice(0, 5) + String(Math.floor((+x.ym.slice(5) - 1) / 3) * 3 + 1).padStart(2, "0"),
    );
    return stored;
  };

  const handleRestore = (restored) => {
    const next = normalizeData(cloneData(restored));
    saveData(next);
    setData(next);
  };

  const viewKey = selected + "|" + period;

  return (
    <div className="fc-cockpit">
      <div className="wrap">
        <CockpitHeader selected={selected} onSelect={setSelected} onLogout={onLogout} />

        <QuarterSection
          data={data}
          selected={selected}
          period={period}
          periods={periods}
          onPeriodChange={setSelectedPeriod}
          q={q}
        />
        <CoveragePanel data={data} selected={selected} period={period} />
        <KpiPanel key={"kpi|" + viewKey} data={data} selected={selected} period={period} />
        <BenchmarkPanel selected={selected} q={q} />
        <ImportPanel data={data} onApplyEr={handleApplyEr} onRestore={handleRestore} />
        <MonthsSection key={"months|" + viewKey} data={data} selected={selected} period={period} />

        <div className="footer">
          Quelle: Europa3000-ER-Exporte von Tebo AG und Schlauchservice. Daten werden direkt in dieser Seite
          dargestellt, ohne Cloud-Speicherung. Monatliche Buchungskonten und offizielle ER-Abschlusssummen
          können wegen Exportzuordnung oder Abschlussbuchungen voneinander abweichen. Zahlen der Gruppe sind
          vor Konsolidierung addiert.
        </div>
      </div>
    </div>
  );
}
