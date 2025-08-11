// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();
  const nav = useNavigate();

  return (
    <header className="app-nav">
      <div className="brand">Gestión Frigorífico Ranquel</div>

      <nav className="links">
        <Link className={pathname === "/" ? "active" : ""} to="/">Inicio</Link>
        <Link className={pathname === "/produccion" ? "active" : ""} to="/produccion">Producción</Link>
        <Link className={pathname === "/ingresos" ? "active" : ""} to="/ingresos">Ingresos</Link>
        <Link className={pathname === "/egresos" ? "active" : ""} to="/egresos">Egresos</Link>
        <Link className={pathname === "/stock" ? "active" : ""} to="/stock">Stock</Link>
        <Link className={pathname === "/historial" ? "active" : ""} to="/historial">Historial</Link>
      </nav>

      <button className="logout-btn" onClick={() => nav("/login")}>LOGOUT</button>
    </header>
  );
}
