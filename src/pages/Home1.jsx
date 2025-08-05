import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { getCurrentUser, logout } from "../services/authService";

export default function Home() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-container">
      <header className="header">
        <img src={logo} alt="Ranquel Logo" style={{ height: 60, marginRight: 16, verticalAlign: "middle" }} />
        Frigorífico Ranquel - Gestión Avícola
      </header>
      <nav className="menu">
        <button onClick={() => navigate("/produccion")}>Producción</button>
        <button onClick={() => navigate("/ingresos")}>Ingresos</button>
        <button onClick={() => navigate("/egresos")}>Egresos</button>
        <button onClick={() => navigate("/stock")}>Stock</button>
        <button onClick={() => navigate("/historial")}>Historial</button>
        <button style={{ background: "#333" }} onClick={handleLogout}>Salir ({user.nombre})</button>
      </nav>
      <div className="content">
        <h2>Bienvenido, {user.nombre}!</h2>
        <p>
          Usá el menú superior para navegar por las diferentes secciones del sistema de gestión avícola.
        </p>
        <ul>
          <li><b>Producción:</b> Registrá la faena diaria y los cortes obtenidos.</li>
          <li><b>Ingresos:</b> Sumá mercadería o productos al stock.</li>
          <li><b>Egresos:</b> Registrá ventas o retiros de stock.</li>
          <li><b>Stock:</b> Visualizá y gestioná todos los productos disponibles.</li>
          <li><b>Historial:</b> Consultá el detalle de todas las jornadas.</li>
        </ul>
        <p style={{marginTop:24, color:'#888'}}>© Frigorífico Ranquel - {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
