// src/pages/Produccion.jsx
import React, { useState } from "react";
import { getCurrentUser } from "../services/authService";
import {
  getProduccion, setProduccion,
  getStock, setStock,
  addToStock, despostarProducto, ORIGENES_DESPOSTE
} from "../services/dataService";
import { useNavigate } from "react-router-dom";
import AutoCompleteInput from "../components/AutoCompleteInput";

export default function Produccion() {
  const navigate = useNavigate();
  const user = getCurrentUser() || { nombre: "Usuario" };
  const [filas, setFilas] = useState(getProduccion());
  const [desposte, setDesposte] = useState({ origen: "", kg: "", unidades: "" });
  const [mensaje, setMensaje] = useState("");

  const handleChange = (i, key, value) => {
    const nuevo = filas.map((f, idx) =>
      idx === i ? { ...f, [key]: value, kgNeto: calcKgNeto(key==="kg"?value:f.kg, key==="tara"?value:f.tara) } : f
    );
    setFilas(nuevo);
    setProduccion(nuevo);
  };

  function calcKgNeto(kg, tara) {
    const k = Number(kg || 0);
    const t = Number(tara || 0);
    return k - t >= 0 ? (k - t).toFixed(2) : "";
  }

  const handleAdd = () => {
    setFilas([...filas, { corte: "", kg: "", tara: "", unidades: "", kgNeto: "" }]); // corte en BLANCO
  };

  const handleRemove = (i) => {
    const nuevo = filas.filter((_, idx) => idx !== i);
    setFilas(nuevo);
    setProduccion(nuevo);
  };

  const handleGuardarProduccion = (e) => {
    e.preventDefault();
    if (!filas.length) return msg("Debe ingresar al menos un corte");
    filas.forEach(item => {
      if (!item.corte) return; // no sumar si no completó
      addToStock(item.corte, Number(item.kgNeto || 0), Number(item.unidades || 0), user.nombre);
    });
    setStock(getStock());
    setFilas([]); setProduccion([]);
    msg("Producción guardada y stock actualizado. La tabla se limpió.");
  };

  // DESPOSTE: descuenta solo origen (kg y/o unidades)
  const ejecutarDesposte = () => {
    const origen = desposte.origen.trim();
    const kg = Number(desposte.kg || 0);
    const u  = Number(desposte.unidades || 0);
    if (!origen) return msg("Elegí el producto origen de desposte.");
    if (!ORIGENES_DESPOSTE.includes(origen)) return msg("Ese origen no está habilitado para desposte.");
    if (kg <= 0 && u <= 0) return msg("Ingresá kg y/o unidades a despostar.");

    const res = despostarProducto(origen, kg, u, user.nombre);
    if (res?.error) return msg(res.error);

    setDesposte({ origen: "", kg: "", unidades: "" });
    msg(`Desposte: descontados ${kg>0?kg+" kg":""}${kg>0 && u>0?" y ":""}${u>0?u+" un.":""} de "${origen}".`);
  };

  function msg(t){ setMensaje(t); setTimeout(()=> setMensaje(""), 3000); }

  return (
    <div className="app-container">
      <header className="header">Producción</header>
      <nav className="menu">
        <button onClick={() => navigate("/")}>Menú principal</button>
        <button onClick={() => navigate("/stock")}>Ver stock</button>
        <button onClick={() => navigate("/historial")}>Historial</button>
      </nav>

      <div className="content">
        {/* BLOQUE DESPOSTE */}
        <div style={{ border: "1px solid #e5e7eb", padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Desposte (solo descuenta del stock)</h3>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <AutoCompleteInput
              value={desposte.origen}
              onChange={(v)=> setDesposte(d => ({ ...d, origen: v }))}
              placeholder={`Origen (ej: ${ORIGENES_DESPOSTE[0]})`}
            />
            <input
              type="number" min="0" step="0.01" placeholder="Kg a descontar"
              value={desposte.kg}
              onChange={(e)=> setDesposte(d => ({ ...d, kg: e.target.value }))}
              style={{ width: 160, padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: 6 }}
            />
            <input
              type="number" min="0" step="1" placeholder="Unidades a descontar (opcional)"
              value={desposte.unidades}
              onChange={(e)=> setDesposte(d => ({ ...d, unidades: e.target.value }))}
              style={{ width: 220, padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: 6 }}
            />
            <button onClick={ejecutarDesposte}>Despostar</button>
            <span style={{ color: "#6b7280", fontSize: 13 }}>
              Orígenes: {ORIGENES_DESPOSTE.join(", ")}
            </span>
          </div>
        </div>

        {/* PRODUCCIÓN MANUAL */}
        <h2 style={{ marginTop: 0 }}>Ingreso de producción diaria</h2>
        <form onSubmit={handleGuardarProduccion}>
          <table className="table-excel">
            <thead>
              <tr>
                <th>Producto / Corte</th>
                <th>Kg</th>
                <th>Tara</th>
                <th>Unidades</th>
                <th>Kg Neto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, i) => (
                <tr key={i}>
                  <td>
                    <AutoCompleteInput
                      value={fila.corte}
                      onChange={(v)=> handleChange(i, "corte", v)}
                      placeholder="Elegí / buscá un corte…"
                    />
                  </td>
                  <td>
                    <input type="number" min="0" value={fila.kg}
                      onChange={e => handleChange(i, "kg", e.target.value)} required />
                  </td>
                  <td>
                    <input type="number" min="0" value={fila.tara}
                      onChange={e => handleChange(i, "tara", e.target.value)} required />
                  </td>
                  <td>
                    <input type="number" min="0" value={fila.unidades}
                      onChange={e => handleChange(i, "unidades", e.target.value)} />
                  </td>
                  <td>
                    <input type="number" value={fila.kgNeto} readOnly tabIndex={-1} style={{ background: "#f6f6f6" }} />
                  </td>
                  <td>
                    <button type="button" onClick={() => handleRemove(i)} style={{ background: "#bb2124" }}>X</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 16 }}>
            <button type="button" onClick={handleAdd}>Agregar fila</button>
            <button type="submit" style={{ marginLeft: 12 }}>Guardar producción</button>
            {mensaje && <span style={{ color: "green", marginLeft: 24 }}>{mensaje}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
