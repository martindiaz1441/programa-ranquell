// src/services/productService.js
import {
  collection, doc, setDoc, getDoc, onSnapshot, query, orderBy
} from "firebase/firestore";
import { db } from "./firebase";

const colCatalogo = collection(db, "catalogo");

let CAT = new Map(); // nombre normalizado -> { nombre, categoria, tipo, precio }
let LISTENING = false;
let LAST_ARRAY = [];

// Normalizadores
const slug = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
function normalizeNombre(s) {
  return slug(s).trim();
}

export function subscribeCatalogo() {
  if (LISTENING) return () => {};
  const q = query(colCatalogo, orderBy("nombre"));
  const off = onSnapshot(q, snap => {
    CAT.clear();
    LAST_ARRAY = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    LAST_ARRAY.forEach(p => CAT.set(normalizeNombre(p.nombre), p));
  });
  LISTENING = true;
  return off;
}

// Arrancamos la suscripción (una sola vez)
subscribeCatalogo();

export function findProducto(nombre) {
  return CAT.get(normalizeNombre(nombre)) || null;
}

export function getNombresCatalogo() {
  return LAST_ARRAY.map(p => p.nombre);
}

export function getCategorias() {
  const set = new Set(LAST_ARRAY.map(p => p.categoria || "General"));
  return Array.from(set).filter(Boolean).sort();
}

export async function addProductoCatalogo(nombre, meta = {}) {
  const n = String(nombre || "").trim();
  if (!n) return;
  const id = n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-");
  const payload = {
    nombre: n,
    categoria: meta.categoria || "General",
    tipo: meta.tipo === "unidad" ? "unidad" : "kg",
    precio: Number(meta.precio || 0),
    updatedAt: new Date(),
  };
  await setDoc(doc(colCatalogo, id), payload, { merge: true });
}

export async function bulkUpsertCatalog(rows = []) {
  // rows: [{ nombre, categoria?, tipo?, precio? }]
  for (const r of rows) {
    await addProductoCatalogo(r.nombre, {
      categoria: r.categoria,
      tipo: r.tipo,
      precio: r.precio,
    });
  }
}
