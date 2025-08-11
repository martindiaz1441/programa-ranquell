// src/pages/Stock.jsx
import React, { useState } from "react";
import { getStock, setStock } from "../services/dataService";
import { getCurrentUser, isAdmin } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function Stock() {
  const navigate = useNavigate();
  const user = getCurrentUser() || { nombre: "Usuario" };
  const [data, setData] = useState(getStock());
  const [filtro, setFiltro] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Edita nombre (texto) o campos numéricos (kg, unidades)
  const handleEdit = (i, key, value) => {
    const nuevo = data.map((item, idx) => {
      if (idx !== i) return item;
      return {
        ...item,
        [key]: key === "producto" ? (value || "") : Number(value || 0),
      };
    });
    setData(nuevo);
    setStock(nuevo);
    flash("Stock editado");
  };

  const addProducto = () => {
    if (!isAdmin()) return;
    const nuevo = [...data, { producto: "", kg: 0, unidades: 0 }];
    setData(nuevo);
    setStock(nuevo);
    flash("Producto agregado");
  };

  const removeProducto = (i) => {
    if (!isAdmin()) return;
    const item = data[i];
    if (!confirm(`¿Eliminar "${item.producto || "producto"}" del stock?`)) return;
    const nuevo = data.filter((_, idx) => idx !== i);
    setData(nuevo);
    setStock(nuevo);
    flash("Producto eliminado");
  };

  const flash = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 1200);
  };

  const productos = filtro
    ? data.filter((p) =>
        (p.producto || "").toLowerCase().includes((filtro || "").toLowerCase())
      )
    : data;

  const totalKg = productos.reduce((a, b) => a + Number(b.kg || 0), 0);
  const totalU = productos.reduce((a, b) => a + Number(b.unidades || 0), 0);

  return (
    <div className="app-container">
      <header className="header">Stock</header>
      <nav className="menu">
        <button onClick={() => navigate("/")}>Menú principal</button>
        <button onClick={() => navigate("/historial")}>Historial</button>
        {isAdmin() && <button onClick={addProducto}>Agregar producto</button>}
      </nav>

      <div className="content">
        <h2>Stock actual de productos</h2>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            placeholder="Filtrar por producto"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{ maxWidth: 260 }}
          />
          <span style={{ color: "#6b7280", fontSize: 13 }}>
            {productos.length} ítems • {totalKg.toFixed(2)} kg • {totalU} u.
          </span>
        </div>

        <table className="table-excel" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Kg</th>
              <th>Unidades</th>
              {isAdmin() && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {productos.map((item, i) => (
              <tr key={i}>
                <td>
                  {isAdmin() ? (
                    <input
                      type="text"
                      value={item.producto || ""}
                      onChange={(e) => handleEdit(i, "producto", e.target.value)}
                      placeholder="Nombre del producto"
                    />
                  ) : (
                    item.producto
                  )}
                </td>
                <td>
                  {isAdmin() ? (
                    <input
                      type="number"
                      step="0.01"
                      value={Number(item.kg || 0)}
                      onChange={(e) => handleEdit(i, "kg", e.target.value)}
                    />
                  ) : (
                    Number(item.kg || 0).toFixed(2)
                  )}
                </td>
                <td>
                  {isAdmin() ? (
                    <input
                      type="number"
                      value={Number(item.unidades || 0)}
                      onChange={(e) => handleEdit(i, "unidades", e.target.value)}
                    />
                  ) : (
                    Number(item.unidades || 0)
                  )}
                </td>
                {isAdmin() && (
                  <td>
                    <button
                      style={{ background: "#bb2124" }}
                      onClick={() => removeProducto(i)}
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#e0e0e0", fontWeight: "bold" }}>
              <td>Total</td>
              <td>{totalKg.toFixed(2)}</td>
              <td>{totalU}</td>
              {isAdmin() && <td></td>}
            </tr>
          </tfoot>
        </table>

        {mensaje && <div style={{ color: "green", marginTop: 10 }}>{mensaje}</div>}
      </div>
    </div>
  );
}
