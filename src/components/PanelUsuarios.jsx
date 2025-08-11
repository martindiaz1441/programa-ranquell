import React, { useState, useEffect } from "react";
// si firebase está en src/utils/firebase.js, la ruta correcta desde components es:
import { auth, db } from "../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import Navbar from "./Navbar";
import Login from "./Login";

// ⚠️ eliminar esta línea si la tenías
// import PanelUsuarios from "./PanelUsuarios";

const PanelUsuarios = () => {
  // ...tu lógica actual
  return (
    <>
      <Navbar />
      {/* tu UI */}
    </>
  );
};

export default PanelUsuarios;
