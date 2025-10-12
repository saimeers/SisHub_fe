import React from "react";
import { useNavigate } from "react-router-dom";

const AccessDenied = ({ 
  message = "No tienes acceso a este recurso.",
  primaryButtonText = "Volver",
  primaryButtonPath = "/",
  secondaryButtonText = "Ir al catálogo",
  secondaryButtonPath = "/subjects",
  showSecondaryButton = true,
  additionalInfo = "Si crees que esto es un error, contacta a tu profesor o administrador."
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-120px)] w-full bg-white flex items-center justify-center p-4 -m-3 md:-m-6">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gray-100 rounded-2xl shadow-xl p-8 text-center border border-gray-200">
          {/* Icono de advertencia */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          {/* Título */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Acceso Denegado</h2>
          
          {/* Mensaje */}
          <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
          
          {/* Botones */}
          <div className="space-y-4">
            <button
              onClick={() => navigate(primaryButtonPath)}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {primaryButtonText}
            </button>
            
            {showSecondaryButton && (
              <button
                onClick={() => navigate(secondaryButtonPath)}
                className="w-full px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-full bg-white hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {secondaryButtonText}
              </button>
            )}
          </div>
          
          {/* Información adicional */}
          {additionalInfo && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                {additionalInfo}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
