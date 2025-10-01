import React from "react";
import ButtonGoogle from "../../components/ButtonGoogle";
import Button from "../../components/Button";
import FieldText from "../../components/FieldText";
import FieldPassword from "../../components/FieldPassword";

function Login() {
    const handleGoogleLogin = () => {
        console.log("Login con Google...");
    };

    return (
        <div className="flex h-screen bg-[#7DABF7]">
            <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white px-6 md:px-12 rounded-tr-4xl rounded-br-4xl shadow-lg">
                <h1 className="text-3xl md:text-4xl font-bold mb-6">Iniciar Sesión</h1>

                <form className="w-full max-w-sm flex flex-col">
                    <label className="text-sm font-medium mb-1" htmlFor="email">
                        Correo electrónico
                    </label>
                    <FieldText
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Introduzca su correo aquí"
                    />

                    <label className="text-sm font-medium mt-4 mb-1" htmlFor="password">
                        Contraseña
                    </label>
                    <FieldPassword />

                    <div className="flex justify-end">
                        <a
                            href="#"
                            className="text-xs text-gray-500 mt-1 hover:underline"
                        >
                            ¿Olvidó su contraseña?
                        </a>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Button text="Iniciar" />
                    </div>

                    <p className="text-sm text-gray-600 text-center mt-2">
                        ¿No tienes cuenta?{" "}
                        <a href="#" className="text-[#4285F4] font-medium hover:underline">
                            Regístrate
                        </a>
                    </p>

                    <div className="flex items-center my-4">
                        <hr className="flex-grow border-gray-300" />
                        <span className="px-2 text-sm text-gray-500">o</span>
                        <hr className="flex-grow border-gray-300" />
                    </div>

                    <div className="flex justify-center">
                        <ButtonGoogle onClick={handleGoogleLogin} />
                    </div>
                </form>
            </div>

            <div className="hidden md:flex w-1/2 bg-[#7DABF7] justify-center items-center">
                <img
                    src="/img/logo.png"
                    alt="Logo SisHub"
                    className="w-60 md:w-72 object-contain"
                />
            </div>
        </div>
    );
}

export default Login;
