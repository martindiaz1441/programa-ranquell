import React, { useState } from "react";
import logo from "../assets/logo.png";
import { login, getCurrentUser } from "../services/authService";
import { useNavigate, Navigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (getCurrentUser()) return <Navigate to="/" />;

  const handleLogin = (e) => {
    e.preventDefault();
    const ok = login(nombre, password);
    if (ok) {
      navigate("/");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="app-container" style={{ justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div className="content" style={{ maxWidth: 400, marginTop: 64 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img src={logo} alt="Ranquel Logo" style={{ height: 70 }} />
          <h2>Ingreso al sistema</h2>
        </div>
        <form onSubmit={handleLogin}>
          <label>Nombre de usuario</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            autoFocus
            autoComplete="username"
            placeholder="Ej: Martin"
          />
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Contraseña"
          />
          {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
          <button type="submit" style={{ width: "100%", marginTop: 12 }}>Entrar</button>
        </form>
        <div style={{ marginTop: 32, fontSize: 14, color: "#555" }}>
          <b>Usuarios habilitados:</b>
          <ul>
            <li>Martin (admin)</li>
            <li>Orlando</li>
            <li>Gastón</li>
            <li>Matías</li>
            <li>Miguel</li>
          </ul>
          <span>Todos: contraseña <b>1234</b></span>
        </div>
      </div>
    </div>
  );
}
