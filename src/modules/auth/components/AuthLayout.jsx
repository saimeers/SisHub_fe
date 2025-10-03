import React from "react";

function AuthLayout({ children }) {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0 hidden md:flex">
        <div className="w-[65%] h-full bg-white"></div>
        <div className="w-[35%] h-full">
          <img
            src="/img/fondo.png"
            alt="Fondo"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="absolute inset-0 md:hidden">
        <img
          src="/img/fondo.png"
          alt="Fondo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <div className="relative z-10 h-full">
        <div className="flex md:hidden h-full items-center justify-center p-4">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl flex flex-col justify-center items-center p-8">
            <div className="w-full mx-auto flex flex-col items-center">
              <div className="mb-6">
                <img
                  src="/img/logo.png"
                  alt="Logo SisHub"
                  className="w-48 object-contain"
                />
              </div>
              {children}
            </div>
          </div>
        </div>

        <div className="hidden md:flex h-full">
          <div className="w-[70%] h-full bg-white shadow-2xl backdrop-blur-sm rounded-tr-[3rem] rounded-br-[3rem] flex flex-col justify-center items-center">
            <div className="w-[75%] mx-auto flex flex-col items-center">
              <div className="mb-6">
                <img
                  src="/img/logo.png"
                  alt="Logo SisHub"
                  className="w-72 md:w-60 object-contain"
                />
              </div>
              {children}
            </div>
          </div>
          <div className="w-[30%] h-full"></div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;