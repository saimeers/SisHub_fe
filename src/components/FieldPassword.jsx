import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const FieldPassword = ({ id, name, value, onChange, placeholder, required, maxLength = 30 }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword(p => !p);

  return (
    <div className="w-full relative">
      <input
        type={showPassword ? "text" : "password"}
        id={id || "password"}
        name={name || "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Introduzca su contraseña aquí"}
        required={required}
        maxLength={maxLength}
        className="p-3 rounded-md bg-gray-100 w-full focus:outline-none focus:ring-2e focus:ring-2 focus:ring-[#C03030]"
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