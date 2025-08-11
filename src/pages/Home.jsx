// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { getCurrentUser, logout } from "../services/authService";

export default function Home() {
  const navigate = useNavigate();
  const user = getCurrentUser() || { nombre: "Usuario" };

  const handleLogout = () => {
    logout?.();
    navigate("/login");
  };

  return (
    <div className="app-container">
      <div className="content" style={{ padding: 24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          <img src={logo} alt="Ranquel Logo" style={{ height: 56 }} />
          <div>
            <div style={{ fontWeight:700, fontSize:20 }}>Frigorífico Ranquel - Gestión Avícola</div>
            <div style={{ color:"#6b7280" }}>Bienvenido, {user.nombre}</div>
          </div>
        </div>

        <div className="menu" style={{ marginTop: 8, marginBottom: 16 }}>
          <button onClick={() => navigate("/produccion")}>Producción</button>
          <button onClick={() => navigate("/ingresos")}>Ingresos</button>
          <button onClick={() => navigate("/egresos")}>Egresos</button>
          <button onClick={() => navigate("/stock")}>Stock</button>
          <button onClick={() => navigate("/historial")}>Historial</button>
          <button style={{ background:"#333" }} onClick={handleLogout}>
            Salir ({user.nombre})
          </button>
        </div>

        <div>
          <h2 style={{ marginTop: 0 }}>Panel principal</h2>
          <ul>
            <li><b>Producción:</b> Registrá la faena diaria y los cortes obtenidos.</li>
            <li><b>Ingresos:</b> Sumá mercadería o productos al stock.</li>
            <li><b>Egresos:</b> Registrá ventas o retiros de stock.</li>
            <li><b>Stock:</b> Visualizá y gestioná todos los productos.</li>
            <li><b>Historial:</b> Consultá el detalle de todas las jornadas.</li>
          </ul>
          <p style={{ marginTop: 24, color: "#9ca3af" }}>
            © Frigorífico Ranquel - {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
