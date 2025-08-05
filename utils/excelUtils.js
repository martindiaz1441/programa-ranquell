// excelUtils.js
import * as XLSX from "xlsx";

export function exportarHistorialExcel(historial) {
  const wb = XLSX.utils.book_new();

  historial.forEach((jornada, i) => {
    // Por cada jornada, creamos una hoja
    const wsData = [];
    wsData.push(["FECHA", jornada.fecha]);
    wsData.push(["USUARIO", jornada.usuario]);
    wsData.push([]);
    wsData.push(["Producción"]);
    wsData.push([
      "Corte",
      "Kg",
      "Tara",
      "Unidades",
      "Kg Neto"
    ]);
    jornada.produccion.forEach((item) => {
      wsData.push([
        item.corte,
        item.kg,
        item.tara,
        item.unidades,
        item.kgNeto
      ]);
    });
    wsData.push([]);
    wsData.push(["Ingresos"]);
    wsData.push([
      "Producto",
      "Cantidad",
      "Kg"
    ]);
    jornada.ingresos.forEach((item) => {
      wsData.push([item.producto, item.cantidad, item.kg]);
    });
    wsData.push([]);
    wsData.push(["Egresos"]);
    wsData.push([
      "Producto",
      "Cantidad",
      "Kg"
    ]);
    jornada.egresos.forEach((item) => {
      wsData.push([item.producto, item.cantidad, item.kg]);
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, `Jornada ${i + 1}`);
  });

  XLSX.writeFile(wb, "Historial_Ranquel.xlsx");
}

// Importar desde Excel (solo una jornada por hoja)
export function importarHistorialExcel(file, onFinish) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const historial = [];
    workbook.SheetNames.forEach((name) => {
      const ws = workbook.Sheets[name];
      const json = XLSX.utils.sheet_to_json(ws, { header: 1 });

      // Básico: parsear producción/ingresos/egresos
      let fecha = "";
      let usuario = "";
      let seccion = "";
      const produccion = [];
      const ingresos = [];
      const egresos = [];

      json.forEach((row) => {
        if (row[0] === "FECHA") fecha = row[1];
        if (row[0] === "USUARIO") usuario = row[1];
        if (row[0] === "Producción") seccion = "produccion";
        if (row[0] === "Ingresos") seccion = "ingresos";
        if (row[0] === "Egresos") seccion = "egresos";
        if (seccion === "produccion" && row[0] && row[0] !== "Corte" && row[0] !== "Producción") {
          produccion.push({
            corte: row[0],
            kg: row[1],
            tara: row[2],
            unidades: row[3],
            kgNeto: row[4],
          });
        }
        if (seccion === "ingresos" && row[0] && row[0] !== "Producto" && row[0] !== "Ingresos") {
          ingresos.push({
            producto: row[0],
            cantidad: row[1],
            kg: row[2],
          });
        }
        if (seccion === "egresos" && row[0] && row[0] !== "Producto" && row[0] !== "Egresos") {
          egresos.push({
            producto: row[0],
            cantidad: row[1],
            kg: row[2],
          });
        }
      });

      if (fecha) {
        historial.push({
          fecha,
          usuario,
          produccion,
          ingresos,
          egresos,
        });
      }
    });
    onFinish(historial);
  };
  reader.readAsArrayBuffer(file);
}
