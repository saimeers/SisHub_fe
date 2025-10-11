import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen } from '../ui/LoadingScreen';

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, rol, loading, userData, needsPassword } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && userData) {
    // ✅ Si es docente y necesita contraseña, redirigir primero a establecerla
    if (needsPassword) {
      return <Navigate to="/establecer-contrasena" replace />;
    }

    // Redirigir según rol
    switch (rol) {
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      case 'DOCENTE':
        return <Navigate to="/professor/dashboard" replace />;
      case 'ESTUDIANTE':
        return <Navigate to="/student/dashboard" replace />;
      default:
        return children;
    }
  }

  return children;
};