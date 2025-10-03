import React from "react";
import SignupLayout from "../../modules/auth/components/SignupLayout";
import CompleteDataForm from "../../modules/auth/components/CompleteDataForm";
import ErrorAlert from "../../modules/auth/components/ErrorAlert";
import { useRegister } from "../../modules/auth/hooks/useRegister";

function FormRegister() {
  const { formData, loading, error, handleChange, handleSubmit } = useRegister();

  return (
    <SignupLayout>
      <h1 className="text-3xl md:text-4xl font-bold mb-6">
        Completa tus datos
      </h1>

      <ErrorAlert message={error} />

      <CompleteDataForm
        formData={formData}
        loading={loading}
        onSubmit={handleSubmit}
        onChange={handleChange}
      />
    </SignupLayout>
  );
}

export default FormRegister;