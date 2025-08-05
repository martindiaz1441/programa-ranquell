// authService.js

const usuarios = [
    { nombre: "Martin", password: "1234", rol: "admin" },
    { nombre: "Orlando", password: "1234", rol: "user" },
    { nombre: "Gastón", password: "1234", rol: "user" },
    { nombre: "Matías", password: "1234", rol: "user" },
    { nombre: "Miguel", password: "1234", rol: "user" },
  ];
  
  export function login(nombre, password) {
    const user = usuarios.find(
      (u) =>
        u.nombre.toLowerCase() === nombre.trim().toLowerCase() &&
        u.password === password
    );
    if (user) {
      localStorage.setItem("ranquelUser", JSON.stringify(user));
      return true;
    }
    return false;
  }
  
  export function logout() {
    localStorage.removeItem("ranquelUser");
  }
  
  export function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("ranquelUser"));
    } catch {
      return null;
    }
  }
  
  export function isAdmin() {
    const u = getCurrentUser();
    return u && u.rol === "admin";
  }
  
  export function getAllUsuarios() {
    return usuarios.map(u => ({ nombre: u.nombre, rol: u.rol }));
  }
  