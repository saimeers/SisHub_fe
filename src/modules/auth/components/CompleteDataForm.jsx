import React from "react";
import FieldText from "../../../components/ui/FieldText";
import FieldPassword from "../../../components/ui/FieldPassword";
import Button from "../../../components/ui/Button";

function CompleteDataForm({ formData, loading, onSubmit, onChange }) {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-md flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block" htmlFor="codigo">
            Código *
          </label>
          <FieldText
            type="text"
            id="codigo"
            name="codigo"
            placeholder="Ingrese su código"
            value={formData.codigo}
            onChange={onChange}
            required
          />
        </div>

        <div className="flex-1">
          <label
            className="text-sm font-medium mb-1 block"
            htmlFor="fechaNacimiento"
          >
            Fecha de nacimiento
          </label>
          <FieldText
            type="date"
            id="fechaNacimiento"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={onChange}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block" htmlFor="documento">
          Documento de identidad *
        </label>
        <FieldText
          type="text"
          id="documento"
          name="documento"
          placeholder="Ingrese su documento"
          value={formData.documento}
          onChange={onChange}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block" htmlFor="telefono">
          Teléfono *
        </label>
        <FieldText
          type="tel"
          id="telefono"
          name="telefono"
          placeholder="Ingrese su teléfono"
          value={formData.telefono}
          onChange={onChange}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block" htmlFor="password">
          Contraseña *
        </label>
        <FieldPassword
          id="password"
          name="password"
          placeholder="Mínimo 6 caracteres"
          value={formData.password}
          onChange={onChange}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Si agregas una contraseña, podrás iniciar sesión con tu email.
        </p>
      </div>

      <div>
        <label
          className="text-sm font-medium mb-1 block"
          htmlFor="confirmPassword"
        >
          Confirmar contraseña *
        </label>
        <FieldPassword
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Repite tu contraseña"
          value={formData.confirmPassword}
          onChange={onChange}
          required
        />
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          type="submit"
          text={loading ? "Registrando..." : "Registrar"}
          disabled={loading}
        />
      </div>
    </form>
  );
}

export default CompleteDataForm;