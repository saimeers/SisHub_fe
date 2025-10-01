// FieldPassword.jsx
import React, { useState } from "react";
import FieldText from "./FieldText";
import { Eye, EyeOff } from "lucide-react";

const FieldPassword = ({ id, name, onChange, maxLength = 30 }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword(p => !p);

  const handleChange = (e) => {
    const v = e.target.value.slice(0, maxLength);
    // reenviamos un "evento" con el valor truncado
    if (onChange) onChange({ ...e, target: { ...e.target, value: v } });
  };

  return (
    <div className="w-full relative">
      <FieldText
        type={showPassword ? "text" : "password"}
        id={id || "password"}
        name={name || "password"}
        placeholder="Introduzca su contraseña aquí"
        onChange={handleChange}
        maxLength={maxLength} 
      />

      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-500 focus:outline-none cursor-pointer"
        onClick={toggleShowPassword}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};

export default FieldPassword;
