// src/utils/excelUtils.js
// Utilidades con XLSX para exportar/importar y ahora importar EGRESOS masivos.
import * as XLSX from "xlsx";

// Export historial (lo que ya tenías)
export function exportarHistorialExcel(historial) {
  const wb = XLSX.utils.book_new();

  const wsData = historial.map(h => ({
    Fecha: h.fecha,
    Usuario: h.usuario,
    ProduccionFilas: h?.produccion?.length || 0,
    IngresosFilas: h?.ingresos?.length || 0,
    EgresosFilas: h?.egresos?.length || 0
  }));
  const ws = XLSX.utils.json_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, "Historial");

  XLSX.writeFile(wb, `historial_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// Import historial (lo que ya tenías)
export function importarHistorialExcel(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const wb = XLSX.read(data, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws);
    // Esto es solo un ejemplo básico; tu app después decide cómo lo inserta.
    callback(json.map((r) => ({
      fecha: r.Fecha || "",
      usuario: r.Usuario || "",
      produccion: [],
      ingresos: [],
      egresos: []
    })));
  };
  reader.readAsArrayBuffer(file);
}

// NUEVO: importar egresos para descontar stock
// Formato esperado de columnas (flexible en nombres):
// "producto" | "Producto", "cantidad" | "Cantidad", "kg" | "Kg"
export function importarEgresosExcel(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const wb = XLSX.read(data, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    let rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

    // Normalizamos keys
    rows = rows.map(r => {
      const obj = {};
      Object.keys(r).forEach(k => {
        const nk = k.toString().trim().toLowerCase();
        obj[nk] = r[k];
      });
      return {
        producto: obj["producto"] ?? obj["product"] ?? "",
        cantidad: Number(obj["cantidad"] ?? obj["cant"] ?? 0),
        kg: Number(obj["kg"] ?? obj["kilos"] ?? 0)
      };
    });

    callback(rows);
  };
  reader.readAsArrayBuffer(file);
}
