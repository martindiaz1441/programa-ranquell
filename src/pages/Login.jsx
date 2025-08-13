// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, TextField, Button, Typography,
  IconButton, InputAdornment, Alert, FormControlLabel, Checkbox, Divider
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import logo from "../assets/logo.png";
import { login, loginEmailPassword, getCurrentUser } from "../services/authService";

export default function Login() {
  const nav = useNavigate();
  const [usuario, setUsuario] = useState(""); // Email o Usuario
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [rec, setRec] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Si ya hay sesión, mandamos al Home
  useEffect(() => {
    const u = getCurrentUser();
    if (u) nav("/");
  }, [nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const isEmail = (usuario || "").includes("@");
      let ok = false;

      if (isEmail) {
        // Login por email (queda admin si es martincbsn@gmail.com)
        ok = await loginEmailPassword(usuario, pass, { remember: rec });
        if (!ok) throw mkError("auth/invalid-credential");
      } else {
        // Login local por usuario
        ok = login(usuario, pass);
        if (!ok) throw mkError("auth/invalid-credential");
      }

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
      p: 2
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
            Accedé con <b>email o usuario</b>.
          </Typography>

          {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

          <form onSubmit={onSubmit}>
            <TextField
              label="Email o Usuario"
              value={usuario}
              onChange={(e)=> setUsuario(e.target.value)}
              fullWidth
              required
              autoFocus
              autoComplete="username"
              placeholder="martincbsn@gmail.com  ó  Martin"
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

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary">
            <b>Usuarios locales (demo):</b> Martin (admin), Orlando, Gastón, Matías, Miguel. Contraseña: <b>1234</b>.
            <br />
            <b>Admin por email:</b> usá <code>martincbsn@gmail.com</code>.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

function parseError(err) {
  const code = err?.code || "";
  if (code.includes("auth/invalid-credential")) return "Email/usuario o contraseña incorrectos.";
  if (code.includes("auth/invalid-email")) return "Email inválido.";
  if (code.includes("auth/too-many-requests")) return "Demasiados intentos. Probá más tarde.";
  return "No se pudo iniciar sesión. Revisá tus datos.";
}

function mkError(code) {
  const e = new Error(code);
  e.code = code;
  return e;
}
