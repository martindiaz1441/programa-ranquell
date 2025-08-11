// src/services/dataService.js
// LocalStorage + lógica de stock + auditoría + desposte (solo descuenta origen)

const LS_KEYS = {
  STOCK: "ranquel_stock",
  PRODUCCION: "ranquel_produccion_draft",
  INGRESOS: "ranquel_ingresos_draft",
  EGRESOS: "ranquel_egresos_draft",
  HISTORIAL: "ranquel_historial", // jornadas (si las usás)
  AUDIT: "ranquel_audit"          // NUEVO: bitácora de cambios
};

// Catálogo base (se agrega dinámicamente con stock y destinos conocidos)
const CORTES_BASE = [
  "Suprema","Cogote","Alitas","Grasa","Molleja","Carcasa",
  "Hígado","Corazón","Piel","Desecho"
];

// Orígenes válidos para DESPOSTE (puede editar/expandir)
export const ORIGENES_DESPOSTE = [
  "Media Res",
  "Vaca Entera",
  "Cuarto Trasero",
  "Cuarto Delantero",
  "Pollo Entero"
];

// ----------------- helpers LS -----------------
function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
const nowIso = () => new Date().toISOString();
const norm = s => (s||"").toString().trim().toLowerCase();

// ----------------- STOCK -----------------
export function getStock(){ return read(LS_KEYS.STOCK, []); }
export function setStock(arr){ write(LS_KEYS.STOCK, arr); }

function findIndexByName(stock, producto) {
  const n = norm(producto);
  return stock.findIndex(s => norm(s.producto) === n);
}

export function addToStock(producto, kg = 0, unidades = 0, user = "Sistema") {
  const stock = getStock();
  const i = findIndexByName(stock, producto);
  if (i >= 0) {
    stock[i].kg = Number(stock[i].kg || 0) + Number(kg || 0);
    stock[i].unidades = Number(stock[i].unidades || 0) + Number(unidades || 0);
  } else {
    stock.push({ producto, kg: Number(kg || 0), unidades: Number(unidades || 0) });
  }
  setStock(stock);
  logCambio({
    tipo: "ingreso",
    producto, deltaKg: Number(kg||0), deltaU: Number(unidades||0), usuario: user
  });
  return stock;
}

export function removeFromStock(producto, kg = 0, unidades = 0, user = "Sistema") {
  const stock = getStock();
  const i = findIndexByName(stock, producto);
  const dKg = -Number(kg || 0);
  const dU = -Number(unidades || 0);

  if (i >= 0) {
    stock[i].kg = Number(stock[i].kg || 0) + dKg;
    stock[i].unidades = Number(stock[i].unidades || 0) + dU;
  } else {
    stock.push({ producto, kg: dKg, unidades: dU });
  }
  setStock(stock);
  logCambio({
    tipo: "egreso",
    producto, deltaKg: dKg, deltaU: dU, usuario: user
  });
  return stock;
}

// ----------------- BORRADORES UI -----------------
export function getProduccion(){ return read(LS_KEYS.PRODUCCION, []); }
export function setProduccion(arr){ write(LS_KEYS.PRODUCCION, arr); }

export function getIngresos(){ return read(LS_KEYS.INGRESOS, []); }
export function setIngresos(arr){ write(LS_KEYS.INGRESOS, arr); }

export function getEgresos(){ return read(LS_KEYS.EGRESOS, []); }
export function setEgresos(arr){ write(LS_KEYS.EGRESOS, arr); }

// ----------------- JORNADAS (opcional) -----------------
export function getHistorial(){ return read(LS_KEYS.HISTORIAL, []); }
export function pushHistorial(entry){
  const h = getHistorial();
  h.push(entry);
  write(LS_KEYS.HISTORIAL, h);
}

// ----------------- AUDITORÍA (bitácora) -----------------
export function getAudit(){ return read(LS_KEYS.AUDIT, []); }
export function logCambio({tipo, producto, deltaKg=0, deltaU=0, usuario="Sistema", meta=null}){
  const audit = getAudit();
  audit.push({
    ts: nowIso(),
    fecha: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),
    tipo,       // ingreso | egreso | desposte | produccion
    producto,   // nombre
    deltaKg: Number(deltaKg||0),
    deltaU: Number(deltaU||0),
    usuario,
    meta
  });
  write(LS_KEYS.AUDIT, audit);
}

// ----------------- CATÁLOGO / AUTOCOMPLETE -----------------
export function getCatalogoProductos(){
  const stock = getStock().map(s=>s.producto);
  const unique = new Set([
    ...CORTES_BASE,
    ...stock,
    ...ORIGENES_DESPOSTE
  ].filter(Boolean));
  return Array.from(unique);
}

export function filtrarProductosSmart(query=""){
  const q = norm(query);
  if(!q) return getCatalogoProductos();
  return getCatalogoProductos().filter(p => norm(p).includes(q));
}

// ----------------- DESPOSTE (solo descuenta origen) -----------------
// Descuenta kg y/o unidades del producto origen. NO agrega cortes.
export function despostarProducto(origen, kgOrigen=0, unidadesOrigen=0, user="Sistema"){
  const kg = Number(kgOrigen||0);
  const u  = Number(unidadesOrigen||0);
  if(!origen) return { error: "Elegí un producto origen." };
  if(!ORIGENES_DESPOSTE.includes(origen)) {
    return { error: `El origen "${origen}" no está en la lista de desposte.` };
  }
  removeFromStock(origen, kg, u, user);
  logCambio({
    tipo: "desposte",
    producto: origen,
    deltaKg: -kg,
    deltaU: -u,
    usuario: user,
    meta: { origen }
  });
  return { ok: true, origen, kg, unidades: u };
}
// --- Historial helpers ---
export function setHistorial(lista) {
  localStorage.setItem(STORAGE_KEYS.HISTORIAL, JSON.stringify(lista || []));
}

export function clearHistorial() {
  localStorage.removeItem(STORAGE_KEYS.HISTORIAL);
}

export function removeJornadaByIndex(idx) {
  const hist = getHistorial();
  if (idx >= 0 && idx < hist.length) {
    hist.splice(idx, 1);
    setHistorial(hist);
  }
  return getHistorial();
}
