import React from "react";
import AuthLayout from "../../modules/auth/components/AuthLayout";
import LoginForm from "../../modules/auth/components/LoginForm";
import SocialLoginSection from "../../modules/auth/components/SocialLoginSection";
import { useAuthForm  } from "../../modules/auth/hooks/useAuth";

function Login() {
  const {
    formData,
    loading,
    error,
    handleChange,
    handleEmailLogin,
    handleGoogleLogin,
  } = useAuthForm ();

  return (
    <AuthLayout>
      <LoginForm
        formData={formData}
        loading={loading}
        error={error}
        onSubmit={handleEmailLogin}
        onChange={handleChange}
      />
      <SocialLoginSection
        onGoogleLogin={handleGoogleLogin}
        loading={loading}
      />
    </AuthLayout>
  );
}

export default Login;