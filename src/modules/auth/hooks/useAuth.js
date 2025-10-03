import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, signInWithEmail } from "../../../services/authService";
import { getAuthErrorMessage } from "../utils/authErrorHandler";
import { useToast } from "../../../hooks/useToast";

export const useAuth = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveUserData = (user, token) => {
    localStorage.setItem("firebaseToken", token);
    localStorage.setItem("userName", user.displayName || "");
    localStorage.setItem("userEmail", user.email);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user, token } = await signInWithEmail(
        formData.email,
        formData.password
      );

      saveUserData(user, token);
      
      toast.success(`¡Bienvenido${user.displayName ? ' ' + user.displayName : ''}!`);
      
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Error login:", err);
      
      toast.error(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const { user, token } = await signInWithGoogle();
      saveUserData(user, token);
      
      toast.success(`¡Bienvenido ${user.displayName}!`);
      
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Error Google login:", err);
      
      toast.error(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    handleChange,
    handleEmailLogin,
    handleGoogleLogin,
  };
};