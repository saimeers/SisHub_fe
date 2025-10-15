import React from "react";

function SignupLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#C03030]">
      {/* Logo izquierdo */}
      <div className="hidden md:flex w-1/2 bg-[#C03030] justify-center items-center">
        <img
          src="/img/logo.webp"
          alt="Logo SisHub"
          className="w-60 md:w-72 object-contain"
        />
      </div>

      {/* Contenido derecho */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white px-6 md:px-12 rounded-tl-4xl rounded-bl-4xl shadow-lg">
        {children}
      </div>
    </div>
  );
}

export default SignupLayout;