// src/services/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

// >>> CONFIG DE TU PROYECTO (copiada de Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyA8GpDbvKEjGryvZSNaxVylJ1WhUKmD1D0",
  authDomain: "ranquel-93bc3.firebaseapp.com",
  projectId: "ranquel-93bc3",
  // Nota: el bucket estándar es *.appspot.com. Si en tu consola figura appspot.com, dejalo así:
  storageBucket: "ranquel-93bc3.appspot.com",
  // Si preferís, podés dejar el que pegaste:
  // storageBucket: "ranquel-93bc3.firebasestorage.app",
  messagingSenderId: "1052616371749",
  appId: "1:1052616371749:web:41670a46dbf76311cf59cc",
  // measurementId es opcional para Analytics; no lo usamos en esta app
  // measurementId: "G-CR1RNKHBX3"
};

// Inicialización única
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Servicios
export const db = getFirestore(app);
export const auth = getAuth(app);

// Autenticación anónima para poder usar Firestore
export async function ensureAuth() {
  try { await setPersistence(auth, browserLocalPersistence); } catch {}
  if (auth.currentUser) return auth.currentUser;
  const { user } = await signInAnonymously(auth);
  return user;
}
