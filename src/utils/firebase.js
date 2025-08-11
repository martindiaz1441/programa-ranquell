import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA8GpDbvKEjGryvZSNaxVylJ1WhUKmD1D0",
  authDomain: "ranquel-93bc3.firebaseapp.com",
  projectId: "ranquel-93bc3",
  storageBucket: "ranquel-93bc3.firebasestorage.app",
  messagingSenderId: "1052616371749",
  appId: "1:1052616371749:web:41670a46dbf76311cf59cc",
  measurementId: "G-CR1RNKHBX3"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
