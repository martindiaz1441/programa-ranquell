// src/pages/Egresos.jsx
import React, { useState } from "react";
import { getCurrentUser } from "../services/authService";
import { getEgresos, setEgresos, getStock, setStock, removeFromStock } from "../services/dataService";
import { useNavigate } from "react-router-dom";
import { importarEgresosExcel } from "../utils/excelUtils";
import AutoCompleteInput from "../components/AutoCompleteInput";

export default function Egresos() {
  const navigate = useNavigate();
  const user = getCurrentUser() || { nombre: "Usuario" };
  const [filas, setFilas] = useState(getEgresos());
  const [mensaje, setMensaje] = useState("");
  const [resumen, setResumen] = useState(null);

  const handleChange = (i, key, value) => {
    const nuevo = filas.map((f, idx) => idx === i ? { ...f, [key]: value } : f);
    setFilas(nuevo); setEgresos(nuevo);
  };

  const handleAdd = () => setFilas([...filas, { producto: "", cantidad: "", kg: "" }]); // vacío
  const handleRemove = (i) => {
    const nuevo = filas.filter((_, idx) => idx !== i);
    setFilas(nuevo); setEgresos(nuevo);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!filas.length) return msg("Debe ingresar al menos un producto");
    const res = [];
    filas.forEach(item => {
      if (!item.producto) return;
      removeFromStock(item.producto, Number(item.kg || 0), Number(item.cantidad || 0), user.nombre);
      res.push({ ...item });
    });
    setStock(getStock());
    setFilas([]); setEgresos([]);
    setResumen({ origen: "Formulario", filas: res });
    msg("Egresos guardados y stock actualizado. La tabla se limpió.");
  };

  const onImportExcel = (file) => {
    importarEgresosExcel(file, (rows) => {
      const res = [];
      rows.forEach(r => {
        if (!r.producto) return;
        removeFromStock(r.producto, Number(r.kg || 0), Number(r.cantidad || 0), user.nombre);
        res.push(r);
      });
      setStock(getStock());
      setResumen({ origen: "Excel", filas: res });
      msg(`Se procesaron ${res.length} egresos desde Excel.`);
    });
  };

  function msg(t){ setMensaje(t); setTimeout(()=> setMensaje(""), 4000); }

  return (
    <div className="app-container">
      <header className="header">Egresos</header>
      <nav className="menu">
        <button onClick={() => navigate("/")}>Menú principal</button>
        <button onClick={() => navigate("/stock")}>Ver stock</button>
        <button onClick={() => navigate("/historial")}>Historial</button>
        <label style={{ background: "#15703e", color: "#fff", padding: "10px 16px", borderRadius: 5, cursor: "pointer" }}>
          Importar Excel
          <input type="file" accept=".xlsx,.xls" style={{ display: "none" }}
                 onChange={(e)=> e.target.files?.[0] && onImportExcel(e.target.files[0])} />
        </label>
      </nav>

      <div className="content">
        <h2>Registrar egresos de productos</h2>
        <form onSubmit={handleSubmit}>
          <table className="table-excel">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Kg</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, i) => (
                <tr key={i}>
                  <td>
                    <AutoCompleteInput
                      value={fila.producto}
                      onChange={(v)=> handleChange(i, "producto", v)}
                      placeholder="Buscar producto…"
                    />
                  </td>
                  <td>
                    <input type="number" min="0" value={fila.cantidad}
                      onChange={e => handleChange(i, "cantidad", e.target.value)} />
                  </td>
                  <td>
                    <input type="number" min="0" value={fila.kg}
                      onChange={e => handleChange(i, "kg", e.target.value)} />
                  </td>
                  <td>
                    <button type="button" onClick={() => handleRemove(i)} style={{ background: "#bb2124" }}>X</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 16 }}>
            <button type="button" onClick={handleAdd}>Agregar producto</button>
            <button type="submit" style={{ marginLeft: 12 }}>Guardar egresos</button>
            {mensaje && <span style={{ color: "green", marginLeft: 24 }}>{mensaje}</span>}
          </div>
        </form>

        {resumen && (
          <div style={{ marginTop: 16, border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Resumen ({resumen.origen})</h3>
            <table className="table-excel">
              <thead><tr><th>Producto</th><th>Cantidad</th><th>Kg</th></tr></thead>
              <tbody>
                {resumen.filas.map((r, idx)=>(
                  <tr key={idx}>
                    <td>{r.producto}</td>
                    <td>{r.cantidad || 0}</td>
                    <td>{r.kg || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
