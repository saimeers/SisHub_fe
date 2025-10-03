import React from "react";

function ResetPasswordLayout({ children }) {
  return (
    <div className="relative min-h-screen w-screen overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0">
        <img
          src="/img/fondo-restablecer.png"
          alt="Fondo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordLayout;