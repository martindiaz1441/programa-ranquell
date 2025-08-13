// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  getCurrentUser, logout, isAdmin,
  getPriceViewers, grantPriceAccess, revokePriceAccess, canSeePrices
} from "../services/authService";

export default function Home() {
  const navigate = useNavigate();
  const user = getCurrentUser() || { nombre: "Usuario" };
  const [viewers, setViewers] = useState([]);
  const [nuevoViewer, setNuevoViewer] = useState("");

  useEffect(() => {
    if (isAdmin()) setViewers(getPriceViewers());
  }, []);

  const handleLogout = () => {
    logout?.();
    navigate("/login");
  };

  const addViewer = () => {
    const id = (nuevoViewer || "").trim();
    if (!id) return;
    setViewers(grantPriceAccess(id));
    setNuevoViewer("");
  };

  const removeViewer = (id) => {
    setViewers(revokePriceAccess(id));
  };

  return (
    <div className="app-container">
      <header className="header">Gestión Frigorífico Ranquel</header>

      <nav className="menu menu--compact">
        <span className="welcome">
          Bienvenido, {user?.nombre || user?.email || "Usuario"}
          {canSeePrices() && " • (ve precios)"}
        </span>
        <button style={{ background:"#333" }} onClick={handleLogout}>
          Salir ({user?.nombre || "Cuenta"})
        </button>
      </nav>

      <div className="content">
        <div className="hero">
          <img src={logo} alt="Ranquel" className="hero-logo" />
          <div>
            <h1 className="hero-title">Frigorífico Ranquel – Gestión Avícola</h1>
            <p className="hero-sub">Panel central del sistema</p>
          </div>
        </div>

        <div className="grid">
          <button className="card card-action" onClick={()=> navigate("/produccion")}>Producción</button>
          <button className="card card-action" onClick={()=> navigate("/ingresos")}>Ingresos</button>
          <button className="card card-action" onClick={()=> navigate("/egresos")}>Egresos</button>
          <button className="card card-action" onClick={()=> navigate("/stock")}>Stock</button>
          <button className="card card-action" onClick={()=> navigate("/historial")}>Historial</button>
          {isAdmin() && (
            <button className="card card-action" onClick={()=> navigate("/productos")}>
              Catálogo
            </button>
          )}
        </div>

        {isAdmin() && (
          <div className="card">
            <h3 className="card-title">Permisos para ver precios</h3>
            <p>Agregá <b>email</b> o <b>nombre exacto</b> (coincide con el login) de quienes pueden ver precios/valorización.</p>
            <div style={{ display:"flex", gap:8, marginBottom:8 }}>
              <input
                type="text"
                placeholder="martincbsn@gmail.com o Martin"
                value={nuevoViewer}
                onChange={e=> setNuevoViewer(e.target.value)}
                style={{ flex:1 }}
              />
              <button className="btn-primary" onClick={addViewer}>Agregar</button>
            </div>
            {viewers.length === 0 ? (
              <div style={{ color:"#6b7280" }}>No hay habilitados aún.</div>
            ) : (
              <ul className="bullets">
                {viewers.map(id => (
                  <li key={id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span>{id}</span>
                    <button className="btn-danger" onClick={()=> removeViewer(id)}>Quitar</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="card">
          <h3 className="card-title">Resumen</h3>
          <ul className="bullets">
            <li><b>Producción:</b> Cargá cortes y se suman al stock.</li>
            <li><b>Ingresos:</b> Entran productos (compra/recepción).</li>
            <li><b>Egresos:</b> Ventas/retiros y descuento automático.</li>
            <li><b>Stock:</b> Vista y edición. Valorización solo para autorizados.</li>
            <li><b>Historial:</b> Jornadas por fecha con detalle.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
