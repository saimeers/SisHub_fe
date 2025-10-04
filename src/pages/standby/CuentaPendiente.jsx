import { signOutAccount } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const CuentaPendiente = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOutAccount();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="text-yellow-500 text-6xl mb-4">⏳</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Cuenta en Espera</h1>
        <p className="text-gray-600 mb-6">
          Tu cuenta está pendiente de aprobación. Un administrador revisará tu solicitud pronto.
        </p>
        <button
          onClick={handleLogout}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default CuentaPendiente;