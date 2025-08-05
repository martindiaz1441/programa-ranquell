// dataService.js

const STORAGE_KEYS = {
    PRODUCCION: "ranquelProduccion",
    INGRESOS: "ranquelIngresos",
    EGRESOS: "ranquelEgresos",
    STOCK: "ranquelStock",
    HISTORIAL: "ranquelHistorial",
  };
  
  export function guardarJornada({ produccion, ingresos, egresos, usuario, fecha }) {
    const historial = getHistorial();
    historial.push({
      fecha,
      produccion,
      ingresos,
      egresos,
      usuario,
    });
    localStorage.setItem(STORAGE_KEYS.HISTORIAL, JSON.stringify(historial));
  }
  
  export function getHistorial() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORIAL)) || [];
    } catch {
      return [];
    }
  }
  
  // --- Producción ---
  export function getProduccion() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCCION)) || [];
    } catch {
      return [];
    }
  }
  
  export function setProduccion(data) {
    localStorage.setItem(STORAGE_KEYS.PRODUCCION, JSON.stringify(data));
  }
  
  // --- Ingresos ---
  export function getIngresos() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.INGRESOS)) || [];
    } catch {
      return [];
    }
  }
  
  export function setIngresos(data) {
    localStorage.setItem(STORAGE_KEYS.INGRESOS, JSON.stringify(data));
  }
  
  // --- Egresos ---
  export function getEgresos() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.EGRESOS)) || [];
    } catch {
      return [];
    }
  }
  
  export function setEgresos(data) {
    localStorage.setItem(STORAGE_KEYS.EGRESOS, JSON.stringify(data));
  }
  
  // --- Stock ---
  export function getStock() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.STOCK)) || [];
    } catch {
      return [];
    }
  }
  
  export function setStock(data) {
    localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(data));
  }
  