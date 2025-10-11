import React from "react";
import SignupLayout from "../../modules/auth/components/SignupLayout";
import SetPasswordForm from "../../modules/auth/components/SetPasswordForm";
import useSetPassword from "../../modules/auth/hooks/useSetPassword"; 

function FormPassword() {
  const { formData, loading, handleChange, handleSubmit } = useSetPassword();

  return (
    <SignupLayout>
      <h1 className="text-3xl md:text-4xl font-bold mb-2">
        Establece tu contraseña
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        Requisito obligatorio para docentes
      </p>

      <SetPasswordForm
        formData={formData}
        loading={loading}
        onSubmit={handleSubmit}
        onChange={handleChange}
      />
    </SignupLayout>
  );
}

export default FormPassword;