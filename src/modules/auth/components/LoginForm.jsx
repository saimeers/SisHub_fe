import React, { useState } from "react";
import Button from "../../../components/ui/Button";
import FieldText from "../../../components/ui/FieldText";
import FieldPassword from "../../../components/ui/FieldPassword";
import ForgotPasswordModal from "./ForgotPasswordModal";

function LoginForm({ formData, loading, error, onSubmit, onChange }) {
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    return (
        <>
            <form
                className="w-full max-w-sm flex flex-col"
                onSubmit={onSubmit}
            >
                <label className="text-sm font-medium mb-1" htmlFor="email">
                    Correo electrónico
                </label>
                <FieldText
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Introduzca su correo aquí"
                    value={formData.email}
                    onChange={onChange}
                    required
                />

                <label className="text-sm font-medium mt-4 mb-1" htmlFor="password">
                    Contraseña
                </label>
                <FieldPassword
                    id="password"
                    name="password"
                    placeholder="••••••"
                    value={formData.password}
                    onChange={onChange}
                    required
                />

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => setShowForgotPasswordModal(true)}
                        className="text-xs text-gray-500 mt-1 hover:underline hover:text-gray-700 transition-colors"
                    >
                        ¿Olvidó su contraseña?
                    </button>
                </div>

                <div className="mt-6 flex justify-center">
                    <Button
                        type="submit"
                        text={loading ? "Ingresando..." : "Iniciar Sesión"}
                        disabled={loading}
                    />
                </div>
            </form>

            <p className="text-sm text-gray-600 text-center mt-2">
                ¿No tienes cuenta?{" "}
                <a
                    href="/signup"
                    className="text-[#C03030] font-medium hover:underline"
                >
                    Regístrate
                </a>
            </p>
            <ForgotPasswordModal
                isOpen={showForgotPasswordModal}
                onClose={() => setShowForgotPasswordModal(false)}
            />
        </>
    );
}

export default LoginForm;