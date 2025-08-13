// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Produccion from "./pages/Produccion";
import Ingresos from "./pages/Ingresos";
import Egresos from "./pages/Egresos";
import Stock from "./pages/Stock";
import Historial from "./pages/Historial";
import Productos from "./pages/Productos";
import Permisos from "./pages/Permisos";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/produccion" element={<Produccion />} />
      <Route path="/ingresos" element={<Ingresos />} />
      <Route path="/egresos" element={<Egresos />} />
      <Route path="/stock" element={<Stock />} />
      <Route path="/historial" element={<Historial />} />
      <Route path="/productos" element={<Productos />} />
      <Route path="/permisos" element={<Permisos />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
