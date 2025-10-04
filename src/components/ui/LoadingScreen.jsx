import React from 'react';

export const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100">
    <div className="text-center">
      <div className="relative">
        <div 
          className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"
          style={{ animationDuration: '0.6s' }}
        ></div>
        
        <div 
          className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-rose-500 rounded-full animate-spin mx-auto" 
          style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}
        ></div>
      </div>
      <p className="mt-6 text-lg font-medium text-gray-700 animate-pulse">Cargando...</p>
    </div>
  </div>
);

export default LoadingScreen;