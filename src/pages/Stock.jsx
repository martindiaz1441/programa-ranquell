// src/pages/Egresos.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import { subscribeDraft, updateDraft, clearDraft, commitEgresos } from "../services/dataService";
import { importarEgresosExcel } from "../utils/excelUtils";

export default function Egresos() {
  const navigate = useNavigate();
  const user = (typeof getCurrentUser === "function" && getCurrentUser()) || { nombre: "Usuario" };
  const userNombre = user?.nombre || user?.email || "Usuario";

  const [filas, setFilas] = useState([{ producto: "", cantidad: "", kg: "" }]);
  const [msg, setMsg] = useState("");
  const [resumen, setResumen] = useState(null);
  const flash = (t, ms = 1800) => { setMsg(t); setTimeout(() => setMsg(""), ms); };

  useEffect(() => {
    const off = subscribeDraft("egresos", (rows) => {
      if (Array.isArray(rows) && rows.length) setFilas(rows);
      else setFilas([{ producto: "", cantidad: "", kg: "" }]);
    });
    return () => { if (typeof off === "function") off(); };
  }, []);

  const handleAdd = () => {
    const nuevo = [...filas, { producto: "", cantidad: "", kg: "" }];
    setFilas(nuevo); updateDraft("egresos", nuevo);
  };
  const handleRemove = (i) => {
    const nuevo = filas.filter((_, idx) => idx !== i);
    setFilas(nuevo); updateDraft("egresos", nuevo);
  };
  const handleChange = (i, key, val) => {
    const nuevo = filas.map((r, idx) => idx === i ? { ...r, [key]: val } : r);
    setFilas(nuevo); updateDraft("egresos", nuevo);
  };

  const normalizarNombre = (s) => (s || "").trim();

  const guardarEgresos = async (e) => {
    e.preventDefault();
    if (!filas.length) return flash("No hay filas para guardar");

    const movimientos = [];
    const errores = [];
    filas.forEach((f, i) => {
      const nombre = normalizarNombre(f.producto);
      const kg = Number(f.kg || 0);
      const unidades = Number(f.cantidad || 0);
      if (!nombre || (kg <= 0 && unidades <= 0)) {
        errores.push(`Fila ${i+1}: datos incompletos`);
      } else {
        movimientos.push({ nombre, tipo: unidades > 0 ? "unidad" : "kg", kg, unidades });
      }
    });

    if (!movimientos.length) {
      setResumen({ ok: 0, err: errores.length, errores });
      return flash("No se guardaron egresos por errores");
    }

    try {
      await commitEgresos(movimientos, userNombre);
      await clearDraft("egresos");
      setFilas([{ producto: "", cantidad: "", kg: "" }]);
      setResumen({ ok: movimientos.length, err: errores.length, errores });
      flash(`Egresos guardados: ${movimientos.length} ok${errores.length ? `, ${errores.length} con error` : ""}`);
    } catch (err) {
      console.error(err);
      flash("Error al guardar egresos");
    }
  };

  const onImportExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importarEgresosExcel(file, async (rows, erroresImport) => {
      const errores = [...(erroresImport || [])];
      const movimientos = [];
      (rows || []).forEach((r, i) => {
        const nombre = normalizarNombre(r.producto);
        const kg = Number(r.kg || 0);
        const unidades = Number(r.cantidad || 0);
        if (!nombre || (kg <= 0 && unidades <= 0)) errores.push(`Fila importada ${i+1}: datos incompletos`);
        else movimientos.push({ nombre, tipo: unidades > 0 ? "unidad" : "kg", kg, unidades });
      });

      if (!movimientos.length) {
        setResumen({ ok: 0, err: errores.length, errores });
        flash("No se guardaron egresos por errores"); e.target.value = ""; return;
      }

      try {
        await commitEgresos(movimientos, userNombre);
        await clearDraft("egresos");
        setFilas([{ producto: "", cantidad: "", kg: "" }]);
        setResumen({ ok: movimientos.length, err: errores.length, errores });
        flash(`Importados: ${movimientos.length} ok${errores.length ? `, ${errores.length} con error` : ""}`);
      } catch (err) {
        console.error(err);
        flash("Error importando egresos");
      }
      e.target.value = "";
    });
  };

  return (
    <div className="app-container">
      <header className="header">Egresos</header>
      <nav className="menu">
        <button onClick={() => navigate("/")}>Menú principal</button>
        <button onClick={() => navigate("/stock")}>Ver stock</button>
        <label style={{ background:"#0ea5e9", color:"#fff", borderRadius:8, padding:"10px 14px", cursor:"pointer" }}>
          Importar Excel
          <input type="file" accept=".xlsx,.xls" onChange={onImportExcel} style={{ display:"none" }} />
        </label>
      </nav>

      <div className="content">
        <div className="card">
          <h3 className="card-title">Carga manual</h3>
          <form onSubmit={guardarEgresos}>
            <div className="table-wrap">
              <table className="table-excel">
                <thead>
                  <tr>
                    <th style={{minWidth:220}}>Producto</th>
                    <th style={{width:140}}>Cantidad</th>
                    <th style={{width:140}}>Kg</th>
                    <th style={{width:120}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((f, i) => (
                    <tr key={i}>
                      <td>
                        <input type="text" value={f.producto} onChange={(e)=> handleChange(i, "producto", e.target.value)} placeholder="Ej: Suprema" />
                      </td>
                      <td>
                        <input type="number" min="0" step="1" value={f.cantidad} onChange={(e)=> handleChange(i, "cantidad", e.target.value)} />
                      </td>
                      <td>
                        <input type="number" min="0" step="0.01" value={f.kg} onChange={(e)=> handleChange(i, "kg", e.target.value)} />
                      </td>
                      <td>
                        <button type="button" className="btn-danger" onClick={()=> handleRemove(i)}>Quitar</button>
                      </td>
                    </tr>
                  ))}
                  {filas.length === 0 && (<tr><td colSpan={4} style={{textAlign:"center", color:"#6b7280"}}>Sin filas</td></tr>)}
                </tbody>
              </table>
            </div>

            <div className="toolbar" style={{ marginTop:12 }}>
              <button type="button" onClick={handleAdd}>Agregar fila</button>
              <button type="submit" className="btn-primary">Guardar egresos</button>
              {msg && <span className="flash-ok">{msg}</span>}
            </div>
          </form>
        </div>

        {resumen && (
          <div className="card">
            <h3 className="card-title">Resumen</h3>
            <p><b>OK:</b> {resumen.ok} &nbsp; | &nbsp; <b>Errores:</b> {resumen.err}</p>
            {resumen.errores?.length > 0 && <ul className="bullets">{resumen.errores.map((e, idx) => <li key={idx}>{e}</li>)}</ul>}
          </div>
        )}

        <div className="card">
          <h3 className="card-title">Formato de Excel aceptado</h3>
          <ul className="bullets">
            <li><b>Dos columnas</b>: PRODUCTOS | KG o UNIDAD (número).</li>
            <li><b>Lista</b> con columnas: Producto, Kg, Cantidad (o “Unidad”).</li>
          </ul>
          <p>El sistema deduce <b>kg/unidad</b> por la columna que completes.</p>
        </div>
      </div>
    </div>
  );
}
