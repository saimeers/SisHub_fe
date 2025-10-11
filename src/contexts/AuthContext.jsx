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

                    try {
                        const userInfo = await obtenerUsuario();
                        setUserData(userInfo);

                        // ✅ Verificar si es docente y no tiene contraseña
                        const rol = userInfo?.Rol?.descripcion || userInfo?.data?.Rol?.descripcion;
                        const hasPassword = userHasPasswordProvider();
                        
                        if (rol === "DOCENTE" && !hasPassword) {
                            setNeedsPassword(true);
                        } else {
                            setNeedsPassword(false);
                        }
                    } catch {
                        setUserData(null);
                        setNeedsPassword(false);
                    }
                } catch (error) {
                    setUser(null);
                    setUserData(null);
                    setToken(null);
                    setNeedsPassword(false);
                    localStorage.removeItem("firebaseToken");
                } finally {
                    setLoading(false);
                }
            } else {
                setUser(null);
                setUserData(null);
                setToken(null);
                setNeedsPassword(false);
                localStorage.removeItem("firebaseToken");
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        try {
            await signOutAccount();
            localStorage.clear();
            setUser(null);
            setUserData(null);
            setToken(null);
            setNeedsPassword(false);
            navigate("/login");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
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