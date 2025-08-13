// src/pages/Produccion.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AutoCompleteInput from "../components/AutoCompleteInput";
import { subscribeDraft, updateDraft, clearDraft, commitProduccion, commitEgresos } from "../services/dataService";
import { getCurrentUser } from "../services/authService";

const SUGERENCIAS_ORIGEN = [
  // Ej: "Media res", "Carcasa", "Entero", "Pechuga entera"
];

export default function Produccion() {
  const navigate = useNavigate();
  const user = (typeof getCurrentUser === "function" && getCurrentUser()) || { nombre: "Usuario" };
  const userNombre = user?.nombre || "Usuario";

  const [filas, setFilas] = useState([]);
  const [desposte, setDesposte] = useState({ origen: "", kg: "", unidades: "" });
  const [mensaje, setMensaje] = useState("");
  const msg = (t) => { setMensaje(t); setTimeout(() => setMensaje(""), 3000); };

  const calcKgNeto = (kg, tara) => {
    const k = Number(kg || 0);
    const t = Number(tara || 0);
    const neto = k - t;
    return neto >= 0 ? neto.toFixed(2) : "";
  };

  useEffect(() => {
    const off = subscribeDraft("produccion", (rows) => setFilas(Array.isArray(rows) ? rows : []));
    return () => { if (typeof off === "function") off(); };
  }, []);

  const handleChange = (i, key, value) => {
    const nuevo = filas.map((f, idx) =>
      idx === i
        ? { ...f, [key]: value, kgNeto: calcKgNeto(key === "kg" ? value : f.kg, key === "tara" ? value : f.tara) }
        : f
    );
    setFilas(nuevo);
    updateDraft("produccion", nuevo);
  };

  const handleAdd = () => {
    const nuevo = [...filas, { corte: "", kg: "", tara: "", unidades: "", kgNeto: "" }];
    setFilas(nuevo);
    updateDraft("produccion", nuevo);
  };

  const handleRemove = (i) => {
    const nuevo = filas.filter((_, idx) => idx !== i);
    setFilas(nuevo);
    updateDraft("produccion", nuevo);
  };

  const handleGuardarProduccion = async (e) => {
    e.preventDefault();
    if (!filas.length) return msg("Debe ingresar al menos un corte");

    const movimientos = filas
      .filter(item => item.corte && (Number(item.kgNeto || 0) > 0 || Number(item.unidades || 0) > 0))
      .map(item => ({
        nombre: item.corte,
        categoria: item.categoria || "",
        tipo: Number(item.unidades || 0) > 0 ? "unidad" : "kg",
        kg: Number(item.kgNeto || 0),
        unidades: Number(item.unidades || 0),
      }));

    if (!movimientos.length) return msg("No hay movimientos válidos para guardar.");

    try {
      await commitProduccion(movimientos, userNombre);
      await clearDraft("produccion");
      setFilas([]);
      msg("Producción guardada y stock actualizado. La tabla se limpió.");
    } catch (err) {
      console.error(err);
      msg("Error al guardar la producción.");
    }
  };

  const ejecutarDesposte = async () => {
    const origen = (desposte.origen || "").trim();
    const kg = Number(desposte.kg || 0);
    const u  = Number(desposte.unidades || 0);

    if (!origen) return msg("Elegí el producto origen de desposte.");
    if (kg <= 0 && u <= 0) return msg("Ingresá kg y/o unidades a despostar.");

    try {
      await commitEgresos(
        [{ nombre: origen, categoria: "", tipo: u > 0 ? "unidad" : "kg", kg, unidades: u, motivo: "desposte" }],
        userNombre
      );
      setDesposte({ origen: "", kg: "", unidades: "" });
      msg(`Desposte: descontados ${kg > 0 ? kg + " kg" : ""}${kg > 0 && u > 0 ? " y " : ""}${u > 0 ? u + " un." : ""} de "${origen}".`);
    } catch (err) {
      console.error(err);
      msg("Error al ejecutar el desposte.");
    }
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
        <div className="card">
          <h3 className="card-title">Desposte (solo descuenta del stock)</h3>

          <div className="form-row">
            <div className="form-col">
              <label>Origen</label>
              <AutoCompleteInput
                value={desposte.origen}
                onChange={(v)=> setDesposte(d => ({ ...d, origen: v }))}
                placeholder={SUGERENCIAS_ORIGEN[0] ? `Ej: ${SUGERENCIAS_ORIGEN[0]}` : "Ej: Media res"}
              />
            </div>

            <div className="form-col">
              <label>Kg a descontar</label>
              <input
                type="number" min="0" step="0.01" inputMode="decimal"
                value={desposte.kg}
                onChange={(e)=> setDesposte(d => ({ ...d, kg: e.target.value }))}
              />
            </div>

            <div className="form-col">
              <label>Unidades (opcional)</label>
              <input
                type="number" min="0" step="1" inputMode="numeric"
                value={desposte.unidades}
                onChange={(e)=> setDesposte(d => ({ ...d, unidades: e.target.value }))}
              />
            </div>

            <div className="form-col form-col--btn">
              <label>&nbsp;</label>
              <button className="btn-primary" onClick={ejecutarDesposte}>Despostar</button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Ingreso de producción diaria</h3>

          <div className="toolbar">
            <button type="button" onClick={handleAdd}>Agregar fila</button>
            <button type="button" className="btn-primary" onClick={handleGuardarProduccion}>Guardar producción</button>
            {mensaje && <span className="flash-ok">{mensaje}</span>}
          </div>

          <div className="table-wrap">
            <table className="table-excel table-produccion">
              <thead>
                <tr>
                  <th style={{minWidth:220}}>Producto / Corte</th>
                  <th style={{width:140}}>Kg</th>
                  <th style={{width:140}}>Tara</th>
                  <th style={{width:140}}>Unidades</th>
                  <th style={{width:160}}>Kg Neto</th>
                  <th style={{width:120}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila, i) => (
                  <tr key={i}>
                    <td>
                      <AutoCompleteInput
                        value={fila.corte}
                        onChange={(v)=> handleChange(i, "corte", v)}
                        placeholder="Suprema, Cogote, Alitas…"
                      />
                    </td>
                    <td>
                      <input
                        type="number" min="0" step="0.01" inputMode="decimal"
                        value={fila.kg}
                        onChange={(e) => handleChange(i, "kg", e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number" min="0" step="0.01" inputMode="decimal"
                        value={fila.tara}
                        onChange={(e) => handleChange(i, "tara", e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number" min="0" step="1" inputMode="numeric"
                        value={fila.unidades}
                        onChange={(e) => handleChange(i, "unidades", e.target.value)}
                      />
                    </td>
                    <td>
                      <input type="number" step="0.01" value={fila.kgNeto} readOnly tabIndex={-1} />
                    </td>
                    <td>
                      <button type="button" className="btn-danger" onClick={() => handleRemove(i)}>Quitar</button>
                    </td>
                  </tr>
                ))}
                {!filas.length && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "#6b7280" }}>
                      Sin filas. Agregá producción.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
