import React from "react";
import { X, Check } from "lucide-react";

function PasswordStrengthValidator({ password }) {
  const validations = [
    {
      label: "Al menos 8 caracteres",
      isValid: password.length >= 8,
    },
    {
      label: "Una letra mayúscula",
      isValid: /[A-Z]/.test(password),
    },
    {
      label: "Una letra minúscula",
      isValid: /[a-z]/.test(password),
    },
    {
      label: "Un número",
      isValid: /\d/.test(password),
    },
    {
      label: "Un símbolo o caracter especial",
      isValid: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;'`~]/.test(password),
    },
  ];

  return (
    <div className="mt-4 mb-6">
      <p className="text-sm font-medium text-gray-700 mb-2">
        La contraseña debe contener:
      </p>
      <ul className="space-y-1">
        {validations.map((validation, index) => (
          <li
            key={index}
            className={`flex items-center text-sm ${
              validation.isValid ? "text-green-600" : "text-red-500"
            }`}
          >
            {validation.isValid ? (
              <Check size={16} className="mr-2 flex-shrink-0" />
            ) : (
              <X size={16} className="mr-2 flex-shrink-0" />
            )}
            <span>{validation.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PasswordStrengthValidator;