import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen } from '../ui/LoadingScreen';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, rol, estado, loading, needsPassword } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si ya está logueado pero no tiene rol -> completar perfil
    if (!rol && location.pathname !== "/complete-profile") {
        return <Navigate to="/complete-profile" replace />;
    }

    // Si está en espera
    if (estado === "STAND_BY") {
        return <Navigate to="/account-pending" replace />;
    }

    // ✅ VALIDACIÓN: Si es docente y no tiene contraseña, redirigir a establecer contraseña
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