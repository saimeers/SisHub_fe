import React from "react";
import FieldPassword from "../../../components/ui/FieldPassword";
import Button from "../../../components/ui/Button";

function SetPasswordForm({ formData, loading, onSubmit, onChange }) {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-md flex flex-col gap-4">
      <div className="mb-4 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-[#C03030]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <p className="text-gray-600 text-sm">
          Como docente, necesitas establecer una contraseña para mayor seguridad
        </p>
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block" htmlFor="password">
          Nueva Contraseña *
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
          Podrás iniciar sesión con tu correo institucional y esta contraseña
        </p>
      </div>

      <div>
        <label
          className="text-sm font-medium mb-1 block"
          htmlFor="confirmPassword"
        >
          Confirmar Contraseña *
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
          text={loading ? "Estableciendo..." : "Establecer Contraseña"}
          disabled={loading}
        />
      </div>
    </form>
  );
}

export default SetPasswordForm;