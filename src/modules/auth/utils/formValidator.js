export const validateRegistrationForm = (formData) => {
  const errors = [];

  // Validar campos obligatorios
  if (!formData.documento || !formData.telefono || !formData.codigo) {
    errors.push("Por favor completa todos los campos obligatorios (*)");
  }

  // Validar contraseñas
  if (!formData.password || !formData.confirmPassword) {
    errors.push("Debes ingresar y confirmar una contraseña");
  } else {
    if (formData.password !== formData.confirmPassword) {
      errors.push("Las contraseñas no coinciden");
    }
    if (formData.password.length < 6) {
      errors.push("La contraseña debe tener al menos 6 caracteres");
    }
  }

  // Validar formato de documento (solo números)
  if (formData.documento && !/^\d+$/.test(formData.documento)) {
    errors.push("El documento debe contener solo números");
  }

  // Validar formato de teléfono (solo números, mínimo 7 dígitos)
  if (formData.telefono && !/^\d{7,}$/.test(formData.telefono)) {
    errors.push("El teléfono debe tener al menos 7 dígitos");
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0] || null,
  };
};

export const validatePassword = (password, confirmPassword) => {
  if (!password || !confirmPassword) {
    return {
      isValid: false,
      error: "Ambas contraseñas son obligatorias",
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: "Las contraseñas no coinciden",
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: "La contraseña debe tener al menos 6 caracteres",
    };
  }

  return { isValid: true, error: null };
};