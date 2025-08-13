// src/components/AutoCompleteInput.jsx
import React, { useEffect, useRef, useState } from "react";
import productosBase from "../data/productos";

export default function AutoCompleteInput({
  value,
  onChange,
  placeholder,
  suggestions,   // opcional: lista de strings para sugerir
  inputRef       // opcional: ref del input (para focus externo)
}) {
  const [filtro, setFiltro] = useState("");
  const [open, setOpen] = useState(false);
  const localRef = useRef(null);
  const ref = inputRef || localRef;

  const opcionesFuente = Array.isArray(suggestions) && suggestions.length > 0
    ? suggestions
    : Array.isArray(productosBase) ? productosBase : [];

  const opciones = (opcionesFuente || []).filter(p =>
    String(p || "").toLowerCase().includes(String(filtro || "").toLowerCase())
  ).slice(0, 50);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.parentElement?.contains(e.target)) setOpen(false);
    };
    window.addEventListener("click", onClick, { passive: true });
    return () => window.removeEventListener("click", onClick);
  }, [open]);

  return (
    <div className="autocomplete-wrap">
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => { setFiltro(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        inputMode="search"
      />
      {open && filtro && opciones.length > 0 && (
        <ul className="autocomplete-list">
          {opciones.map((op, i) => (
            <li
              key={op + i}
              className="autocomplete-item"
              onMouseDown={(e)=> e.preventDefault()}
              onClick={() => { onChange(op); setFiltro(""); setOpen(false); }}
            >
              {op}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
