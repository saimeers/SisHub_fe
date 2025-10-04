export const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    // Errores de login
    "auth/user-not-found": "No existe una cuenta con este correo electrónico.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-email": "El correo electrónico no es válido.",
    "auth/user-disabled": "Esta cuenta ha sido deshabilitada.",
    "auth/invalid-credential": "Credenciales inválidas. Verifica tu correo y contraseña.",
    "auth/too-many-requests": "Demasiados intentos fallidos. Intenta más tarde.",
    
    // Errores de registro
    "auth/email-already-in-use": "Este correo ya está registrado. Intenta iniciar sesión.",
    "auth/weak-password": "La contraseña es muy débil. Usa al menos 6 caracteres.",
    "auth/operation-not-allowed": "Operación no permitida. Contacta al administrador.",
    
    // Errores de Google
    "auth/popup-closed-by-user": "Inicio de sesión cancelado.",
    "auth/popup-blocked": "Popup bloqueado. Permite popups para este sitio.",
    "auth/cancelled-popup-request": "Solicitud cancelada.",
    "auth/account-exists-with-different-credential": 
      "Ya existe una cuenta con este correo usando otro método de inicio de sesión.",
    
    // Errores de red
    "auth/network-request-failed": "Error de conexión. Verifica tu internet.",
    "auth/timeout": "La operación ha expirado. Intenta de nuevo.",
    
    // Errores generales
    "auth/internal-error": "Error interno del servidor. Intenta más tarde.",
    "auth/invalid-api-key": "Configuración incorrecta. Contacta al administrador.",
  };

  return errorMessages[errorCode] || "Error al procesar tu solicitud. Intenta de nuevo.";
};