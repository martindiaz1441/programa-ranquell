import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../utils/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Button, TextField, Typography, Paper } from "@mui/material";

export default function Register({ onRegister }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async e => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pw);
      await setDoc(doc(db, "usuarios", userCredential.user.uid), {
        email,
        nombre,
        rol: "operario" // o "admin" si luego lo cambiás en Firestore
      });
      if (onRegister) onRegister();
    } catch (err) {
      setError("No se pudo registrar. Verifica los datos.");
    }
  };

  return (
    <Paper elevation={4} sx={{ p: 4, maxWidth: 350, mx: "auto", mt: 8 }}>
      <Typography variant="h5" align="center" gutterBottom>Crear cuenta</Typography>
      <form onSubmit={handleRegister}>
        <TextField
          label="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          fullWidth margin="normal"
          required
        />
        <TextField
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth margin="normal"
          required
        />
        <TextField
          label="Contraseña"
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          fullWidth margin="normal"
          required
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >Registrarme</Button>
      </form>
    </Paper>
  );
}
