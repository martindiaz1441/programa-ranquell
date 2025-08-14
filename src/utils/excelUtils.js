// src/utils/excelUtils.js
import * as XLSX from "xlsx";

// Normaliza encabezados (sin acentos, minúsculas, sin espacios)
function norm(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

const headerMap = {
  producto: ["producto", "nombre", "corte", "productocorte", "item"],
  kg: ["kg", "kilos", "peso", "kilogramos"],
  cantidad: ["cantidad", "unidades", "unidad", "u"],
  categoria: ["categoria", "rubro", "grupo"],
  tipo: ["tipo", "medida"],
  precio: ["precio", "preciounitario", "punitario", "punit", "valorunitario"],
};

function pickHeaderKey(h) {
  const hn = norm(h);
  for (const key of Object.keys(headerMap)) {
    if (headerMap[key].some(alias => hn === alias)) return key;
  }
  return null;
}

function sheetToObjects(ws) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  if (!rows.length) return [];
  const heads = rows[0];
  const idx = {}; // key -> col index
  heads.forEach((h, i) => {
    const k = pickHeaderKey(h);
    if (k && !(k in idx)) idx[k] = i;
  });
  const out = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] || [];
    out.push({
      producto: row[idx.producto] ?? "",
      kg: row[idx.kg] ?? "",
      cantidad: row[idx.cantidad] ?? "",
      categoria: row[idx.categoria] ?? "",
      tipo: row[idx.tipo] ?? "",
      precio: row[idx.precio] ?? "",
      _row: r + 1,
    });
  }
  return out;
}

function deduceTipo({ kg, cantidad, tipo }) {
  const t = String(tipo || "").toLowerCase();
  if (t === "kg" || t === "unidad" || t === "unidades") {
    return t === "unidades" ? "unidad" : t;
  }
  const k = Number(kg || 0);
  const u = Number(cantidad || 0);
  if (u > 0 && k === 0) return "unidad";
  return "kg";
}

export function importarIngresosExcel(file, cb) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const wb = XLSX.read(reader.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = sheetToObjects(ws);
      const errores = [];
      const rows = [];

      raw.forEach((r) => {
        const producto = String(r.producto || "").trim();
        const kg = Number(r.kg || 0);
        const cantidad = Number(r.cantidad || 0);
        const categoria = String(r.categoria || "").trim();
        const precio = Number(r.precio || 0);
        const tipo = deduceTipo(r);

        if (!producto || (kg <= 0 && cantidad <= 0)) {
          errores.push(`Fila ${r._row}: datos incompletos (Producto y Kg/Cantidad).`);
          return;
        }

        rows.push({ producto, kg, cantidad, categoria, tipo, precio });
      });

      cb(rows, errores);
    } catch (e) {
      cb([], [`Error leyendo Excel: ${e?.message || e}`]);
    }
  };
  reader.readAsBinaryString(file);
}

export function importarEgresosExcel(file, cb) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const wb = XLSX.read(reader.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = sheetToObjects(ws);
      const errores = [];
      const rows = [];

      raw.forEach((r) => {
        const producto = String(r.producto || "").trim();
        const kg = Number(r.kg || 0);
        const cantidad = Number(r.cantidad || 0);
        if (!producto || (kg <= 0 && cantidad <= 0)) {
          errores.push(`Fila ${r._row}: datos incompletos (Producto y Kg/Cantidad).`);
          return;
        }
        rows.push({ producto, kg, cantidad });
      });

      cb(rows, errores);
    } catch (e) {
      cb([], [`Error leyendo Excel: ${e?.message || e}`]);
    }
  };
  reader.readAsBinaryString(file);
}
