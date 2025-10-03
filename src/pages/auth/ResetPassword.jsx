import React from "react";
import ResetPasswordLayout from "../../modules/auth/components/ResetPasswordLayout";
import ResetPasswordForm from "../../modules/auth/components/ResetPasswordForm";
import { useResetPassword } from "../../modules/auth/hooks/useResetPassword";

function ResetPassword() {
  const { 
    formData, 
    loading, 
    verifyingCode, 
    userEmail, 
    handleChange, 
    handleSubmit 
  } = useResetPassword();

  return (
    <ResetPasswordLayout>
      {verifyingCode ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C03030] mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando enlace...</p>
        </div>
      ) : (
        <>
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
            Restablecer Contraseña
          </h1>
          
          {userEmail && (
            <p className="text-sm text-gray-600 text-center mb-6">
              Para la cuenta: <span className="font-medium">{userEmail}</span>
            </p>
          )}

          <ResetPasswordForm
            formData={formData}
            loading={loading}
            onSubmit={handleSubmit}
            onChange={handleChange}
          />
        </>
      )}
    </ResetPasswordLayout>
  );
}

export default ResetPassword;