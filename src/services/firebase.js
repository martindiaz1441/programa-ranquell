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
  storageBucket: "ranquel-93bc3.appspot.com", // OK usar appspot.com
  messagingSenderId: "1052616371749",
  appId: "1:1052616371749:web:41670a46dbf76311cf59cc",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export async function ensureAuth() {
  try { await setPersistence(auth, browserLocalPersistence); } catch {}
  if (auth.currentUser) return auth.currentUser;
  const { user } = await signInAnonymously(auth);
  return user;
}
