import { getAuth } from "firebase/auth";

/**
 * Verifica si el usuario actual tiene contraseña vinculada en Firebase
 * @returns {boolean} true si tiene password provider, false si no
 */
export const userHasPasswordProvider = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return false;
  }

  // Verificar si existe el provider "password" en providerData
  const hasPasswordProvider = user.providerData.some(
    (provider) => provider.providerId === "password"
  );

  return hasPasswordProvider;
};

/**
 * Obtiene todos los providers del usuario actual
 * @returns {Array<string>} Array con los IDs de los providers (ej: ['google.com', 'password'])
 */
export const getUserProviders = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return [];
  }

  return user.providerData.map((provider) => provider.providerId);
};

/**
 * Verifica si el usuario solo tiene Google como método de autenticación
 * @returns {boolean} true si solo tiene Google
 */
export const userHasOnlyGoogle = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return false;
  }

  const providers = user.providerData.map((p) => p.providerId);
  return providers.length === 1 && providers.includes("google.com");
};