import React, { useState } from "react";
import { getCurrentUser } from "../services/authService";
import { getEgresos, setEgresos, getStock, setStock } from "../services/dataService";
import { useNavigate } from "react-router-dom";

export default function Egresos() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [filas, setFilas] = useState(getEgresos());
  const [mensaje, setMensaje] = useState("");

  const handleChange = (i, key, value) => {
    const nuevo = filas.map((f, idx) => idx === i ? { ...f, [key]: value } : f);
    setFilas(nuevo);
    setEgresos(nuevo);
  };

  const handleAdd = () => {
    setFilas([...filas, { producto: "", cantidad: "", kg: "" }]);
  };

  const handleRemove = (i) => {
    const nuevo = filas.filter((_, idx) => idx !== i);
    setFilas(nuevo);
    setEgresos(nuevo);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!filas.length) {
      setMensaje("Debe ingresar al menos un producto");
      return;
    }
    let stock = getStock();
    filas.forEach(item => {
      if (!item.producto) return;
      const idx = stock.findIndex(s => s.producto === item.producto);
      if (idx >= 0) {
        stock[idx].kg = Number(stock[idx].kg) - Number(item.kg || 0);
        stock[idx].unidades = Number(stock[idx].unidades) - Number(item.cantidad || 0);
      } else {
        stock.push({
          producto: item.producto,
          kg: -Number(item.kg || 0),
          unidades: -Number(item.cantidad || 0)
        });
      }
    });
    setStock(stock);
    setFilas([]);
    setEgresos([]);
    setMensaje("Egresos guardados y stock actualizado. La tabla se limpió.");
    setTimeout(() => setMensaje(""), 3000);
  };

  return (
    <div className="app-container">
      <header className="header">Egresos</header>
      <nav className="menu">
        <button onClick={() => navigate("/")}>Menú principal</button>
        <button onClick={() => navigate("/stock")}>Ver stock</button>
        <button onClick={() => navigate("/historial")}>Historial</button>
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
                    <input
                      type="text"
                      value={fila.producto}
                      onChange={e => handleChange(i, "producto", e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={fila.cantidad}
                      onChange={e => handleChange(i, "cantidad", e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={fila.kg}
                      onChange={e => handleChange(i, "kg", e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => handleRemove(i)} style={{ background: "#bb2124" }}>
                      X
                    </button>
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
      </div>
    </div>
  );
}
