import React, { useState } from "react";
import { getCurrentUser } from "../services/authService";
import { getProduccion, setProduccion, getStock, setStock } from "../services/dataService";
import { useNavigate } from "react-router-dom";

const cortes = [
  "Suprema", "Cogote", "Alitas", "Grasa", "Molleja", "Carcasa",
  "Hígado", "Corazón", "Piel", "Desecho"
];

export default function Produccion() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [filas, setFilas] = useState(getProduccion());
  const [mensaje, setMensaje] = useState("");

  const handleChange = (i, key, value) => {
    const nuevo = filas.map((f, idx) =>
      idx === i ? { ...f, [key]: value, kgNeto: calcKgNeto(f.kg, f.tara, key, value) } : f
    );
    setFilas(nuevo);
    setProduccion(nuevo);
  };

  function calcKgNeto(kg, tara, key, value) {
    const k = key === "kg" ? Number(value) : Number(kg || 0);
    const t = key === "tara" ? Number(value) : Number(tara || 0);
    return k - t >= 0 ? (k - t).toFixed(2) : "";
  }

  const handleAdd = () => {
    setFilas([
      ...filas,
      { corte: cortes[0], kg: "", tara: "", unidades: "", kgNeto: "" }
    ]);
  };

  const handleRemove = (i) => {
    const nuevo = filas.filter((_, idx) => idx !== i);
    setFilas(nuevo);
    setProduccion(nuevo);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!filas.length) {
      setMensaje("Debe ingresar al menos un corte");
      return;
    }
    // Actualizar stock
    let stock = getStock();
    filas.forEach(item => {
      if (!item.corte) return;
      const idx = stock.findIndex(s => s.producto === item.corte);
      if (idx >= 0) {
        stock[idx].kg = Number(stock[idx].kg) + Number(item.kgNeto || 0);
        stock[idx].unidades = Number(stock[idx].unidades) + Number(item.unidades || 0);
      } else {
        stock.push({
          producto: item.corte,
          kg: Number(item.kgNeto || 0),
          unidades: Number(item.unidades || 0)
        });
      }
    });
    setStock(stock);
    setFilas([]);
    setProduccion([]);
    setMensaje("Producción guardada y stock actualizado. La tabla se limpió.");
    setTimeout(() => setMensaje(""), 3000);
  };

  return (
    <div className="app-container">
      <header className="header">Producción</header>
      <nav className="menu">
        <button onClick={() => navigate("/")}>Menú principal</button>
        <button onClick={() => navigate("/stock")}>Ver stock</button>
        <button onClick={() => navigate("/historial")}>Historial</button>
      </nav>
      <div className="content">
        <h2>Ingreso de producción diaria</h2>
        <form onSubmit={handleSubmit}>
          <table className="table-excel">
            <thead>
              <tr>
                <th>Corte</th>
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
                    <select
                      value={fila.corte}
                      onChange={e => handleChange(i, "corte", e.target.value)}
                    >
                      {cortes.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
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
                    <input
                      type="number"
                      min="0"
                      value={fila.tara}
                      onChange={e => handleChange(i, "tara", e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={fila.unidades}
                      onChange={e => handleChange(i, "unidades", e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={fila.kgNeto}
                      readOnly
                      tabIndex={-1}
                      style={{ background: "#f6f6f6" }}
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
            <button type="button" onClick={handleAdd}>Agregar corte</button>
            <button type="submit" style={{ marginLeft: 12 }}>Guardar producción</button>
            {mensaje && <span style={{ color: "green", marginLeft: 24 }}>{mensaje}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
