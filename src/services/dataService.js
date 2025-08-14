// src/services/dataService.js
import {
  collection, doc, getDocs, setDoc, addDoc, updateDoc,
  onSnapshot, query, orderBy, serverTimestamp, increment
} from "firebase/firestore";
import { db, ensureAuth } from "./firebase";

// Colecciones
const colStock     = collection(db, "stock");
const colIngresos  = collection(db, "ingresos");
const colEgresos   = collection(db, "egresos");
const colHistorial = collection(db, "historial");
const colDrafts    = collection(db, "drafts");

// Util
const slugify = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// ---------- DRAFTS ----------
function draftDocRef(key, uid) {
  return doc(colDrafts, `${uid || "anon"}__${key}`);
}

export async function subscribeDraft(key, cb) {
  await ensureAuth(); // si falla, usa "anon"
  const ref = draftDocRef(key, (typeof window !== "undefined" && window?.firebaseAuthUid) || null);
  return onSnapshot(ref, (snap) => {
    const data = snap.data();
    cb(Array.isArray(data?.rows) ? data.rows : []);
  });
}
export async function updateDraft(key, rows) {
  const user = await ensureAuth();
  const ref = draftDocRef(key, user?.uid);
  await setDoc(ref, { rows, updatedAt: serverTimestamp() }, { merge: true });
}
export async function clearDraft(key) {
  await updateDraft(key, []);
}

// ---------- STOCK (lectura en vivo) ----------
export function subscribeStock(cb) {
  const q = query(colStock, orderBy("nombre"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}
export async function getStockOnce() {
  const q = query(colStock, orderBy("nombre"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
// upsert directo (admin edita)
export async function setStockItem(item) {
  const id = item.id || slugify(item.nombre);
  const ref = doc(colStock, id);
  const payload = {
    nombre: item.nombre,
    categoria: item.categoria || "otro",
    tipo: item.tipo || (item.kg ? "kg" : "unidad"),
    kg: Number(item.kg ?? 0),
    cantidad: Number(item.cantidad ?? 0),
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, payload, { merge: true });
  return id;
}
// helpers inc/dec
async function incStock({ id, nombre, categoria, tipo, kg = 0, unidades = 0 }) {
  const docId = id || slugify(nombre);
  const ref = doc(colStock, docId);
  const base = {
    nombre, categoria: categoria || "otro",
    tipo: tipo || (kg ? "kg" : "unidad"),
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, { kg: 0, cantidad: 0, ...base }, { merge: true });
  const inc = {};
  if ((tipo === "kg") || kg) inc.kg = increment(Number(kg) || 0);
  if ((tipo === "unidad") || unidades) inc.cantidad = increment(Number(unidades) || 0);
  inc.updatedAt = serverTimestamp();
  await updateDoc(ref, inc);
}
async function decStock({ id, nombre, categoria, tipo, kg = 0, unidades = 0 }) {
  await incStock({ id, nombre, categoria, tipo, kg: -(Number(kg) || 0), unidades: -(Number(unidades) || 0) });
}

// ---------- COMMITS ----------
export async function commitIngresos(rows, usuario = "Sistema") {
  await ensureAuth(); // si falla seguimos (tus reglas permiten write)
  const fecha = serverTimestamp();
  for (const r of rows) {
    const id = r.id || slugify(r.nombre);
    await addDoc(colIngresos, {
      ...r,
      id,
      fecha,
      usuario,
      tipo: r.tipo || (r.kg ? "kg" : "unidad"),
    });
    await incStock({
      id,
      nombre: r.nombre,
      categoria: r.categoria,
      tipo: r.tipo,
      kg: r.kg || 0,
      unidades: r.unidades || r.cantidad || 0,
    });
  }
  await addDoc(colHistorial, {
    tipo: "ingresos",
    cantidadRegistros: rows.length,
    fecha,
    usuario,
  });
}

export async function commitEgresos(rows, usuario = "Sistema") {
  await ensureAuth();
  const fecha = serverTimestamp();
  for (const r of rows) {
    const id = r.id || slugify(r.nombre);
    await addDoc(colEgresos, {
      ...r, id, fecha, usuario,
      tipo: r.tipo || (r.kg ? "kg" : "unidad"),
    });
    await decStock({
      id,
      nombre: r.nombre,
      categoria: r.categoria,
      tipo: r.tipo,
      kg: r.kg || 0,
      unidades: r.unidades || r.cantidad || 0,
    });
  }
  await addDoc(colHistorial, {
    tipo: "egresos",
    cantidadRegistros: rows.length,
    fecha,
    usuario,
  });
}

export async function commitProduccion(rows, usuario = "Sistema") {
  await ensureAuth();
  const fecha = serverTimestamp();
  for (const r of rows) {
    const id = r.id || slugify(r.nombre);
    await incStock({
      id,
      nombre: r.nombre,
      categoria: r.categoria,
      tipo: r.tipo,
      kg: r.kg || r.kgTotal || 0,
      unidades: r.unidades || 0,
    });
  }
  await addDoc(colHistorial, {
    tipo: "produccion",
    cantidadRegistros: rows.length,
    fecha,
    usuario,
  });
}

// ---------- HISTORIAL ----------
export function subscribeHistorial(cb) {
  const q = query(colHistorial, orderBy("fecha", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}
