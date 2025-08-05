import React, { useState } from "react";
import { getStock, setStock } from "../services/dataService";
import { getCurrentUser, isAdmin } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function Stock() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [data, setData] = useState(getStock());
  const [filtro, setFiltro] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleEdit = (i, key, value) => {
    const nuevo = data.map((item, idx) => idx === i ? { ...item, [key]: value } : item);
    setData(nuevo);
    setStock(nuevo);
    setMensaje("Stock editado");
    setTimeout(() => setMensaje(""), 1200);
  };

  const productos = filtro
    ? data.filter(p => p.producto.toLowerCase().includes(filtro.toLowerCase()))
    : data;

  const totalKg = productos.reduce((a, b) => a + Number(b.kg || 0), 0);
  const totalU = productos.reduce((a, b) => a + Number(b.unidades || 0), 0);

  return (
    <div className="app-container">
      <header className="header">Stock</header>
      <nav className="menu">
        <button onClick={() => navigate("/")}>Menú principal</button>
        <button onClick={() => navigate("/historial")}>Historial</button>
      </nav>
      <div className="content">
        <h2>Stock actual de productos</h2>
        <div>
          <input
            type="text"
            placeholder="Filtrar por producto"
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            style={{ maxWidth: 200 }}
          />
        </div>
        <table className="table-excel" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Kg</th>
              <th>Unidades</th>
              {isAdmin() && <th>Editar</th>}
            </tr>
          </thead>
          <tbody>
            {productos.map((item, i) => (
              <tr key={i}>
                <td>{item.producto}</td>
                <td>
                  {isAdmin() ? (
                    <input
                      type="number"
                      value={item.kg}
                      onChange={e => handleEdit(i, "kg", e.target.value)}
                    />
                  ) : (
                    item.kg
                  )}
                </td>
                <td>
                  {isAdmin() ? (
                    <input
                      type="number"
                      value={item.unidades}
                      onChange={e => handleEdit(i, "unidades", e.target.value)}
                    />
                  ) : (
                    item.unidades
                  )}
                </td>
                {isAdmin() && (
                  <td style={{ color: "#888", fontSize: 13 }}>Editable</td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#e0e0e0", fontWeight: "bold" }}>
              <td>Total</td>
              <td>{totalKg}</td>
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
