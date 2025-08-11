import React, { useState } from "react";
import { getHistorial, setHistorial as setHist, clearHistorial, removeJornadaByIndex } from "../services/dataService";
import { exportarHistorialExcel, importarHistorialExcel } from "../utils/excelUtils";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "../services/authService";

export default function Historial() {
  const navigate = useNavigate();
  const [historialState, setHistorialState] = useState(getHistorial());
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState("");

  const handleExport = () => {
    exportarHistorialExcel(historialState);
    setMsg("Historial exportado a Excel");
    setTimeout(() => setMsg(""), 2000);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      importarHistorialExcel(file, (data) => {
        const nuevo = [...historialState, ...data];
        setHist(nuevo); // persistencia
        setHistorialState(nuevo);
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
        {isAdmin() && (
          <button
            style={{ background: "#bb2124" }}
            onClick={() => {
              if (confirm("¿Seguro que querés borrar TODO el historial? Esta acción no se puede deshacer.")) {
                clearHistorial();
                setHistorialState([]);
                setMsg("Historial borrado por completo");
                setTimeout(() => setMsg(""), 2000);
                setSelected(null);
              }
            }}
          >
            Borrar TODO
          </button>
        )}
      </nav>
      <div className="content">
        <h2>Jornadas previas</h2>
        <table className="table-excel">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {historialState.map((j, i) => (
              <tr key={i}>
                <td>{j.fecha}</td>
                <td>{j.usuario}</td>
                <td>
                  <button onClick={() => setSelected(i)}>Ver</button>
                  {isAdmin() && (
                    <button
                      style={{ background: "#bb2124", marginLeft: 8 }}
                      onClick={() => {
                        if (confirm("¿Borrar esta jornada? No se puede deshacer.")) {
                          const nuevo = removeJornadaByIndex(i);
                          setHistorialState(nuevo);
                          setMsg("Jornada eliminada");
                          setTimeout(() => setMsg(""), 2000);
                          if (selected === i) setSelected(null);
                        }
                      }}
                    >
                      Borrar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selected !== null && (
          <DetalleJornada jornada={historialState[selected]} onClose={() => setSelected(null)} />
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
