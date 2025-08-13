// src/services/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA8GpDbvKEjGryvZSNaxVylJ1WhUKmD1D0",
  authDomain: "ranquel-93bc3.firebaseapp.com",
  projectId: "ranquel-93bc3",
  // Usamos el bucket estándar appspot.com (con firebasestorage.app también funciona).
  storageBucket: "ranquel-93bc3.appspot.com",
  messagingSenderId: "1052616371749",
  appId: "1:1052616371749:web:41670a46dbf76311cf59cc",
  // measurementId: "G-CR1RNKHBX3" // opcional, no lo usamos
};

// Validación defensiva y log enmascarado para verificar en prod.
(function () {
  if (!firebaseConfig.apiKey || !firebaseConfig.appId || !firebaseConfig.messagingSenderId) {
    throw new Error("Firebase sin configurar: faltan apiKey/appId/messagingSenderId.");
  }
  const mask = (s) => (s ? s.slice(0, 6) + "..." + s.slice(-4) : "n/a");
  // Ver vas a ver este log en producción si la config llegó bien
  console.log("[Firebase] config OK:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    apiKey: mask(firebaseConfig.apiKey),
  });
})();

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export async function ensureAuth() {
  try { await setPersistence(auth, browserLocalPersistence); } catch {}
  if (auth.currentUser) return auth.currentUser;
  const { user } = await signInAnonymously(auth);
  return user;
}
