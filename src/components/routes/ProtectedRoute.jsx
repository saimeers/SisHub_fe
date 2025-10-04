import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen } from '../ui/LoadingScreen';


export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, rol, estado, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (estado === 'STAND_BY') {
    return <Navigate to="/cuenta-pendiente" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(rol)) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};