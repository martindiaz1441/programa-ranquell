// src/components/AutoCompleteInput.jsx
import React, { useEffect, useRef, useState } from "react";
import productosBase from "../data/productos";

export default function AutoCompleteInput({
  value,
  onChange,
  placeholder,
  suggestions, // opcional: lista de strings
  inputRef     // opcional: ref externo para focus
}) {
  const [filtro, setFiltro] = useState("");
  const [open, setOpen] = useState(false);
  const localRef = useRef(null);
  const ref = inputRef || localRef;

  const fuente =
    Array.isArray(suggestions) && suggestions.length
      ? suggestions
      : Array.isArray(productosBase)
      ? productosBase
      : [];

  const opciones = (fuente || [])
    .filter((p) =>
      String(p || "").toLowerCase().includes(String(filtro || "").toLowerCase())
    )
    .slice(0, 50);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!ref.current) return;
      const wrap = ref.current.closest(".autocomplete-wrap");
      if (wrap && !wrap.contains(e.target)) setOpen(false);
    };
    window.addEventListener("click", onClick, { passive: true });
    return () => window.removeEventListener("click", onClick);
  }, [open, ref]);

  return (
    <div className="autocomplete-wrap" style={{ position: "relative" }}>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => {
          setFiltro(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        style={{ width: "100%" }}
        autoComplete="off"
        inputMode="search"
      />
      {open && filtro && opciones.length > 0 && (
        <ul
          className="autocomplete-list"
          style={{
            position: "absolute",
            zIndex: 10,
            background: "#fff",
            listStyle: "none",
            padding: 0,
            margin: 0,
            width: "100%",
            border: "1px solid #ccc",
            maxHeight: "180px",
            overflowY: "auto",
          }}
        >
          {opciones.map((op, i) => (
            <li
              key={op + i}
              className="autocomplete-item"
              style={{ padding: "6px 8px", cursor: "pointer" }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(op);
                setFiltro("");
                setOpen(false);
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
