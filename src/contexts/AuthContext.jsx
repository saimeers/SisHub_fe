import { createContext, useContext, useState, useEffect } from 'react';
import { getAuthInstance, signOutAccount } from '../services/authService';
import { obtenerUsuario } from '../services/userServices';
import { userHasPasswordProvider } from '../modules/auth/utils/passwordValidator';
import { useNavigate } from 'react-router-dom';

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
    const [needsPassword, setNeedsPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuthInstance();

        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const idToken = await firebaseUser.getIdToken();
                    setToken(idToken);
                    localStorage.setItem("firebaseToken", idToken);
                    setUser(firebaseUser);

                    // ✅ Intentar cargar desde cache primero
                    const cachedUserData = localStorage.getItem("userData");
                    let hasCachedData = false;
                    
                    if (cachedUserData) {
                        try {
                            const parsedData = JSON.parse(cachedUserData);
                            
                            // ✅ Solo usar cache si tiene datos válidos
                            if (parsedData?.Rol?.descripcion) {
                                setUserData(parsedData);
                                hasCachedData = true;

                                const rol = parsedData.Rol.descripcion;
                                const hasPassword = userHasPasswordProvider();

                                if (rol === "DOCENTE" && !hasPassword) {
                                    setNeedsPassword(true);
                                } else {
                                    setNeedsPassword(false);
                                }
                                
                                // ✅ Si hay cache válido, quitar loading inmediatamente
                                setLoading(false);
                            }
                        } catch (e) {
                            console.error("Error parsing cached userData:", e);
                        }
                    }

                    // Hacer la petición para actualizar/obtener datos frescos
                    try {
                        const userInfo = await obtenerUsuario();
                        setUserData(userInfo);

                        // Actualizar cache
                        localStorage.setItem("userData", JSON.stringify(userInfo));

                        const rol = userInfo?.Rol?.descripcion || userInfo?.data?.Rol?.descripcion;
                        const hasPassword = userHasPasswordProvider();

                        if (rol === "DOCENTE" && !hasPassword) {
                            setNeedsPassword(true);
                        } else {
                            setNeedsPassword(false);
                        }
                    } catch (error) {
                        // ✅ Si falla y NO hay cache, marcar userData como null
                        if (!hasCachedData) {
                            setUserData(null);
                            setNeedsPassword(false);
                        }
                        // Si hay cache, mantener los datos cacheados
                    } finally {
                        // ✅ Siempre quitar loading al final
                        setLoading(false);
                    }
                } catch (error) {
                    console.error("Error in auth state change:", error);
                    setUser(null);
                    setUserData(null);
                    setToken(null);
                    setNeedsPassword(false);
                    localStorage.removeItem("firebaseToken");
                    localStorage.removeItem("userData");
                    setLoading(false);
                }
            } else {
                setUser(null);
                setUserData(null);
                setToken(null);
                setNeedsPassword(false);
                localStorage.removeItem("firebaseToken");
                localStorage.removeItem("userData");
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        try {
            await signOutAccount();
            
            // ✅ NO borrar userData inmediatamente, solo al navegar
            const userDataBackup = localStorage.getItem("userData");
            
            localStorage.clear();
            
            setUser(null);
            setUserData(null);
            setToken(null);
            setNeedsPassword(false);
            
            navigate("/login");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            // En caso de error, igual limpiar
            localStorage.clear();
            navigate("/login");
        }
    };

    const value = {
        user,
        userData,
        token,
        loading,
        needsPassword,
        isAuthenticated: !!user,
        rol: userData?.Rol?.descripcion || userData?.data?.Rol?.descripcion || null,
        estado: userData?.Estado?.descripcion || userData?.data?.Estado?.descripcion || null,
        handleSignOut
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};