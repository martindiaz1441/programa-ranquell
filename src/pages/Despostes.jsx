import React from "react";
import { Button, Typography } from "@mui/material";

export default function Despostes({ onBack }) {
  return (
    <div>
      <Typography variant="h4" gutterBottom>Desposte</Typography>
      <Typography>
        Acá irá la gestión de desposte profesional. Pronto te paso la versión completa.<br />
        Por ahora, este archivo solo existe para que la app funcione y puedas navegar.
      </Typography>
      <Button variant="contained" sx={{ mt: 2 }} onClick={onBack}>Volver al menú</Button>
    </div>
  );
}
