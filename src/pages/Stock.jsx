// src/pages/Stock.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeStock, setStockItem } from "../services/dataService";
import { isAdmin, canSeePrices } from "../services/authService";
import { findProducto, getCategorias } from "../services/productService";

export default function Stock() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]); // {id, nombre, categoria, tipo, kg, cantidad}
  const [filtro, setFiltro] = useState("");
  const [tipo, setTipo] = useState("todos"); // todos | kg | unidad
  const [cat, setCat] = useState("Todas");
  const showPrices = canSeePrices();
  const cats = useMemo(()=> ["Todas", ...getCategorias()], []);

  useEffect(() => {
    const off = subscribeStock((rows) => setItems(rows || []));
    return () => { if (typeof off === "function") off(); };
  }, []);

  const withMeta = useMemo(() => {
    return (items || []).map(it => {
      const meta = findProducto(it.nombre) || {};
      const metaTipo = (meta.tipo ?? meta.unidad) === "unidad" ? "unidad" : "kg";
      const tipo = it.tipo || metaTipo;
      const categoria = it.categoria || meta.categoria || "General";
      const kg = Number(it.kg || 0);
      const unidades = Number(it.cantidad || 0);
      const precio = Number(meta.precio || 0);
      const total = tipo === "unidad" ? (unidades * precio) : (kg * precio);
      return { ...it, _tipo: tipo, _categoria: categoria, _kg: kg, _unidades: unidades, _precio: precio, _total: total };
    });
  }, [items]);

  const filtrados = withMeta.filter(p => {
    const q = (filtro || "").toLowerCase();
    const okQ = !q || (p.nombre||"").toLowerCase().includes(q);
    const okT = tipo === "todos" || p._tipo === tipo;
    const okC = cat === "Todas" || p._categoria === cat;
    return okQ && okT && okC;
  });

  const totalKg = filtrados.reduce((a, b) => a + Number(b._kg || 0), 0);
  const totalU  = filtrados.reduce((a, b) => a + Number(b._unidades || 0), 0);
  const total$  = filtrados.reduce((a, b) => a + Number(b._total || 0), 0);

  const ponerEnCero = async (item) => {
    if (!isAdmin()) return;
    if (!confirm(`¿Poner en 0 "${item.nombre}"?`)) return;
    await setStockItem({ id: item.id, nombre: item.nombre, categoria: item._categoria, tipo: item._tipo, kg: 0, cantidad: 0 });
  };

  return (
    <div className="app-container">
      <header className="header">Stock</header>
      <nav className="menu">
        <button onClick={() => navigate("/")}>Menú principal</button>
        <button onClick={() => navigate("/historial")}>Historial</button>
        {isAdmin() && <button onClick={() => navigate("/productos")}>Administrar catálogo</button>}
      </nav>

      <div className="content">
        <h2>Stock actual de productos</h2>

        <div className="toolbar" style={{ gap: 8 }}>
          <input
            type="text"
            placeholder="Buscar producto…"
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            style={{ maxWidth: 260 }}
          />
          <select value={tipo} onChange={(e)=> setTipo(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="kg">Solo por kg</option>
            <option value="unidad">Solo por unidad</option>
          </select>
          <select value={cat} onChange={(e)=> setCat(e.target.value)}>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span style={{ color: "#6b7280", fontSize: 13, marginLeft:"auto" }}>
            {filtrados.length} ítems • {totalKg.toFixed(2)} kg • {totalU} u.
            {showPrices && <> • Total ${total$.toFixed(2)}</>}
          </span>
        </div>

        <div className="table-wrap" style={{ marginTop:12 }}>
          <table className="table-excel table-stock">
            <thead>
              <tr>
                <th style={{textAlign:"left"}}>Producto</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Kg</th>
                <th>Unidades</th>
                {showPrices && <th>Precio</th>}
                {showPrices && <th>Total</th>}
                {isAdmin() && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((item) => (
                <tr key={item.id || item.nombre}>
                  <td style={{textAlign:"left"}}>{item.nombre}</td>
                  <td>
                    <span style={{
                      padding:"2px 8px", borderRadius:999,
                      background: item._tipo==="unidad" ? "#fef3c7" : "#e0f2fe",
                      border:"1px solid #ddd"
                    }}>
                      {item._tipo}
                    </span>
                  </td>
                  <td>{item._categoria}</td>
                  <td>{Number(item._kg||0).toFixed(2)}</td>
                  <td>{Number(item._unidades||0)}</td>
                  {showPrices && <td>${Number(item._precio||0).toFixed(2)}</td>}
                  {showPrices && <td>${Number(item._total||0).toFixed(2)}</td>}
                  {isAdmin() && (
                    <td>
                      <button className="btn-danger" onClick={()=> ponerEnCero(item)}>Poner en 0</button>
                    </td>
                  )}
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={isAdmin()? (showPrices?8:6) : (showPrices?7:5)} style={{textAlign:"center", color:"#6b7280"}}>Sin resultados</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ background: "#e0e0e0", fontWeight: "bold" }}>
                <td colSpan={3}>Total</td>
                <td>{totalKg.toFixed(2)}</td>
                <td>{totalU}</td>
                {showPrices && <td></td>}
                {showPrices && <td>${total$.toFixed(2)}</td>}
                {isAdmin() && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
