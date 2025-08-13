// src/pages/Productos.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCatalogo, setCatalogo, upsertProductoCatalogo, removeProductoCatalogo
} from "../services/productService";
import { isAdmin } from "../services/authService";
import { importarCatalogoProductosExcel } from "../utils/excelUtils";

export default function Productos() {
  const nav = useNavigate();
  const [list, setList] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    if (!isAdmin()) { nav("/"); return; }
    setList(getCatalogo());
  }, [nav]);

  const filtrados = useMemo(() => {
    const q = (filtro||"").trim().toLowerCase();
    if (!q) return list;
    return list.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q)
    );
  }, [list, filtro]);

  function onGuardar(item) {
    const ok = upsertProductoCatalogo({
      nombre: String(item.nombre || "").trim(),
      categoria: String(item.categoria || "").trim(),
      tipo: item.tipo === "unidad" ? "unidad" : "kg",
      precio: Number(item.precio || 0)
    });
    if (ok?.error) return alert(ok.error);
    setList(getCatalogo());
  }
  function onEliminar(nombre) {
    if (!window.confirm(`¿Eliminar "${nombre}" del catálogo?`)) return;
    removeProductoCatalogo(nombre);
    setList(getCatalogo());
  }
  async function borrarTodoYCargar(nuevo) {
    if (!window.confirm("Esto borrará TODO el catálogo actual y cargará el nuevo. ¿Continuar?")) return;
    const ok = setCatalogo(nuevo);
    setList(ok);
    alert(`Catálogo cargado: ${ok.length} productos.`);
  }

  async function handleExcel(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const cat = await importarCatalogoProductosExcel(file);
      borrarTodoYCargar(cat);
    } catch (err) {
      console.error(err);
      alert("No pude leer el Excel. Verifica el formato.");
    } finally {
      e.target.value = "";
    }
  }
  async function handleJSON(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const cat = Array.isArray(json) ? json : (json.catalogo || []);
      borrarTodoYCargar(cat);
    } catch (err) {
      console.error(err);
      alert("JSON inválido.");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="app-container">
      <header className="header">Catálogo de productos</header>
      <nav className="menu menu--compact">
        <button onClick={() => nav("/")}>Menú principal</button>
        <div style={{display:"flex", gap:8, alignItems:"center"}}>
          <label className="btn-primary" style={{cursor:"pointer"}}>
            BORRAR TODO Y CARGAR (Excel)
            <input type="file" accept=".xls,.xlsx" onChange={handleExcel} style={{display:"none"}} />
          </label>
          <label className="btn-danger" style={{cursor:"pointer"}}>
            BORRAR TODO Y CARGAR (JSON)
            <input type="file" accept=".json" onChange={handleJSON} style={{display:"none"}} />
          </label>
        </div>
      </nav>

      <div className="content">
        <div className="toolbar">
          <input
            type="text"
            placeholder="Buscar por nombre o categoría…"
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            style={{flex:1}}
          />
          <NuevoProducto onGuardar={onGuardar} />
        </div>

        <div className="table-wrap">
          <table className="table-excel">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Producto</th>
                <th>Unidad</th>
                <th>Precio</th>
                <th style={{width:120}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p,idx) => (
                <FilaProducto key={p.nombre + idx} prod={p} onGuardar={onGuardar} onEliminar={onEliminar} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FilaProducto({ prod, onGuardar, onEliminar }) {
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState(prod);
  useEffect(() => { setF(prod); }, [prod]);

  if (!edit) {
    return (
      <tr>
        <td>{prod.categoria}</td>
        <td>{prod.nombre}</td>
        <td>{prod.tipo}</td>
        <td>${Number(prod.precio||0).toFixed(2)}</td>
        <td>
          <button onClick={() => setEdit(true)}>Editar</button>{" "}
          <button className="btn-danger" onClick={() => onEliminar(prod.nombre)}>Eliminar</button>
        </td>
      </tr>
    );
  }
  return (
    <tr>
      <td><input value={f.categoria} onChange={e=>setF({...f, categoria:e.target.value})} /></td>
      <td><input value={f.nombre} onChange={e=>setF({...f, nombre:e.target.value})} /></td>
      <td>
        <select value={f.tipo} onChange={e=>setF({...f, tipo:e.target.value})}>
          <option value="kg">kg</option>
          <option value="unidad">unidad</option>
        </select>
      </td>
      <td><input type="number" step="0.01" value={f.precio} onChange={e=>setF({...f, precio:e.target.value})} /></td>
      <td>
        <button onClick={() => { onGuardar(f); setEdit(false); }}>Guardar</button>{" "}
        <button onClick={() => setEdit(false)}>Cancelar</button>
      </td>
    </tr>
  );
}
function NuevoProducto({ onGuardar }) {
  const [f, setF] = useState({ categoria:"", nombre:"", tipo:"kg", precio:0 });
  function guardar() {
    if (!f.nombre.trim()) return alert("Nombre requerido");
    if (!f.categoria.trim()) return alert("Categoría requerida");
    onGuardar({ ...f, precio:Number(f.precio||0) });
    setF({ categoria:"", nombre:"", tipo:"kg", precio:0 });
  }
  return (
    <>
      <input placeholder="Categoría" value={f.categoria} onChange={e=>setF({...f, categoria:e.target.value})} />
      <input placeholder="Producto" value={f.nombre} onChange={e=>setF({...f, nombre:e.target.value})} />
      <select value={f.tipo} onChange={e=>setF({...f, tipo:e.target.value})}>
        <option value="kg">kg</option>
        <option value="unidad">unidad</option>
      </select>
      <input type="number" step="0.01" placeholder="Precio" value={f.precio} onChange={e=>setF({...f, precio:e.target.value})} />
      <button className="btn-primary" onClick={guardar}>Agregar</button>
    </>
  );
}
