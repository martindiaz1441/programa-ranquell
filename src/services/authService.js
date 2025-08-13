// src/services/authService.js

const LS_USER = "ranquel_current_user";
const PRICE_VIEWERS_KEY = "ranquelPriceViewers";

const PREDEFINED = [
  { nombre: "Martin",  email: "martincbsn@gmail.com", role: "admin" },
  { nombre: "Orlando", email: "orlando@ranquel.local", role: "user" },
  { nombre: "Gastón",  email: "gaston@ranquel.local",  role: "user" },
  { nombre: "Matías",  email: "matias@ranquel.local",  role: "user" },
  { nombre: "Miguel",  email: "miguel@ranquel.local",  role: "user" },
];

export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(LS_USER)) || null; }
  catch { return null; }
}

export function isAdmin() {
  const u = getCurrentUser();
  if (!u) return false;
  return (
    u.role === "admin" ||
    u.nombre === "Martin" ||
    (u.email || "").toLowerCase() === "martincbsn@gmail.com"
  );
}

export function loginEmailPassword(email, password, { remember = true } = {}) {
  return new Promise((resolve, reject) => {
    const e = String(email || "").trim().toLowerCase();
    const p = String(password || "");
    if (!e || !p) return reject({ code: "auth/invalid-credential" });

    const user =
      PREDEFINED.find(u => (u.email || "").toLowerCase() === e) ||
      PREDEFINED.find(u => u.nombre.toLowerCase() === e); // permite "Martin" en dev

    if (!user) return reject({ code: "auth/invalid-credential" });

    const session = { nombre: user.nombre, email: user.email, role: user.role };
    localStorage.setItem(LS_USER, JSON.stringify(session));
    resolve(session);
  });
}

export function logout() {
  localStorage.removeItem(LS_USER);
  return true;
}

// -------- Permisos de precios --------
export function getPriceViewers() {
  try { return JSON.parse(localStorage.getItem(PRICE_VIEWERS_KEY) || "[]"); }
  catch { return []; }
}

export function canSeePrices() {
  const u = getCurrentUser();
  if (!u) return false;
  if (isAdmin()) return true;
  const list = getPriceViewers().map(x => (x || "").toLowerCase());
  const id = (u.email || u.nombre || "").toLowerCase();
  return list.includes(id);
}

export function grantPriceAccess(identifier) {
  const id = (identifier || "").trim();
  if (!id) return getPriceViewers();
  const list = getPriceViewers();
  if (!list.map(x => x.toLowerCase()).includes(id.toLowerCase())) {
    list.push(id);
    localStorage.setItem(PRICE_VIEWERS_KEY, JSON.stringify(list));
  }
  return list;
}

export function revokePriceAccess(identifier) {
  const id = (identifier || "").trim().toLowerCase();
  const list = getPriceViewers().filter(x => x.toLowerCase() !== id);
  localStorage.setItem(PRICE_VIEWERS_KEY, JSON.stringify(list));
  return list;
}

// ---- Alias compatible ----
export { loginEmailPassword as login };
