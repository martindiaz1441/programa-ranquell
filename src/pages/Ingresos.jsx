// src/pages/Ingresos.jsx
import React, { useState } from "react";
import { getCurrentUser } from "../services/authService";
import { getIngresos, setIngresos, getStock, setStock, addToStock } from "../services/dataService";
import { useNavigate } from "react-router-dom";
import AutoCompleteInput from "../components/AutoCompleteInput";

export default function Ingresos() {
  const navigate = useNavigate();
  const user = getCurrentUser() || { nombre: "Usuario" };
  const [filas, setFilas] = useState(getIngresos());
  const [mensaje, setMensaje] = useState("");

  const handleChange = (i, key, value) => {
    const nuevo = filas.map((f, idx) => idx === i ? { ...f, [key]: value } : f);
    setFilas(nuevo); setIngresos(nuevo);
  };

  const handleAdd = () => setFilas([...filas, { producto: "", cantidad: "", kg: "" }]); // vacío
  const handleRemove = (i) => {
    const nuevo = filas.filter((_, idx) => idx !== i);
    setFilas(nuevo); setIngresos(nuevo);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!filas.length) return msg("Debe ingresar al menos un producto");
    filas.forEach(item => {
      if (!item.producto) return;
      addToStock(item.producto, Number(item.kg || 0), Number(item.cantidad || 0), user.nombre);
    });
    setStock(getStock());
    setFilas([]); setIngresos([]);
    msg("Ingresos guardados y stock actualizado. La tabla se limpió.");
  };

  function msg(t){ setMensaje(t); setTimeout(()=> setMensaje(""), 3000); }

  return (
    <div className="app-container">
      <header className="header">Ingresos</header>
      <nav className="menu">
        <button onClick={() => navigate("/")}>Menú principal</button>
        <button onClick={() => navigate("/stock")}>Ver stock</button>
        <button onClick={() => navigate("/historial")}>Historial</button>
      </nav>

      <div className="content">
        <h2>Registrar ingresos de productos</h2>
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
            <button type="submit" style={{ marginLeft: 12 }}>Guardar ingresos</button>
            {mensaje && <span style={{ color: "green", marginLeft: 24 }}>{mensaje}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
