import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen } from '../ui/LoadingScreen';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, rol, estado, loading, needsPassword, userData } = useAuth();
    const location = useLocation();

    if (loading || (isAuthenticated && (userData === undefined || userData === null && !rol))) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

/*     if (!rol && userData && location.pathname !== "/complete-profile") {
        return <LoadingScreen />;
    } */

/*     if (!rol && userData === null && location.pathname !== "/complete-profile") {
        return <Navigate to="/complete-profile" replace />;
    } */

    if (estado === "STAND_BY" && location.pathname !== "/account-pending") {
        return <Navigate to="/account-pending" replace />;
    }

    if (needsPassword && location.pathname !== "/establecer-contrasena") {
        return <Navigate to="/establecer-contrasena" replace />;
    }

    if (rol && location.pathname === "/") {
        return <Navigate to={`/${rol.toLowerCase()}/dashboard`} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(rol)) {
        return <Navigate to="/login" replace />;
    }

    return children ? children : <Outlet />;
};
