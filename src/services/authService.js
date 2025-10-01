import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
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