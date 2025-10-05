import { createContext, useContext, useState, useEffect } from 'react';
import { getAuthInstance } from '../services/authService';
import { obtenerUsuario } from '../services/userServices';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('firebaseToken'));

  useEffect(() => {
    const auth = getAuthInstance();

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 🔑 Obtener el token actualizado
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
          localStorage.setItem('firebaseToken', idToken);

          // 🧍‍♂️ Guardar usuario de Firebase
          setUser(firebaseUser);

          // 📡 Intentar obtener datos del backend
          const userInfo = await obtenerUsuario();

          if (userInfo && typeof userInfo === 'object') {
            setUserData(userInfo);
          } else {
            console.warn('⚠️ No se encontró información del usuario en el backend');
            setUserData(null);
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          setUser(null);
          setUserData(null);
          setToken(null);
          localStorage.removeItem('firebaseToken');
        } finally {
          setLoading(false);
        }
      } else {
        // 🔒 Usuario no autenticado
        setUser(null);
        setUserData(null);
        setToken(null);
        localStorage.removeItem('firebaseToken');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    token,
    loading,
    isAuthenticated: !!user,
    rol: userData?.Rol?.descripcion || null,
    estado: userData?.Estado?.descripcion || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
