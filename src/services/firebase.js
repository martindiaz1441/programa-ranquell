// src/services/firebase.js
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// 👉 TUS CREDENCIALES (tal cual me pasaste)
const firebaseConfig = {
  apiKey: "AIzaSyA8GpDbvKEjGryvZSNaxVylJ1WhUKmD1D0",
  authDomain: "ranquel-93bc3.firebaseapp.com",
  projectId: "ranquel-93bc3",
  storageBucket: "ranquel-93bc3.firebasestorage.app",
  messagingSenderId: "1052616371749",
  appId: "1:1052616371749:web:41670a46dbf76311cf59cc",
  measurementId: "G-CR1RNKHBX3",
};

export const app = initializeApp(firebaseConfig);

// Firestore con caché persistente (rápido/offline)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const auth = getAuth(app);

// 🔐 NUNCA tiramos error: si falla la sesión anónima, seguimos sin user
export async function ensureAuth() {
  try {
    if (auth.currentUser) return auth.currentUser;
    const { user } = await signInAnonymously(auth);
    return user;
  } catch (e) {
    console.warn("Anon auth falló, sigo sin user:", e?.code || e);
    return null; // seguimos sin usuario pero no bloquea escrituras (reglas permiten)
  }
}
