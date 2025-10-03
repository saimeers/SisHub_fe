import React from "react";
import SignupLayout from "../../modules/auth/components/SignupLayout";
import RoleSelector from "../../modules/auth/components/RoleSelector";
import ErrorAlert from "../../modules/auth/components/ErrorAlert";
import { useSignup } from "../../modules/auth/hooks/useSignup";

function Signup() {
  const { loading, error, handleRoleSelection, allowedDomains } = useSignup();

  return (
    <SignupLayout>
      <h1 className="text-3xl md:text-4xl font-bold mb-12">Registro</h1>
      <p className="text-gray-600 text-center mb-8">
        Elige el rol para continuar con el registro en el sistema
      </p>

      <ErrorAlert message={error} />

      <RoleSelector onRoleSelect={handleRoleSelection} loading={loading} />

      <p className="text-xs text-gray-400 text-center mt-4">
        Solo se permiten correos institucionales
      </p>
    </SignupLayout>
  );
}

export default Signup;