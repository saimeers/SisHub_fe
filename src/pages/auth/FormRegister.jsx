import React from "react";
import FieldText from "../../components/FieldText";
import FieldPassword from "../../components/FieldPassword";
import Button from "../../components/Button";

function FormRegister() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registrando usuario...");
  };

  return (
    <div className="flex h-screen bg-[#7DABF7]">
      {/* Lado izquierdo con logo */}
      <div className="hidden md:flex w-1/2 bg-[#7DABF7] justify-center items-center">
        <img
          src="/img/logo.png"
          alt="Logo SisHub"
          className="w-60 md:w-72 object-contain"
        />
      </div>

      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white px-6 md:px-12 rounded-tl-4xl rounded-bl-4xl shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Datos</h1>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md flex flex-col gap-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block" htmlFor="codigo">
                Código
              </label>
              <FieldText
                type="text"
                id="codigo"
                name="codigo"
                placeholder="Ingrese su código"
              />
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block" htmlFor="fecha">
                Fecha de nacimiento
              </label>
              <FieldText
                type="date"
                id="fecha"
                name="fecha"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block" htmlFor="documento">
              Documento de identidad
            </label>
            <FieldText
              type="text"
              id="documento"
              name="documento"
              placeholder="Ingrese su documento"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block" htmlFor="telefono">
              Teléfono
            </label>
            <FieldText
              type="tel"
              id="telefono"
              name="telefono"
              placeholder="Ingrese su teléfono"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block" htmlFor="password">
              Nueva contraseña
            </label>
            <FieldPassword id="password" name="password" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block" htmlFor="confirm">
              Confirmar contraseña
            </label>
            <FieldPassword id="confirm" name="confirm" />
          </div>

          <div className="mt-4 flex justify-center">
            <Button text="Registrar" />
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormRegister;
