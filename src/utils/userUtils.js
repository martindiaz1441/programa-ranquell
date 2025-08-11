import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export const getUserData = async (uid) => {
  const userDoc = await getDoc(doc(db, "usuarios", uid));
  return userDoc.exists() ? userDoc.data() : null;
};
