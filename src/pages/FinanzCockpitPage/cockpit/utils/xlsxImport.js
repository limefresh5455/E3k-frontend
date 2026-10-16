function xmlDoc(str) {
  let x = new DOMParser().parseFromString(str, "application/xml");
  if (x.querySelector("parsererror")) throw Error("Excel-XML nicht lesbar");
  return x;
}
function textOf(parent, tag) {
  let el = parent.getElementsByTagName(tag)[0];
  return el ? el.textContent : "";
}
function decodeCells(str, strings) {
  let xml = xmlDoc(str),
    out = [];
  for (const row of xml.getElementsByTagName("row")) {
    let a = [];
    for (const c of row.getElementsByTagName("c")) {
      let ref = c.getAttribute("r") || "",
        col = ref.match(/^[A-Z]+/);
      if (!col) continue;
      let idx = 0;
      for (const z of col[0]) idx = idx * 26 + z.charCodeAt(0) - 64;
      idx--;
      let t = c.getAttribute("t"),
        raw = textOf(c, "v"),
        v = t === "inlineStr" ? textOf(c, "is") : t === "s" ? strings[+raw] || "" : raw;
      if (v !== "" && v !== null) a[idx] = v;
    }
    out.push(a);
  }
  return out;
}
export async function xlsxToRows(file) {
  let bytes = new Uint8Array(await file.arrayBuffer()),
    v = new DataView(bytes.buffer),
    end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (v.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) throw Error("Keine gültige XLSX/ZIP-Datei");
  let count = v.getUint16(end + 10, true),
    pos = v.getUint32(end + 16, true),
    entries = {};
  for (let i = 0; i < count; i++) {
    if (v.getUint32(pos, true) !== 0x02014b50) throw Error("ZIP-Verzeichnis beschädigt");
    let method = v.getUint16(pos + 10, true),
      compressed = v.getUint32(pos + 20, true),
      nameLen = v.getUint16(pos + 28, true),
      extra = v.getUint16(pos + 30, true),
      comment = v.getUint16(pos + 32, true),
      offset = v.getUint32(pos + 42, true),
      name = new TextDecoder().decode(bytes.slice(pos + 46, pos + 46 + nameLen));
    entries[name] = { method, compressed, offset };
    pos += 46 + nameLen + extra + comment;
  }
  async function read(name) {
    let e = entries[name];
    if (!e) throw Error("Excel-Bestandteil fehlt: " + name);
    let start = e.offset;
    if (v.getUint32(start, true) !== 0x04034b50) throw Error("ZIP-Eintrag ungültig");
    start += 30 + v.getUint16(start + 26, true) + v.getUint16(start + 28, true);
    let data = bytes.slice(start, start + e.compressed),
      out;
    if (e.method === 0) out = data;
    else if (e.method === 8) {
      if (typeof DecompressionStream === "undefined")
        throw Error("Bitte aktuellen Edge oder Chrome verwenden");
      let stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      out = new Uint8Array(await new Response(stream).arrayBuffer());
    } else throw Error("Unbekannte ZIP-Kompression");
    return new TextDecoder("utf-8").decode(out);
  }
  let shared = [];
  if (entries["xl/sharedStrings.xml"]) {
    let x = xmlDoc(await read("xl/sharedStrings.xml"));
    shared = Array.from(x.getElementsByTagName("si")).map((e) => e.textContent);
  }
  let sheet = Object.keys(entries)
    .filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n))
    .sort()[0];
  if (!sheet) throw Error("Kein Tabellenblatt in der XLSX-Datei");
  return decodeCells(await read(sheet), shared);
}
function num(x) {
  if (typeof x === "number") return x;
  let s = String(x ?? "")
    .replace(/[’'\s]/g, "")
    .replace(",", ".");
  return s && !isNaN(Number(s)) ? Number(s) : 0;
}
function category(account) {
  let n = +account;
  if (n >= 6000 && n < 7000) return "Umsatz";
  if (n >= 3000 && n < 4000) return "Materialaufwand";
  if (n >= 4000 && n < 4100) return "Personalaufwand";
  if (n >= 4200 && n < 4300) return "Finanzergebnis";
  return "Betriebsaufwand";
}
export function extractEr(table, filename) {
  const all = table.map((r) => (r || []).join(" ").trim());
  const head = (all.slice(0, 10).join(" ") + " " + filename).toLowerCase(),
    firma = /tebo/i.test(head) ? "Tebo AG" : /schlauch|ssb/i.test(head) ? "Schlauchservice" : null;
  if (!firma) throw Error("Firma konnte nicht eindeutig erkannt werden");
  let dateText = all.slice(0, 8).join(" "),
    match = dateText.match(/(\d{2})\.(\d{2})\.(\d{2,4})\s*[-–]\s*(\d{2})\.(\d{2})\.(\d{2,4})/);
  if (!match) throw Error("Abrechnungszeitraum im Excel-Kopf nicht erkannt");
  let yy = Number(match[3]);
  let startYear = yy < 100 ? 2000 + yy : yy;
  let endYear = +match[6] < 100 ? 2000 + +match[6] : +match[6];
  let start = new Date(Date.UTC(startYear, +match[2] - 1, +match[1])),
    end = new Date(Date.UTC(endYear, +match[5] - 1, +match[4]));
  if (
    startYear !== endYear ||
    start.getUTCMonth() !== end.getUTCMonth() ||
    start.getUTCDate() !== 1 ||
    end.getUTCDate() !== new Date(Date.UTC(endYear, end.getUTCMonth() + 1, 0)).getUTCDate()
  )
    throw Error("Bitte eine einzelne vollständige Monats-ER hochladen (keine kumulierte ER)");
  let ym = startYear + "-" + String(start.getUTCMonth() + 1).padStart(2, "0");
  let debit = firma === "Tebo AG" ? 3 : 3,
    credit = firma === "Tebo AG" ? 5 : 6;
  let summary = {},
    records = [];
  for (let r of table) {
    let label = String(r[0] || "").trim(),
      up = label.toUpperCase().replace(/\s+/g, " ");
    let amtD = num(r[debit]),
      amtC = num(r[credit]);
    if (/TOTAL BETRIEBSERTRAG/.test(up)) summary.revenue = (firma === "Tebo AG" ? num(r[6]) : amtC) - amtD;
    else if (/TOTAL MATERIAL.*WARENAUFWAND/.test(up)) summary.cost = amtD - amtC;
    else if (/^BRUTTOGEWINN/.test(up)) summary.gross = amtD || amtC;
    else if (/^BETRIEBSGEWINN/.test(up)) summary.operation = amtD || amtC;
    else if (/^REINGEWINN/.test(up)) summary.net = amtD || amtC;
    let m = label.match(/^(\d{4})\s+(.+)$/);
    if (!m || (!amtD && !amtC)) continue;
    let cat = category(m[1]),
      betrag = cat === "Umsatz" || cat === "Finanzergebnis" ? amtC - amtD : amtD - amtC;
    records.push({
      Firma: firma,
      Monat: ym,
      Konto: m[1],
      Kontobezeichnung: m[2],
      Kategorie: cat,
      Betrag: Math.round(betrag * 100) / 100,
      Quelle: filename,
    });
  }
  for (let key of ["revenue", "cost", "gross", "operation", "net"])
    if (!Number.isFinite(summary[key])) throw Error("Offizielle ER-Zwischensumme fehlt: " + key);
  if (Math.abs(summary.revenue - summary.cost - summary.gross) > 0.15)
    throw Error(
      "Kontrolle fehlgeschlagen: Betriebsertrag " +
      summary.revenue +
      " − Materialaufwand " +
      summary.cost +
      " ≠ Bruttogewinn " +
      summary.gross,
    );
  if (!records.length) throw Error("Keine Einzelkonten gefunden");
  summary.staff =
    Math.round(
      records.filter((r) => r.Kategorie === "Personalaufwand").reduce((a, r) => a + r.Betrag, 0) * 100,
    ) / 100;
  let accountRevenue = records.filter((r) => r.Kategorie === "Umsatz").reduce((a, r) => a + r.Betrag, 0);
  return { firma, ym, summary, records, accountRevenue, filename };
}
