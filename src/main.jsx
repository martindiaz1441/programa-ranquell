// src/main.jsx
import 'fast-text-encoding';   // Polyfill TextEncoder/TextDecoder (Firestore)
import 'whatwg-fetch';         // Polyfill fetch para navegadores viejos

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import "./App.css";
import "./styles/responsive.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
