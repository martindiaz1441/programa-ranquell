// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, TextField, Button, Typography,
  IconButton, InputAdornment, Alert, FormControlLabel, Checkbox
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import logo from "../assets/logo.png";
import { loginEmailPassword } from "../services/authService";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [rec, setRec] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await loginEmailPassword(email, pass, { remember: rec });
      nav("/"); // listo -> home
    } catch (error) {
      const msg = parseError(error);
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box className="auth-bg" sx={{
      minHeight: "100svh",
      display: "grid",
      placeItems: "center",
      padding: 2
    }}>
      <Card elevation={8} sx={{ width: "100%", maxWidth: 420, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <img src={logo} alt="Ranquel" style={{ height: 48 }} />
            <Typography variant="h6" fontWeight={700}>
              Frigorífico Ranquel
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
            Iniciar sesión
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Accedé con tu usuario para continuar.
          </Typography>

          {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

          <form onSubmit={onSubmit}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e)=> setEmail(e.target.value)}
              fullWidth
              required
              autoFocus
              autoComplete="email"
              sx={{ mb: 2 }}
            />
            <TextField
              label="Contraseña"
              type={show ? "text" : "password"}
              value={pass}
              onChange={(e)=> setPass(e.target.value)}
              fullWidth
              required
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={()=> setShow(s=>!s)} edge="end" aria-label="mostrar contraseña">
                      {show ? <VisibilityOff/> : <Visibility/>}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 1 }}
            />

            <FormControlLabel
              control={<Checkbox checked={rec} onChange={(e)=> setRec(e.target.checked)} />}
              label="Recordarme en este equipo"
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.2,
                fontWeight: 700,
                textTransform: "none",
                backgroundColor: "#15703e",
                "&:hover": { backgroundColor: "#115c33" }
              }}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button variant="text" onClick={()=> alert("Pedile al admin el reset de contraseña.")}>
                ¿Olvidaste tu contraseña?
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

function parseError(err) {
  const code = err?.code || "";
  if (code.includes("auth/invalid-credential")) return "Email o contraseña incorrectos.";
  if (code.includes("auth/invalid-email")) return "Email inválido.";
  if (code.includes("auth/too-many-requests")) return "Demasiados intentos. Probá más tarde.";
  return "No se pudo iniciar sesión. Revisá tus datos.";
}
