import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
    deleteUser
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
    localStorage.removeItem("firebaseToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    return { success: true };
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
};

export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: "http://localhost:5173/reset-password", // 👈 URL personalizada
      handleCodeInApp: true,
    });
    return { success: true };
  } catch (error) {
    console.error("Error al enviar email de recuperación:", error);
    throw error;
  }
};

export const verifyResetCode = async (oobCode) => {
  try {
    const email = await verifyPasswordResetCode(auth, oobCode);
    return email;
  } catch (error) {
    console.error("Error al verificar código:", error);
    throw error;
  }
};


export const confirmNewPassword = async (oobCode, newPassword) => {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
    return { success: true };
  } catch (error) {
    console.error("Error al confirmar nueva contraseña:", error);
    throw error;
  }
};

export const deleteCurrentUser = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No hay usuario autenticado");
    
    await deleteUser(user);
    
    localStorage.removeItem("firebaseToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("rolSeleccionado");
    
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const getAuthInstance = () => {
  return auth;
};