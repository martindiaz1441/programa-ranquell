// src/pages/Permisos.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAdmin, getPriceViewers, grantPriceAccess, revokePriceAccess } from "../services/authService";

export default function Permisos() {
  const navigate = useNavigate();
  if (!isAdmin()) {
    return (
      <div className="app-container">
        <header className="header">Permisos de Precios</header>
        <div className="content"><div className="card"><h3 className="card-title">Acceso restringido</h3><p>Solo el administrador puede gestionar permisos.</p></div></div>
      </div>
    );
  }

  const [list, setList] = useState(getPriceViewers());
  const [id, setId] = useState("");

  const add = () => { setList(grantPriceAccess(id)); setId(""); };
  const del = (x) => setList(revokePriceAccess(x));

  return (
    <div className="app-container">
      <header className="header">Permisos de Precios (Admin)</header>
      <nav className="menu">
        <button onClick={()=> navigate("/")}>Menú principal</button>
      </nav>
      <div className="content">
        <div className="card">
          <h3 className="card-title">Autorizar usuarios</h3>
          <div className="form-row">
            <div className="form-col" style={{gridColumn:"span 8"}}>
              <label>Email o Usuario</label>
              <input value={id} onChange={(e)=> setId(e.target.value)} placeholder="ej: martincbsn@gmail.com o Martin" />
            </div>
            <div className="form-col form-col--btn">
              <label>&nbsp;</label>
              <button className="btn-primary" onClick={add} disabled={!id.trim()}>Autorizar</button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Con acceso</h3>
          <ul className="bullets">
            {list.length === 0 && <li>Nadie autorizado (solo admin ve precios).</li>}
            {list.map(x => (
              <li key={x} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span>{x}</span>
                <button className="btn-danger" onClick={()=> del(x)}>Revocar</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
