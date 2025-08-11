// src/services/authService.js

// Usuarios locales opcionales (para login simple por nombre/clave)
const usuarios = [
  { nombre: "Martin", password: "1234", rol: "admin" },
  { nombre: "Orlando", password: "1234", rol: "user" },
  { nombre: "Gastón", password: "1234", rol: "user" },
  { nombre: "Matías", password: "1234", rol: "user" },
  { nombre: "Miguel", password: "1234", rol: "user" },
];

// Clave donde persistimos sesión
const LS_KEY = "ranquelUser";

// --- Login simple local (opcional) ---
export function login(nombre, password) {
  const user = usuarios.find(
    (u) =>
      u.nombre.toLowerCase() === (nombre || "").trim().toLowerCase() &&
      u.password === password
  );
  if (user) {
    localStorage.setItem(LS_KEY, JSON.stringify(user));
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(LS_KEY);
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw);

    // Normalizamos por si viene de un proveedor externo con email:
    // si el email coincide con el tuyo, lo tratamos como admin.
    if (u?.email && u.email.toLowerCase() === "martincbsn@gmail.com") {
      return { ...u, rol: "admin" };
    }
    return u;
  } catch {
    return null;
  }
}

// Admin si:
// - tiene rol 'admin' (login local) O
// - tiene email exacto 'martincbsn@gmail.com' (login externo)
export function isAdmin() {
  const u = getCurrentUser();
  if (!u) return false;
  if (u.rol === "admin") return true;
  if (u.email && u.email.toLowerCase() === "martincbsn@gmail.com") return true;
  return false;
}

export function getAllUsuarios() {
  return usuarios.map((u) => ({ nombre: u.nombre, rol: u.rol }));
}
