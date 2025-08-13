// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Tus estilos habituales
import "./App.css";
import "./styles/responsive.css";

/**
 * HOTFIX: inyecta un <style> al FINAL de la cascada
 * para forzar que los botones/enlaces del menú sean legibles
 * (texto blanco sobre fondo verde) incluso si hay reglas que los dejan “blancos”.
 */
function injectMenuFix() {
  if (document.getElementById("menu-fix")) return;

  const css = `
  :root {
    --brand-600: #15703e;
    --brand-700: #115c33;
    --btn-fg: #ffffff;
  }

  /* Contenedores comunes de menús */
  nav, .menu, .main-menu, .menu-principal, header + nav {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  /* Botones/enlaces/labels dentro de menús */
  nav button, nav a, nav .btn, nav label,
  .menu button, .menu a, .menu .btn, .menu label,
  .main-menu button, .main-menu a, .main-menu .btn, .main-menu label,
  .menu-principal button, .menu-principal a, .menu-principal .btn, .menu-principal label,
  header + nav button, header + nav a, header + nav .btn, header + nav label {
    background-color: var(--brand-600) !important;
    color: var(--btn-fg) !important;
    -webkit-text-fill-color: var(--btn-fg) !important; /* iOS/Android modo oscuro */
    border: 1px solid var(--brand-700) !important;
    border-radius: 10px !important;
    padding: 10px 14px !important;
    font-weight: 600 !important;
    text-decoration: none !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer;
    appearance: none !important;
    mix-blend-mode: normal !important;
    text-shadow: none !important;
    background-clip: padding-box !important;
  }

  /* Feedback visual */
  nav button:hover, nav a:hover, nav label:hover,
  .menu button:hover, .menu a:hover, .menu label:hover,
  .main-menu button:hover, .main-menu a:hover, .main-menu label:hover,
  .menu-principal button:hover, .menu-principal a:hover, .menu-principal label:hover,
  header + nav button:hover, header + nav a:hover, header + nav label:hover {
    filter: brightness(0.97);
  }
  nav button:active, nav a:active, nav label:active,
  .menu button:active, .menu a:active, .menu label:active,
  .main-menu button:active, .main-menu a:active, .main-menu label:active,
  .menu-principal button:active, .menu-principal a:active, .menu-principal label:active,
  header + nav button:active, header + nav a:active, header + nav label:active {
    transform: translateY(1px);
  }
  nav button:focus-visible, nav a:focus-visible, nav label:focus-visible,
  .menu button:focus-visible, .menu a:focus-visible, .menu label:focus-visible,
  .main-menu button:focus-visible, .main-menu a:focus-visible, .main-menu label:focus-visible,
  .menu-principal button:focus-visible, .menu-principal a:focus-visible, .menu-principal label:focus-visible,
  header + nav button:focus-visible, header + nav a:focus-visible, header + nav label:focus-visible {
    outline: 2px solid #0ea5e9;
    outline-offset: 2px;
    box-shadow: 0 0 0 2px rgba(14,165,233,.25);
  }

  /* Móvil: que ocupen ancho y se vean en columnas */
  @media (max-width: 520px) {
    nav button, nav a, nav .btn, nav label,
    .menu button, .menu a, .menu .btn, .menu label,
    .main-menu button, .main-menu a, .main-menu .btn, .main-menu label,
    .menu-principal button, .menu-principal a, .menu-principal .btn, .menu-principal label,
    header + nav button, header + nav a, header + nav .btn, header + nav label {
      flex: 1 1 auto;
      min-width: 140px;
      text-align: center;
    }
  }
  `;

  const s = document.createElement("style");
  s.id = "menu-fix";
  s.appendChild(document.createTextNode(css));
  document.head.appendChild(s);
}
injectMenuFix();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
