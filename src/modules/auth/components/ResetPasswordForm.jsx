import React from "react";
import FieldPassword from "../../../components/FieldPassword";
import PasswordStrengthValidator from "./PasswordStrengthValidator";
import Button from "../../../components/Button";

function ResetPasswordForm({ formData, loading, onSubmit, onChange }) {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-md flex flex-col">
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block" htmlFor="newPassword">
          Nueva Contraseña
        </label>
        <FieldPassword
          id="newPassword"
          name="newPassword"
          value={formData.newPassword}
          onChange={onChange}
          placeholder="Introduzca su nueva contraseña"
          required
        />
      </div>

      <div className="mb-4">
        <label
          className="text-sm font-medium mb-2 block"
          htmlFor="confirmPassword"
        >
          Confirmar Contraseña
        </label>
        <FieldPassword
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={onChange}
          placeholder="Confirme su nueva contraseña"
          required
        />
      </div>

      <PasswordStrengthValidator password={formData.newPassword} />

      <div className="mt-6 flex justify-center">
        <Button text={loading ? "Guardando..." : "Restablecer"} disabled={loading} />
      </div>
    </form>
  );
}

export default ResetPasswordForm;