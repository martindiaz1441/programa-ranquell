import React, { useState } from "react";
import { getHistorial } from "../services/dataService";
import { exportarHistorialExcel, importarHistorialExcel } from "../utils/excelUtils";
import { useNavigate } from "react-router-dom";

export default function Historial() {
  const navigate = useNavigate();
  const [historial, setHistorial] = useState(getHistorial());
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState("");

  const handleExport = () => {
    exportarHistorialExcel(historial);
    setMsg("Historial exportado a Excel");
    setTimeout(() => setMsg(""), 2000);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      importarHistorialExcel(file, (data) => {
        setHistorial([...historial, ...data]);
        setMsg("Historial importado correctamente");
        setTimeout(() => setMsg(""), 2000);
      });
    }
  };

  return (
    <div className="app-container">
      <header className="header">Historial</header>
      <nav className="menu">
        <button onClick={() => navigate("/")}>Menú principal</button>
        <button onClick={handleExport}>Exportar Excel</button>
        <label style={{ background: "#15703e", color: "#fff", padding: "10px 16px", borderRadius: 5, cursor: "pointer" }}>
          Importar Excel
          <input type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={handleImport} />
        </label>
      </nav>
      <div className="content">
        <h2>Jornadas previas</h2>
        <table className="table-excel">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Ver detalle</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((j, i) => (
              <tr key={i}>
                <td>{j.fecha}</td>
                <td>{j.usuario}</td>
                <td>
                  <button onClick={() => setSelected(i)}>Ver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selected !== null && (
          <DetalleJornada jornada={historial[selected]} onClose={() => setSelected(null)} />
        )}
        {msg && <div style={{ color: "green", marginTop: 12 }}>{msg}</div>}
      </div>
    </div>
  );
}

function DetalleJornada({ jornada, onClose }) {
  return (
    <div style={{
      background: "#fff",
      border: "2px solid #15703e",
      borderRadius: 8,
      padding: 24,
      maxWidth: 650,
      margin: "24px auto",
      boxShadow: "0 4px 24px #0002"
    }}>
      <h3>Detalle de jornada: {jornada.fecha} - {jornada.usuario}</h3>
      <h4>Producción</h4>
      <TablaDetalle columns={["Corte", "Kg", "Tara", "Unidades", "Kg Neto"]} data={jornada.produccion} />
      <h4>Ingresos</h4>
      <TablaDetalle columns={["Producto", "Cantidad", "Kg"]} data={jornada.ingresos} />
      <h4>Egresos</h4>
      <TablaDetalle columns={["Producto", "Cantidad", "Kg"]} data={jornada.egresos} />
      <button onClick={onClose} style={{ marginTop: 12 }}>Cerrar</button>
    </div>
  );
}

function TablaDetalle({ columns, data }) {
  return (
    <table className="table-excel" style={{ marginBottom: 16 }}>
      <thead>
        <tr>
          {columns.map(c => <th key={c}>{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {data && data.length
          ? data.map((fila, i) => (
              <tr key={i}>
                {columns.map(c => <td key={c}>{fila[c.toLowerCase()] || ""}</td>)}
              </tr>
            ))
          : <tr><td colSpan={columns.length}>Sin datos</td></tr>}
      </tbody>
    </table>
  );
}
