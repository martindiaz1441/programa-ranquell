// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import "./App.css";
import "./responsive.css"; // ✅ ruta correcta

// HOTFIX: fuerza texto visible en nav y “tiles” del home
(function injectMenuFix() {
  if (document.getElementById("menu-fix")) return;

  const css = `
  :root{ --brand-600:#15703e; --brand-700:#115c33; --btn-fg:#fff;
         --text-strong:#0f172a; --tile-bg:#fff; --tile-border:#d1d5db; }

  /* NAV (arriba) */
  nav, .menu, .main-menu, .menu-principal, header + nav { display:flex; flex-wrap:wrap; gap:10px; }
  nav button, nav a, nav .btn, nav label,
  .menu button, .menu a, .menu .btn, .menu label,
  .main-menu button, .main-menu a, .main-menu .btn, .main-menu label,
  .menu-principal button, .menu-principal a, .menu-principal .btn, .menu-principal label,
  header + nav button, header + nav a, header + nav .btn, header + nav label {
    background-color: var(--brand-600) !important;
    color: var(--btn-fg) !important; -webkit-text-fill-color: var(--btn-fg) !important;
    border:1px solid var(--brand-700) !important; border-radius:10px !important;
    padding:10px 14px !important; font-weight:600 !important; text-decoration:none !important;
    display:inline-flex !important; align-items:center !important; justify-content:center !important;
    cursor:pointer; appearance:none !important; text-shadow:none !important;
  }

  /* TILES DEL HOME (los botones grandes) */
  .content .card a, .content .card button,
  .content a.btn, .content button.btn,
  .content .grid a, .content .grid button,
  .content .home-grid a, .content .home-grid button,
  .content .tiles a, .content .tiles button,
  .content .menu-box a, .content .menu-box button,
  .content .cards a, .content .cards button {
    background-color: var(--tile-bg) !important;
    border:1px solid var(--tile-border) !important;
    color: var(--text-strong) !important; -webkit-text-fill-color: var(--text-strong) !important;
    border-radius:12px !important; padding:14px 16px !important; font-weight:700 !important;
    text-decoration:none !important; display:inline-flex !important; align-items:center !important; justify-content:center !important;
    min-height:48px; box-shadow: 0 2px 8px rgba(0,0,0,.06);
  }
  .content .card a *, .content .card button *,
  .content .grid a *, .content .grid button * { color: var(--text-strong) !important; -webkit-text-fill-color: var(--text-strong) !important; }

  @media (max-width: 640px){
    .content .card a, .content .card button { width:100%; }
    nav button, nav a, nav .btn, nav label { flex:1 1 auto; min-width:140px; }
  }`;

  const s = document.createElement("style");
  s.id = "menu-fix";
  s.appendChild(document.createTextNode(css));
  document.head.appendChild(s);
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
