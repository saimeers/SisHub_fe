import React, { useState, useId } from "react";
import { Eye, EyeOff } from "lucide-react";

const FieldPassword = ({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  required,
  maxLength = 30
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const reactId = useId();
  const uniqueId = id ? `${id}-${reactId}` : reactId;

  const toggleShowPassword = () => setShowPassword(p => !p);

  return (
    <div className="w-full relative mt-4">
      {label && (
        <label className="text-sm font-medium mb-1 block" htmlFor={uniqueId}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={uniqueId}
          name={name || "passwordId"}
          value={value}
          onChange={onChange}
          placeholder={placeholder || "Introduzca su contraseña aquí"}
          required={required}
          maxLength={maxLength}
          className="p-3 rounded-md bg-gray-100 w-full focus:outline-none focus:ring-2 focus:ring-[#C03030]"
        />
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute inset-y-0 right-3 flex items-center text-gray-500 focus:outline-none"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
};

export default FieldPassword;
