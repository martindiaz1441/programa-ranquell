// src/pages/Historial.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeHistorial } from "../services/dataService";
import { isAdmin } from "../services/authService";
import { exportarHistorialExcel } from "../utils/excelUtils";

export default function Historial() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]); // {id, tipo, cantidadRegistros, fecha(Timestamp), usuario}
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const off = subscribeHistorial((rows) => setItems(rows || []));
    return () => { if (typeof off === "function") off(); };
  }, []);

  const parsed = useMemo(() => {
    return (items || []).map(d => {
      let fechaStr = "";
      try {
        const ts = d.fecha?.toDate ? d.fecha.toDate() : (d.fecha? new Date(d.fecha): null);
        fechaStr = ts ? ts.toLocaleString("es-AR") : "";
      } catch { fechaStr = ""; }
      return { ...d, _fechaStr: fechaStr };
    });
  }, [items]);

  const handleExport = () => {
    const data = parsed.map(x => ({
      fecha: x._fechaStr,
      usuario: x.usuario || "",
      tipo: x.tipo || "",
      cantidad: x.cantidadRegistros || 0
    }));
    try {
      exportarHistorialExcel(data);
      setMsg("Historial exportado a Excel");
      setTimeout(() => setMsg(""), 2000);
    } catch {
      setMsg("No se pudo exportar");
      setTimeout(() => setMsg(""), 2000);
    }
  };

  return (
    <div className="app-container">
      <header className="header">Historial</header>
      <nav className="menu">
        <button onClick={() => navigate("/")}>Menú principal</button>
        <button onClick={handleExport}>Exportar Excel</button>
        {isAdmin() && <span style={{marginLeft:12, color:"#6b7280"}}>(Edición/borrado deshabilitado)</span>}
      </nav>

      <div className="content">
        <h2>Movimientos recientes</h2>
        <table className="table-excel">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Tipo</th>
              <th>Registros</th>
            </tr>
          </thead>
          <tbody>
            {parsed.map((j) => (
              <tr key={j.id}>
                <td>{j._fechaStr}</td>
                <td>{j.usuario || ""}</td>
                <td>{j.tipo || ""}</td>
                <td>{j.cantidadRegistros || 0}</td>
              </tr>
            ))}
            {!parsed.length && (<tr><td colSpan={4} style={{textAlign:"center", color:"#6b7280"}}>Sin datos</td></tr>)}
          </tbody>
        </table>
        {msg && <div style={{ color: "green", marginTop: 12 }}>{msg}</div>}
      </div>
    </div>
  );
}
