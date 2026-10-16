

export function companiesFor(selected) {
  return selected === "Gruppe" ? ["Schlauchservice", "Tebo AG"] : [selected];
}
export function periodMonths(period) {
  const y = +period.slice(0, 4);
  if (period.endsWith("-YEAR")) {
    return Array.from({ length: 12 }, (_, i) => y + "-" + String(i + 1).padStart(2, "0"));
  }
  const m = +period.slice(5, 7);
  return [0, 1, 2].map((i) => y + "-" + String(m + i).padStart(2, "0"));
}


export function quarterLabel(company, period) {
  const m = +period.slice(5, 7);
  const y = +period.slice(0, 4);
  if (company === "Tebo AG") {
    const q = Math.floor(((m + 5) % 12) / 3) + 1;
    const fy = m >= 7 ? y : y - 1;
    return "Q" + q + " Geschäftsjahr " + fy + "/" + String((fy + 1) % 100).padStart(2, "0");
  }
  return "Q" + (Math.floor((m - 1) / 3) + 1) + " " + y;
}

export function quarterLabelForPeriod(v) {
  const y = +v.slice(0, 4);
  const m = +v.slice(5, 7);
  return v.endsWith("-YEAR")
    ? "Gesamtes Kalenderjahr " + y
    : "Q" + (Math.floor((m - 1) / 3) + 1) + " " + y + " · Kalenderquartal";
}

export function availablePeriods(data) {
  const months = new Set(data.rows.map((r) => r.Monat));
  Object.keys(data.monthOfficial || {}).forEach((k) => months.add(k.split("|")[1]));
  months.add("2026-07");
  const valid = [...months].filter((v) => /^20\d{2}-\d{2}$/.test(v));
  const periods = valid.map(
    (v) => v.slice(0, 5) + String(Math.floor((+v.slice(5, 7) - 1) / 3) * 3 + 1).padStart(2, "0"),
  );
  const years = valid.map((v) => v.slice(0, 4) + "-YEAR");
  return [...new Set([...periods, ...years])].sort((a, b) =>
    a.slice(0, 4) === b.slice(0, 4)
      ? a.endsWith("YEAR")
        ? -1
        : b.endsWith("YEAR")
          ? 1
          : a.localeCompare(b)
      : a.localeCompare(b),
  );
}
