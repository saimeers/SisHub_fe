import React, { useState } from "react";
import { X } from "lucide-react";
import FieldText from "../../../components/ui/FieldText";
import Button from "../../../components/ui/Button";
import { sendPasswordReset } from "../../../services/authService";
import { useToast } from "../../../hooks/useToast";

function ForgotPasswordModal({ isOpen, onClose }) {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Por favor ingresa tu correo electrónico");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor ingresa un correo válido");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordReset(email);
      
      toast.success(
        "¡Correo enviado! Revisa tu bandeja de entrada para restablecer tu contraseña",
        { autoClose: 5000 }
      );
      
      setEmail("");
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      
      if (error.code === "auth/user-not-found") {
        toast.error("No existe una cuenta con ese correo electrónico");
      } else if (error.code === "auth/invalid-email") {
        toast.error("El formato del correo es inválido");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Demasiados intentos. Intenta más tarde");
      } else {
        toast.error("Error al enviar el correo. Intenta de nuevo");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm rounded-tr-[3rem] rounded-br-[3rem]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 relative animate-fadeIn">
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          aria-label="Cerrar"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
          ¿Olvidaste tu contraseña?
        </h2>
        <p className="text-sm text-gray-600 mb-4 text-center">Recibirás un correo con un enlace para restablecer tu contraseña</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block" htmlFor="recovery-email">
              Correo electrónico
            </label>
            <FieldText
              type="email"
              id="recovery-email"
              name="email"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              type="submit"
              text={loading ? "Enviando..." : "Enviar enlace"}
              disabled={loading}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;