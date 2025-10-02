import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  signOut 
} from "firebase/auth";
import { auth, googleProvider } from "../firebaseConfig";

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const token = await user.getIdToken();
  return { user, token };
};

export const signUpWithEmail = async (email, password) => {
  const r = await createUserWithEmailAndPassword(auth, email, password);
  const token = await r.user.getIdToken();
  return { user: r.user, token };
};

export const signInWithEmail = async (email, password) => {
  const r = await signInWithEmailAndPassword(auth, email, password);
  const token = await r.user.getIdToken();
  return { user: r.user, token };
};

export const linkPassword = async (password) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario autenticado");

  const credential = EmailAuthProvider.credential(user.email, password);
  
  await linkWithCredential(user, credential);
  
  return { success: true };
};

export const signOutAccount = async () => {
  try {
    await signOut(auth);
    // Limpiar localStorage
    localStorage.removeItem("firebaseToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    return { success: true };
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
};