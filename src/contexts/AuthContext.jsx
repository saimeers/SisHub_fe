import { createContext, useContext, useState, useEffect } from 'react';
import { getAuthInstance, signOutAccount } from '../services/authService';
import { obtenerUsuario } from '../services/userServices';
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
                    } catch {
                        setUserData(null);
                    }
                } catch (error) {
                    setUser(null);
                    setUserData(null);
                    setToken(null);
                    localStorage.removeItem("firebaseToken");
                } finally {
                    setLoading(false);
                }
            } else {
                setUser(null);
                setUserData(null);
                setToken(null);
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
        isAuthenticated: !!user,
        rol: userData?.Rol?.descripcion || null,
        estado: userData?.Estado?.descripcion || null,
        handleSignOut
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};