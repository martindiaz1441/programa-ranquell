// src/components/AutoCompleteInput.jsx
import React, { useState } from "react";
import productos from "../data/productos";

export default function AutoCompleteInput({ value, onChange, placeholder }) {
  const [filtro, setFiltro] = useState("");

  const opciones = productos.filter(p =>
    p.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setFiltro(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        style={{ width: "100%" }}
      />
      {filtro && opciones.length > 0 && (
        <ul
          style={{
            position: "absolute",
            zIndex: 10,
            background: "#fff",
            listStyle: "none",
            padding: 0,
            margin: 0,
            width: "100%",
            border: "1px solid #ccc",
            maxHeight: "150px",
            overflowY: "auto"
          }}
        >
          {opciones.map((op, i) => (
            <li
              key={i}
              style={{ padding: "6px", cursor: "pointer" }}
              onClick={() => {
                onChange(op);
                setFiltro("");
              }}
            >
              {op}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
