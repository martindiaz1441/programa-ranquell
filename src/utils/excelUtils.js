// src/utils/excelUtils.js
// Import / Export Excel + detección automática kg/unidad + catálogo desde tu planilla
import * as XLSX from "xlsx";

/* ============== Helpers ============== */
function readWorkbook(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      try { resolve(XLSX.read(r.result, { type: "binary" })); }
      catch (e) { reject(e); }
    };
    r.onerror = reject;
    r.readAsBinaryString(file);
  });
}
function sheetToRows2D(sheet) {
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
}
function normalizeStr(s) {
  return String(s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ").trim().toLowerCase();
}
function onlyLettersDigitsSpaces(s) {
  return String(s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim().toLowerCase();
}
function toNumber(v) {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

/* ============== Catálogo desde LS (para deducir KG/Unidad en egresos/ingresos) ============== */
const LS_CATALOGO = "ranquelProductosV2"; // usamos el de productService
function getCatalogoLS() {
  try {
    const raw = localStorage.getItem(LS_CATALOGO);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function buildCatalogIndex() {
  const idx = new Map(); // normalizedName -> { unidad, canonical }
  for (const p of getCatalogoLS()) {
    const n = normalizeStr(p?.nombre);
    if (!n) continue;
    idx.set(n, {
      unidad: p?.tipo === "unidad" ? "unidad" : "kg",
      canonical: p?.nombre || ""
    });
  }
  return idx;
}

/* ============== Diccionario manual (tus conflictivos) ============== */
const MANUALES = new Map(Object.entries({
  "barra bife s lomo":        { tipo: "kg",     canonical: "Barra Bife s/Lomo" },
  "asado completo":           { tipo: "kg",     canonical: "Asado Completo" },
  "barra bife c lomo":        { tipo: "kg",     canonical: "Barra Bife c/Lomo" },
  "bolsa de hueso":           { tipo: "kg",     canonical: "Bolsa de Hueso" },
  "carcaza":                  { tipo: "kg",     canonical: "Carcasa" },
  "cartilago":                { tipo: "kg",     canonical: "Cartílago" },
  "falda en tira":            { tipo: "kg",     canonical: "Falda en Tira" },
  "falda redonda":            { tipo: "kg",     canonical: "Falda Redonda" },
  "matambre fresco vacuno":   { tipo: "kg",     canonical: "Matambre Fresco Vacuno" },
  "oferta caracu":            { tipo: "kg",     canonical: "Caracú" },
  "oferta falda":             { tipo: "kg",     canonical: "Falda" },
  "ojo bife":                 { tipo: "kg",     canonical: "Ojo de Bife" },
  "sebo":                     { tipo: "kg",     canonical: "Sebo" },
  "oferta americano cerdo":   { tipo: "kg",     canonical: "Americano de Cerdo" },
  "oferta chuleta de cerdo no usar": { tipo: "kg", canonical: "Chuleta de Cerdo" },
  "recorte cerdo a":          { tipo: "kg",     canonical: "Recorte de Cerdo A" },
  "unto":                     { tipo: "kg",     canonical: "Unto" },
  "berni cirone cajon pollo": { tipo: "unidad", canonical: "Cajón de Pollo" },
  "epico bonnin x cajon":     { tipo: "unidad", canonical: "Cajón de Pollo" },
  "piel":                     { tipo: "kg",     canonical: "Piel" },
  "lomo vacuno":              { tipo: "kg",     canonical: "Lomo Vacuno" },
  "media res nto":            { tipo: "kg",     canonical: "Media Res NTO" },
  "mocho rueda":              { tipo: "kg",     canonical: "Mocho Rueda" },
  "oferta espinazo":          { tipo: "kg",     canonical: "Espinazo" },
  "oferta osobuco":           { tipo: "kg",     canonical: "Osobuco" },
  "picada vacuna":            { tipo: "kg",     canonical: "Picada Vacuna" },
  "cabeza":                   { tipo: "kg",     canonical: "Cabeza" },
  "grasa cerdo":              { tipo: "kg",     canonical: "Grasa de Cerdo" },
  "matambre cerdo":           { tipo: "kg",     canonical: "Matambre de Cerdo" },
  "picada cerdo":             { tipo: "kg",     canonical: "Picada de Cerdo" },
  "pulpa jamon":              { tipo: "kg",     canonical: "Pulpa Jamón" },
  "pulpa paleta":             { tipo: "kg",     canonical: "Pulpa Paleta" },
  "menudo x 10":              { tipo: "kg",     canonical: "Menudo x 10" },
  "picada de pollo":          { tipo: "kg",     canonical: "Picada de Pollo" }
}));

/* ============== Heurísticas para KG/Unidad (ingresos/egresos) ============== */
function heuristicaTipoPorNombre(name) {
  const n = " " + normalizeStr(name) + " ";
  if (/\b(cajon|cajones|caja|cajas|pza|pieza|piezas|unidad|unidades)\b/.test(n)) return "unidad";
  if (/\b(kg|kilo|kilos|x kg| xkg|xkg)\b/.test(n)) return "kg";
  if (/\b\d+\s*kg\b/.test(n)) return "kg";
  return null;
}
function similarity(a, b) {
  if (a === b) return 1;
  const A = bigrams(a), B = bigrams(b);
  if (!A.size && !B.size) return 1;
  let inter = 0; for (const x of A) if (B.has(x)) inter++;
  return (2 * inter) / (A.size + B.size);
}
function bigrams(str) {
  const s = onlyLettersDigitsSpaces(str);
  const set = new Set();
  for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
  return set;
}
function deducirTipo(nombre, catalogIndex) {
  const norm = normalizeStr(nombre);
  if (catalogIndex.has(norm)) {
    const c = catalogIndex.get(norm);
    return { tipo: c.unidad, canonical: c.canonical || nombre };
  }
  if (MANUALES.has(norm)) {
    const m = MANUALES.get(norm);
    return { tipo: m.tipo, canonical: m.canonical || nombre };
  }
  const tip = heuristicaTipoPorNombre(nombre);
  if (tip) return { tipo: tip, canonical: nombre };

  let best = null; let bestScore = 0;
  for (const [k, v] of catalogIndex.entries()) {
    const score = similarity(norm, k);
    if (score > bestScore) { bestScore = score; best = v; }
  }
  if (best && bestScore >= 0.86) return { tipo: best.unidad, canonical: best.canonical || nombre };
  return null;
}

/* ============== Parsers de 2 columnas / con cabeceras (ingresos/egresos) ============== */
function parseDosColumnas(rows2D) {
  const out = [];
  for (let i = 0; i < rows2D.length; i++) {
    const row = rows2D[i];
    if (!row || row.length < 2) continue;
    const p = String(row[0] ?? "").trim();
    const val = toNumber(row[1]);
    const headerLike =
      normalizeStr(p).includes("producto") ||
      normalizeStr(row[1]).includes("kg") ||
      normalizeStr(row[1]).includes("unidad");
    if (!p) continue;
    if (i === 0 && headerLike) continue;
    if (!val) continue;
    out.push({ producto: p, unicoValor: val, __row: i + 1 });
  }
  return out;
}
function parseListadoCabeceras(sheet) {
  const objRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  const out = [];
  if (!objRows.length) return out;

  const keys = Object.keys(objRows[0] || {}).map(k => ({ key: k, norm: normalizeStr(k) }));
  const colProd = keys.find(k => /\b(prod|producto)\b/.test(k.norm))?.key;
  const colKg   = keys.find(k => /\b(kg|kilo|kilos|peso)\b/.test(k.norm))?.key;
  const colCant = keys.find(k => /\b(cant|unidad|unidades|pza|pieza)\b/.test(k.norm))?.key;

  for (let i = 0; i < objRows.length; i++) {
    const r = objRows[i];
    const p = String(r[colProd] ?? "").trim();
    const kg = toNumber(r[colKg] ?? 0);
    const c  = toNumber(r[colCant] ?? 0);
    if (!p) continue;
    if (kg <= 0 && c <= 0) continue;
    out.push({ producto: p, kg, cantidad: c, __row: i + 2 });
  }
  return out;
}

/* ============== Importadores públicos: Egresos / Ingresos ============== */
export function importarEgresosExcel(file, callback) {
  readWorkbook(file).then(wb => {
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows2D = sheetToRows2D(sheet);

    let items = parseDosColumnas(rows2D);
    const esDosCol = items.length > 0;
    if (!esDosCol) items = parseListadoCabeceras(sheet);

    const catalogIndex = buildCatalogIndex();
    const salida = [];

    if (esDosCol) {
      for (const r of items) {
        const tip = deducirTipo(r.producto, catalogIndex);
        if (!tip) {
          salida.push({ __error: `Tipo desconocido para "${r.producto}". Definilo en Catálogo (kg/unidad) o agregá una pista en el nombre (ej: "X KG" / "X PIEZA").` });
          continue;
        }
        const row = { producto: tip.canonical || r.producto, kg: 0, cantidad: 0 };
        if (tip.tipo === "kg") row.kg = r.unicoValor;
        else row.cantidad = r.unicoValor;
        salida.push(row);
      }
    } else {
      for (const r of items) {
        const tip = deducirTipo(r.producto, catalogIndex);
        if (!tip && !(r.kg > 0 ^ r.cantidad > 0)) {
          salida.push({ __error: `Tipo desconocido para "${r.producto}". Definilo en Catálogo (kg/unidad) o agregá una pista en el nombre.` });
          continue;
        }
        const row = { producto: (tip?.canonical || r.producto), kg: Number(r.kg || 0), cantidad: Number(r.cantidad || 0) };
        if (tip) {
          if (tip.tipo === "kg"     && row.cantidad > 0 && row.kg === 0) { row.kg = row.cantidad; row.cantidad = 0; }
          if (tip.tipo === "unidad" && row.kg > 0       && row.cantidad === 0) { row.cantidad = Math.round(row.kg); row.kg = 0; }
        }
        salida.push(row);
      }
    }
    callback(salida);
  }).catch(err => {
    console.error(err);
    callback([{ __error: "No pude leer el Excel. Verificá el formato." }]);
  });
}
export function importarIngresosExcel(file, callback) {
  importarEgresosExcel(file, callback);
}

/* ============== Catálogo: importar desde tu Excel (CATEGORIA / DESCRIPCION / TIPO / COSTO) ============== */
export async function importarCatalogoProductosExcel(file) {
  const wb = await readWorkbook(file);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows2D = sheetToRows2D(sheet); // matriz

  // Buscar fila de encabezados
  let headerRow = -1;
  for (let i = 0; i < rows2D.length; i++) {
    const row = rows2D[i].map(x => normalizeStr(x));
    if (row.includes("categoria") && (row.includes("descripcion") || row.includes("descripción")) && row.includes("tipo") && (row.includes("costo") || row.includes("precio"))) {
      headerRow = i;
      break;
    }
  }
  if (headerRow === -1) {
    // fallback al json plano
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const out = [];
    for (const r of rows) {
      const keys = Object.keys(r).reduce((acc,k)=>({ ...acc, [normalizeStr(k)]: k }), {});
      const kNombre = keys["descripcion"] || keys["descripción"] || keys["producto"] || keys["nombre"] || Object.keys(r)[0];
      const kCat    = keys["categoria"] || keys["rubro"] || null;
      const kTipo   = keys["tipo"] || null;
      const kPrecio = keys["costo"] || keys["precio"] || null;

      const nombre = String(r[kNombre] ?? "").trim();
      if (!nombre) continue;
      const categoria = String((kCat ? r[kCat] : "General") || "General").trim();
      const unidad = String((kTipo ? r[kTipo] : "kg") || "kg").trim().toLowerCase() === "unidad" ? "unidad" : "kg";
      const precio = toNumber(kPrecio ? r[kPrecio] : 0);
      out.push({ nombre, categoria, unidad, precio });
    }
    return out;
  }

  // Mapear índices de columnas
  const hdr = rows2D[headerRow];
  const idxCat  = hdr.findIndex(c => /categoria/i.test(String(c)));
  const idxDesc = hdr.findIndex(c => /(descripcion|descripción|producto|nombre)/i.test(String(c)));
  const idxTipo = hdr.findIndex(c => /tipo/i.test(String(c)));
  const idxCost = hdr.findIndex(c => /(costo|precio)/i.test(String(c)));

  let lastCat = "General";
  const out = [];
  for (let r = headerRow + 1; r < rows2D.length; r++) {
    const row = rows2D[r];
    if (!row || row.every(x => String(x||"").trim() === "")) continue;

    const catRaw  = idxCat  >= 0 ? String(row[idxCat]  ?? "").trim() : "";
    const nombre  = idxDesc >= 0 ? String(row[idxDesc] ?? "").trim() : "";
    const tipoRaw = idxTipo >= 0 ? String(row[idxTipo] ?? "").trim() : "";
    const costRaw = idxCost >= 0 ? row[idxCost] : 0;

    if (catRaw) lastCat = catRaw; // forward-fill categoría
    if (!nombre) continue;

    const unidad = /unidad/i.test(tipoRaw) ? "unidad" : "kg";
    const precio = toNumber(costRaw);

    out.push({ nombre, categoria: lastCat || "General", unidad, precio });
  }

  // Dedup por nombre (último gana)
  const map = new Map();
  for (const p of out) map.set(normalizeStr(p.nombre), p);
  return Array.from(map.values());
}

/* ============== Historial export/import (igual que antes) ============== */
export function exportarHistorialExcel(historial = []) {
  const flat = [];
  (historial || []).forEach(h => {
    (h?.produccion || []).forEach(p => flat.push({
      Tipo: "Producción", Fecha: h.fecha, Usuario: h.usuario,
      Corte: p.corte, Kg: p.kg, Tara: p.tara, Unidades: p.unidades, KgNeto: p.kgneto
    }));
    (h?.ingresos || []).forEach(i => flat.push({
      Tipo: "Ingreso", Fecha: h.fecha, Usuario: h.usuario,
      Producto: i.producto, Cantidad: i.cantidad, Kg: i.kg
    }));
    (h?.egresos || []).forEach(e => flat.push({
      Tipo: "Egreso", Fecha: h.fecha, Usuario: h.usuario,
      Producto: e.producto, Cantidad: e.cantidad, Kg: e.kg
    }));
  });

  const ws = XLSX.utils.json_to_sheet(flat);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Historial");
  XLSX.writeFile(wb, "historial.xlsx");
}
export function importarHistorialExcel(file, callback) {
  readWorkbook(file).then(wb => {
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    callback(rows);
  }).catch(err => {
    console.error(err);
    callback([{ __error: "No pude leer el Excel de historial." }]);
  });
}
