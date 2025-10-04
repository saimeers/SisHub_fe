import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen } from '../ui/LoadingScreen';

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, rol, loading, userData } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && userData) {
    switch (rol) {
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      case 'DOCENTE':
        return <Navigate to="/docente/dashboard" replace />;
      case 'ESTUDIANTE':
        return <Navigate to="/estudiante/dashboard" replace />;
      default:
        return children;
    }
  }

  return children;
};