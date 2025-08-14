// src/pages/Ingresos.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, isAdmin } from "../services/authService";
import { subscribeDraft, updateDraft, clearDraft, commitIngresos } from "../services/dataService";
import { getNombresCatalogo, addProductoCatalogo, bulkUpsertCatalog, findProducto } from "../services/productService";
import { importarIngresosExcel } from "../utils/excelUtils";
import AutoCompleteInput from "../components/AutoCompleteInput";

export default function Ingresos() {
  const navigate = useNavigate();
  const user = (typeof getCurrentUser === "function" && getCurrentUser()) || { nombre: "Usuario" };
  const userNombre = user?.nombre || user?.email || "Usuario";

  const [filas, setFilas] = useState([{ producto: "", cantidad: "", kg: "", categoria: "", precio: "" }]);
  const [msg, setMsg] = useState("");
  const [resumen, setResumen] = useState(null);
  const [catalogo, setCatalogo] = useState(getNombresCatalogo());
  const lastInputRef = useRef(null);

  useEffect(() => setCatalogo(getNombresCatalogo()), []);
  useEffect(() => {
    const off = subscribeDraft("ingresos", (rows) => {
      if (Array.isArray(rows) && rows.length) setFilas(rows);
      else setFilas([{ producto: "", cantidad: "", kg: "", categoria: "", precio: "" }]);
    });
    return () => { if (typeof off === "function") off(); };
  }, []);

  const flash = (t, ms = 1800) => { setMsg(t); setTimeout(() => setMsg(""), ms); };

  const handleAdd = (focus = true) => {
    const nuevo = [...filas, { producto: "", cantidad: "", kg: "", categoria: "", precio: "" }];
    setFilas(nuevo); updateDraft("ingresos", nuevo);
    if (focus) setTimeout(()=> lastInputRef.current?.focus(), 0);
  };
  const handleRemove = (i) => {
    const nuevo = filas.filter((_, idx) => idx !== i);
    setFilas(nuevo); updateDraft("ingresos", nuevo);
  };
  const handleChange = (i, key, val) => {
    const nuevo = filas.map((r, idx) => idx === i ? { ...r, [key]: val } : r);
    setFilas(nuevo); updateDraft("ingresos", nuevo);
  };

  const normalizarNombre = (s) => (s || "").trim();

  const upsertCatalogFromRow = async (fila) => {
    const nombre = normalizarNombre(fila.producto);
    if (!nombre) return;
    const metaActual = findProducto(nombre) || {};
    const tipo = Number(fila.cantidad || 0) > 0 && Number(fila.kg || 0) === 0 ? "unidad" : "kg";
    await addProductoCatalogo(nombre, {
      categoria: fila.categoria || metaActual.categoria || "General",
      tipo: fila.tipo || metaActual.tipo || tipo,
      precio: Number(fila.precio || metaActual.precio || 0),
    });
    setCatalogo(getNombresCatalogo());
  };

  const onKeyDownFila = (e, i, campo) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (i === filas.length - 1 && (campo === "kg" || campo === "cantidad")) handleAdd();
    }
  };

  const guardarIngresos = async (e) => {
    e.preventDefault();
    if (!filas.length) return flash("No hay filas para guardar");

    const movimientos = [];
    const errores = [];
    for (let i = 0; i < filas.length; i++) {
      const f = filas[i];
      const nombre = normalizarNombre(f.producto);
      const kg = Number(f.kg || 0);
      const unidades = Number(f.cantidad || 0);
      if (!nombre || (kg <= 0 && unidades <= 0)) {
        errores.push(`Fila ${i+1}: datos incompletos`);
        continue;
      }
      const tipo = unidades > 0 && kg === 0 ? "unidad" : "kg";
      movimientos.push({
        nombre,
        categoria: f.categoria || "General",
        tipo,
        kg, unidades,
      });
    }

    if (!movimientos.length) {
      setResumen({ ok: 0, err: errores.length, errores });
      return flash("No se guardaron ingresos por errores");
    }

    try {
      // Actualizar catálogo con lo que haya en las filas (precio/categoría si vino)
      const catRows = filas
        .filter(f => f.producto)
        .map(f => ({
          nombre: normalizarNombre(f.producto),
          categoria: f.categoria || "General",
          tipo: Number(f.cantidad || 0) > 0 && Number(f.kg || 0) === 0 ? "unidad" : "kg",
          precio: Number(f.precio || 0),
        }));
      await bulkUpsertCatalog(catRows);

      await commitIngresos(movimientos, userNombre);
      await clearDraft("ingresos");
      setFilas([{ producto: "", cantidad: "", kg: "", categoria: "", precio: "" }]);
      setResumen({ ok: movimientos.length, err: errores.length, errores });
      flash(`Ingresos guardados: ${movimientos.length} ok${errores.length ? `, ${errores.length} con error` : ""}`);
    } catch (err) {
      console.error(err);
      flash("Error al guardar ingresos.");
    }
  };

  const onImportExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importarIngresosExcel(file, async (rows, erroresImport) => {
      const errores = [...(erroresImport || [])];
      if (!rows.length) {
        setResumen({ ok: 0, err: errores.length, errores });
        flash("No se guardaron ingresos por errores");
        e.target.value = "";
        return;
      }

      // Pre-actualizo catálogo según Excel
      const catRows = rows.map(r => ({
        nombre: r.producto,
        categoria: r.categoria || "General",
        tipo: r.tipo || (r.cantidad > 0 && r.kg === 0 ? "unidad" : "kg"),
        precio: Number(r.precio || 0),
      }));
      try {
        await bulkUpsertCatalog(catRows);
      } catch {}

      const movimientos = rows.map(r => ({
        nombre: r.producto,
        categoria: r.categoria || "General",
        tipo: r.tipo || (r.cantidad > 0 && r.kg === 0 ? "unidad" : "kg"),
        kg: Number(r.kg || 0),
        unidades: Number(r.cantidad || 0),
      }));

      try {
        await commitIngresos(movimientos, userNombre);
        await clearDraft("ingresos");
        setFilas([{ producto: "", cantidad: "", kg: "", categoria: "", precio: "" }]);
        setResumen({ ok: movimientos.length, err: errores.length, errores });
        flash(`Importados: ${movimientos.length} ok${errores.length ? `, ${errores.length} con error` : ""}`);
      } catch (err) {
        console.error(err);
        flash("Error importando ingresos");
      }
      e.target.value = "";
    });
  };

  const totalKg = filas.reduce((a, f) => a + Number(f.kg || 0), 0);
  const totalU  = filas.reduce((a, f) => a + Number(f.cantidad || 0), 0);

  return (
    <div className="app-container">
      <header className="header">Ingresos</header>

      <nav className="menu">
        <button onClick={() => navigate("/")}>Menú principal</button>
        <button onClick={() => navigate("/stock")}>Ver stock</button>
        <button onClick={() => navigate("/historial")}>Historial</button>
        <label style={{ background:"#0ea5e9", color:"#fff", borderRadius:8, padding:"10px 14px", cursor:"pointer" }}>
          Importar Excel
          <input type="file" accept=".xlsx,.xls" onChange={onImportExcel} style={{ display:"none" }} />
        </label>
        {isAdmin() && <button onClick={()=> navigate("/productos")}>Administrar productos</button>}
      </nav>

      <div className="content">
        <div className="card">
          <h3 className="card-title">Carga de ingresos</h3>

          <div className="toolbar">
            <button type="button" onClick={() => handleAdd(true)}>Agregar fila</button>
            <button type="button" className="btn-primary" onClick={guardarIngresos}>Guardar ingresos</button>
            <span style={{ marginLeft: "auto", color: "#64748b", fontWeight: 700 }}>
              Total: {totalKg.toFixed(2)} kg • {totalU} u.
            </span>
            {msg && <span className="flash-ok" style={{ marginLeft: 8 }}>{msg}</span>}
          </div>

          <div className="table-wrap">
            <table className="table-excel">
              <thead>
                <tr>
                  <th style={{minWidth:220}}>Producto</th>
                  <th style={{width:120}}>Kg</th>
                  <th style={{width:120}}>Cantidad</th>
                  <th style={{width:160}}>Categoría</th>
                  <th style={{width:140}}>Precio</th>
                  <th style={{width:120}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f, i) => (
                  <tr key={i}>
                    <td>
                      <AutoCompleteInput
                        value={f.producto}
                        onChange={(v)=> handleChange(i, "producto", v)}
                        placeholder="Ej: Suprema"
                        inputRef={i === filas.length - 1 ? lastInputRef : null}
                      />
                    </td>
                    <td>
                      <input
                        type="number" min="0" step="0.01"
                        value={f.kg}
                        onChange={(e)=> handleChange(i, "kg", e.target.value)}
                        onKeyDown={(e)=> onKeyDownFila(e, i, "kg")}
                      />
                    </td>
                    <td>
                      <input
                        type="number" min="0" step="1"
                        value={f.cantidad}
                        onChange={(e)=> handleChange(i, "cantidad", e.target.value)}
                        onKeyDown={(e)=> onKeyDownFila(e, i, "cantidad")}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={f.categoria}
                        onChange={(e)=> handleChange(i, "categoria", e.target.value)}
                        placeholder="General / Pollo / etc."
                      />
                    </td>
                    <td>
                      <input
                        type="number" min="0" step="0.01"
                        value={f.precio}
                        onChange={(e)=> handleChange(i, "precio", e.target.value)}
                        placeholder="0.00"
                      />
                    </td>
                    <td>
                      <button type="button" className="btn-danger" onClick={()=> handleRemove(i)}>Quitar</button>
                    </td>
                  </tr>
                ))}
                {filas.length === 0 && (
                  <tr><td colSpan={6} style={{textAlign:"center", color:"#6b7280"}}>Sin filas</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <th>Total</th>
                  <th>{totalKg.toFixed(2)}</th>
                  <th>{totalU}</th>
                  <th colSpan={3}></th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {resumen && (
          <div className="card">
            <h3 className="card-title">Resumen</h3>
            <p><b>OK:</b> {resumen.ok} &nbsp; | &nbsp; <b>Errores:</b> {resumen.err}</p>
            {resumen.errores?.length > 0 && (
              <ul className="bullets">
                {resumen.errores.map((e, idx) => <li key={idx}>{e}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
