import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Produccion from "./pages/Produccion";
import Ingresos from "./pages/Ingresos";
import Egresos from "./pages/Egresos";
import Stock from "./pages/Stock";
import Historial from "./pages/Historial";
import { getCurrentUser } from "./services/authService";

function PrivateRoute({ children }) {
  const user = getCurrentUser();
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/produccion" element={
          <PrivateRoute>
            <Produccion />
          </PrivateRoute>
        } />
        <Route path="/ingresos" element={
          <PrivateRoute>
            <Ingresos />
          </PrivateRoute>
        } />
        <Route path="/egresos" element={
          <PrivateRoute>
            <Egresos />
          </PrivateRoute>
        } />
        <Route path="/stock" element={
          <PrivateRoute>
            <Stock />
          </PrivateRoute>
        } />
        <Route path="/historial" element={
          <PrivateRoute>
            <Historial />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
