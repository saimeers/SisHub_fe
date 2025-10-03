export const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    "auth/user-not-found": "No existe una cuenta con ese correo",
    "auth/wrong-password": "Contraseña incorrecta",
    "auth/invalid-credential": "Credenciales inválidas.",
    "auth/invalid-email": "El formato del correo es inválido",
    "auth/missing-password": "Por favor ingresa tu contraseña",
    "auth/too-many-requests": "Demasiados intentos fallidos. Intenta más tarde",
    "auth/popup-closed-by-user": "Cerraste la ventana de inicio de sesión",
    "auth/cancelled-popup-request": "Operación cancelada",
    "auth/popup-blocked": "El navegador bloqueó la ventana emergente",
  };

  return errorMessages[errorCode] || "Error al iniciar sesión. Verifica tus credenciales";
};