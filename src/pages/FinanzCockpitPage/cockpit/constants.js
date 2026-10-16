
export const STORAGE_KEY = "finanz_cockpit_2026_10_tebo_jan_sep_v2";

export const SUMMARY_KEYS = ["revenue", "cost", "gross", "staff", "operation", "net"];

export const CATS = [
  "Umsatz",
  "Materialaufwand",
  "Personalaufwand",
  "Betriebsaufwand",
  "Finanzergebnis",
  "Abschlussbuchung",
];

export const MONTH_NAMES = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export const COMPANIES = [
  { key: "Schlauchservice", label: "SSB" },
  { key: "Tebo AG", label: "Tebo AG" },
  { key: "Gruppe", label: "Gruppe" },
];

// Explizite Kontenzuordnung: keine Klassifikation nach Wortsuche.
// Unbekannte Konten bleiben offen; keine stillschweigende Zuordnung zu Waren.
export const REVENUE_ACCOUNT_MAP = {
  Schlauchservice: {
    6001: "material",
    6100: "material",
    6200: "material",
    6300: "material",
    6400: "material",
    6500: "material",
    6005: "service",
    6002: "other",
    6061: "other",
    6065: "other",
    6107: "other",
    6490: "other",
    6650: "other",
  },
  "Tebo AG": {
    6000: "material",
    6001: "material",
    6002: "material",
    6003: "material",
    6004: "material",
    6005: "material",
    6006: "material",
    6007: "material",
    6008: "material",
    6009: "material",
    6010: "material",
    6011: "material",
    6012: "material",
    6019: "unclassified",
    6031: "other",
    6800: "other",
    6801: "service",
    6020: "unclassified",
    6035: "unclassified",
    6014: "material",
    6015: "unclassified",
    6032: "unclassified",
    6512: "unclassified",
    6036: "unclassified",
  },
};

// BFS-Referenz (NOGA 46, Berichtsjahr 2020)
export const BFS_BENCHMARK_MARGIN = 2.2;
