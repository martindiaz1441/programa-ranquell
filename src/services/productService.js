// src/services/productService.js
// Catálogo de productos en LocalStorage con soporte para "tipo"/"unidad",
// migración automática y *búsqueda inteligente* por nombre (tolerante a variantes).

const LS_V2 = "ranquelProductosV2"; // objetos {nombre, tipo, categoria, precio}

const BASE = [
  { nombre:"Suprema",      tipo:"kg",     categoria:"Aves",   precio:0 },
  { nombre:"Alitas",       tipo:"kg",     categoria:"Aves",   precio:0 },
  { nombre:"Cogote",       tipo:"kg",     categoria:"Aves",   precio:0 },
  { nombre:"Grasa",        tipo:"kg",     categoria:"Aves",   precio:0 },
  { nombre:"Pollo Entero", tipo:"unidad", categoria:"Aves",   precio:0 },
];

/* ================== Normalización & similitud ================== */
function normBasic(s) {
  return String(s || "").toLowerCase().trim();
}
function normMatch(s) {
  return String(s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/[^\w\s]+/g, " ")                        // puntuación -> espacio
    .replace(/\s+/g, " ")                             // colapsa espacios
    .toLowerCase().trim();
}
// bigramas para similitud de Sørensen–Dice (rápida y robusta)
function bigrams(str) {
  const s = normMatch(str);
  const set = new Set();
  for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
  return set;
}
function similarity(a, b) {
  if (!a && !b) return 1;
  if (a === b) return 1;
  const A = bigrams(a), B = bigrams(b);
  if (!A.size && !B.size) return 1;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return (2 * inter) / (A.size + B.size);
}

/* ================== Normalizador de catálogo ================== */
function normalize(list) {
  const byKey = new Map();
  (list || []).forEach(p => {
    const key = normBasic(p?.nombre);
    if (!key) return;

    // Acepta p.tipo o p.unidad; también tolera p.costo como alias de precio
    const tipoRaw = (p?.tipo ?? p?.unidad);
    const tipo = String(tipoRaw).toLowerCase() === "unidad" ? "unidad" : "kg";
    const categoria = (p?.categoria || p?.cat || "General").toString().trim();
    const precioNum = Number(p?.precio ?? p?.costo ?? 0);

    byKey.set(key, {
      nombre: (p?.nombre || "").toString().trim(),
      tipo,
      categoria,
      precio: Number.isFinite(precioNum) ? precioNum : 0
    });
  });

  return Array.from(byKey.values())
    .sort((a,b)=> a.nombre.localeCompare(b.nombre, "es", { sensitivity:"base" }));
}

function loadRaw() {
  try {
    const raw = localStorage.getItem(LS_V2);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function save(list) {
  const norm = normalize(list);
  localStorage.setItem(LS_V2, JSON.stringify(norm));
}
function load() {
  const raw = loadRaw();
  if (!raw) {
    localStorage.setItem(LS_V2, JSON.stringify(BASE));
    return [...BASE];
  }
  const norm = normalize(raw);
  localStorage.setItem(LS_V2, JSON.stringify(norm));
  return norm;
}

/* ================== API pública ================== */
export function getCatalogo() { return load(); }

// BORRA TODO y guarda lo nuevo (se usa al importar Excel/JSON del catálogo)
export function setCatalogo(items = []) {
  save(items);           // acepta {nombre, categoria, precio, tipo|unidad}
  return getCatalogo();  // devuelto ya normalizado
}

export function getNombresCatalogo() { return load().map(p => p.nombre); }
export function getCategorias() {
  return Array.from(new Set(load().map(p => p.categoria || "General"))).sort();
}

/**
 * Búsqueda inteligente por nombre:
 *  1) exacto (case-insensitive)
 *  2) exacto flexible (sin tildes/puntuación/espacios múltiples)
 *  3) mejor similitud por bigramas (umbral >= 0.86)
 */
export function findProducto(nombre) {
  const arr = load();
  const qBasic = normBasic(nombre);
  const qFlex  = normMatch(nombre);

  // 1) exacto por lower/trim
  let hit = arr.find(p => normBasic(p.nombre) === qBasic);
  if (hit) return hit;

  // 2) exacto flexible
  hit = arr.find(p => normMatch(p.nombre) === qFlex);
  if (hit) return hit;

  // 3) mejor similitud
  let best = null, bestScore = 0;
  for (const p of arr) {
    const s = similarity(qFlex, p.nombre);
    if (s > bestScore) { bestScore = s; best = p; }
  }
  if (best && bestScore >= 0.86) return best;

  return null;
}

export function addProductoCatalogo(nombre, datos = {}) {
  const list = load();
  const n = (nombre || "").trim();
  if (!n) return { error:"Nombre vacío" };
  if (list.find(p => p.nombre.toLowerCase() === n.toLowerCase())) return { ok:true };

  list.push({
    nombre: n,
    tipo: (datos.tipo ?? datos.unidad) === "unidad" ? "unidad" : "kg",
    categoria: (datos.categoria || "General").trim(),
    precio: Number(datos.precio ?? datos.costo ?? 0)
  });
  save(list);
  return { ok:true };
}

// Inserta/actualiza por nombre (consolidado)
export function upsertProductoCatalogo(item) {
  const list = load();
  const n = (item?.nombre || "").trim();
  if (!n) return { error: "Nombre requerido" };

  const idx = list.findIndex(p => p.nombre.toLowerCase() === n.toLowerCase());
  const tipo = (item?.tipo ?? item?.unidad) === "unidad" ? "unidad" : "kg";
  const categoria = (item?.categoria || (idx >= 0 ? list[idx].categoria : "General")).trim();
  const precio = Number(item?.precio ?? item?.costo ?? (idx >= 0 ? list[idx].precio : 0));

  if (idx === -1) list.push({ nombre:n, tipo, categoria, precio });
  else list[idx] = { nombre:n, tipo, categoria, precio };

  save(list);
  return getCatalogo();
}

export function updateProductoCatalogo(originalName, nuevo) {
  const list = load();
  const idx = list.findIndex(p => p.nombre.toLowerCase().trim() === (originalName||"").toLowerCase().trim());
  if (idx === -1) return { error:"No existe" };

  const tipo = (nuevo?.tipo ?? nuevo?.unidad ?? list[idx].tipo) === "unidad" ? "unidad" : "kg";
  const categoria = (nuevo?.categoria ?? list[idx].categoria).toString().trim();
  const precio = Number(nuevo?.precio ?? nuevo?.costo ?? list[idx].precio);

  const nuevoNombre = (nuevo?.nombre ?? list[idx].nombre).toString().trim();
  if (list.some((p,i)=> i!==idx && p.nombre.toLowerCase().trim() === nuevoNombre.toLowerCase().trim()))
    return { error:"Ya existe un producto con ese nombre" };

  list[idx] = { nombre: nuevoNombre, tipo, categoria, precio };
  save(list);
  return { ok:true };
}

export function removeProductoCatalogo(nombre) {
  const list = load().filter(p => p.nombre.toLowerCase().trim() !== (nombre||"").toLowerCase().trim());
  save(list);
  return { ok:true };
}
