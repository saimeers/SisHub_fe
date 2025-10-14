import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen } from '../ui/LoadingScreen';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, rol, estado, loading, needsPassword, userData } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // ✅ IMPORTANTE: Solo redirigir a complete-profile si:
    // 1. No tiene rol Y
    // 2. Ya intentó cargar userData (userData es null después de la carga)
    // 3. No está ya en la página de complete-profile
    if (!rol && !loading && location.pathname !== "/complete-profile") {
        // ✅ Verificar que realmente no tenga datos, no solo que esté cargando
        if (userData === null) {
            return <Navigate to="/complete-profile" replace />;
        }
    }

    // Si está en espera
    if (estado === "STAND_BY" && location.pathname !== "/account-pending") {
        return <Navigate to="/account-pending" replace />;
    }

    // ✅ Si es docente y no tiene contraseña, redirigir a establecer contraseña
    if (needsPassword && location.pathname !== "/establecer-contrasena") {
        return <Navigate to="/establecer-contrasena" replace />;
    }

    // 🔹 Redirigir automáticamente al dashboard de su rol
    if (rol && location.pathname === "/") {
        return <Navigate to={`/${rol.toLowerCase()}/dashboard`} replace />;
    }

    // Validación de roles permitidos
    if (allowedRoles.length > 0 && !allowedRoles.includes(rol)) {
        return <Navigate to="/login" replace />;
    }

    return children ? children : <Outlet />;
};