import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Users, AlertCircle } from 'lucide-react';

const ProgressModal = ({ progress, onClose }) => {
  const navigate = useNavigate();

  if (!progress) return null;

  const percentage = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;

  const isComplete = progress.status === 'completed';
  const isFailed = progress.status === 'failed';
  const isProcessing = progress.status === 'processing';

  const handleViewGroups = () => {
    onClose?.();
    navigate('/admin/all-groups');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div
          className={`px-6 py-4 ${
            isComplete
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : isFailed
              ? 'bg-gradient-to-r from-red-500 to-red-600'
              : 'bg-gradient-to-r from-blue-500 to-blue-600'
          }`}
        >
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              {isProcessing && <Loader2 className="w-6 h-6 animate-spin" />}
              {isComplete && <CheckCircle className="w-6 h-6" />}
              {isFailed && <XCircle className="w-6 h-6" />}
              <h2 className="text-xl font-bold">
                {isProcessing && 'Matriculando estudiantes...'}
                {isComplete && '¡Matrícula completada!'}
                {isFailed && 'Error en la matrícula'}
              </h2>
            </div>

            {/* ❌ Cerrar solo si está completo o fallido */}
            {(isComplete || isFailed) && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-700">
              <span>{progress.message}</span>
              <span className="text-blue-600">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isComplete
                    ? 'bg-green-500'
                    : isFailed
                    ? 'bg-red-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${percentage}%` }}
              >
                <div className="w-full h-full bg-white/30 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {progress.current} de {progress.total} estudiantes
              </span>
              <span>
                {progress.success?.length || 0} exitosos ·{' '}
                {progress.errors?.length || 0} errores
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-600">
                {progress.current}
              </p>
              <p className="text-xs text-gray-600">Procesados</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-600">
                {progress.success?.length || 0}
              </p>
              <p className="text-xs text-gray-600">Exitosos</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-600">
                {progress.errors?.length || 0}
              </p>
              <p className="text-xs text-gray-600">Errores</p>
            </div>
          </div>

          {/* Recent Activity */}
          {(progress.success?.length > 0 || progress.errors?.length > 0) && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Actividad reciente
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {/* Últimos exitosos */}
                {progress.success?.slice(-5).reverse().map((item, idx) => (
                  <div key={`success-${idx}`} className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 truncate">
                      <span className="font-medium">{item.codigo}</span> - {item.nombre}
                    </span>
                  </div>
                ))}

                {/* Últimos errores */}
                {progress.errors?.slice(-3).reverse().map((item, idx) => (
                  <div key={`error-${idx}`} className="flex items-start gap-2 text-xs">
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-700 font-medium">{item.codigo}</span>
                      <span className="text-gray-500"> - {item.nombre}</span>
                      <p className="text-red-600 text-xs mt-0.5 truncate">{item.error}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {isComplete && (
            <div className="flex gap-3">
              <button
                onClick={handleViewGroups}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Ver grupos
              </button>
            </div>
          )}

          {isFailed && (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}

          {isProcessing && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Por favor espera mientras se procesan los estudiantes...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;
