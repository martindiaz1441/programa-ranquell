// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

// PÁGINAS REALES (en /pages)
import Home from "./pages/Home";
import Produccion from "./pages/Produccion";
import Ingresos from "./pages/Ingresos";
import Egresos from "./pages/Egresos";
import Stock from "./pages/Stock";
import Historial from "./pages/Historial";
import Login from "./pages/Login"; // usá la versión de /pages

export default function App() {
  return (
    <Routes>
      {/* Rutas con layout y navbar */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/produccion" element={<Produccion />} />
        <Route path="/ingresos" element={<Ingresos />} />
        <Route path="/egresos" element={<Egresos />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/historial" element={<Historial />} />
      </Route>

      {/* Login fuera del layout */}
      <Route path="/login" element={<Login />} />

      {/* catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
