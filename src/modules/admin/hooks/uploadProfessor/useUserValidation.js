import { useCallback } from 'react';

export const useUserValidation = () => {
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    if (!email.toLowerCase().endsWith('@ufps.edu.co')) return false;
    return true;
  }, []);

  const validateDocument = useCallback((doc) => {
    return /^\d{6,10}$/.test(doc);
  }, []);

  const validateCode = useCallback((code) => {
    return code.trim().length >= 3;
  }, []);

  const validateName = useCallback((name) => {
    return name.trim().length >= 3;
  }, []);

  const validatePhone = useCallback((phone) => {
    if (!phone || phone.trim() === '') return true;
    const clean = phone
      .toString()
      .trim()
      .replace(/^"|"$/g, '')
      .replace(/\t/g, '')
      .replace(/\D/g, '');
    return /^\d{7,10}$/.test(clean);
  }, []);

  const validateUser = useCallback((user) => {
    const errors = [];

    if (!validateCode(user.codigo)) {
      errors.push('Código inválido (mínimo 3 caracteres)');
    }
    if (!validateName(user.nombre)) {
      errors.push('Nombre inválido (mínimo 3 caracteres)');
    }
    if (!validateDocument(user.documento)) {
      errors.push('Documento inválido (6-10 dígitos numéricos)');
    }
    if (!validateEmail(user.correo)) {
      errors.push('Correo debe ser @ufps.edu.co');
    }
    if (!validatePhone(user.telefono)) {
      errors.push('Teléfono inválido (7-10 dígitos)');
    }

    return errors;
  }, [validateCode, validateName, validateDocument, validateEmail, validatePhone]);

  const checkDuplicates = useCallback((user, users, excludeIndex = null) => {
    const duplicates = [];

    users.forEach((existingUser, index) => {
      if (excludeIndex !== null && index === excludeIndex) return;

      if (existingUser.codigo.toLowerCase() === user.codigo.toLowerCase()) {
        duplicates.push(`código ${user.codigo}`);
      }
      if (existingUser.documento === user.documento) {
        duplicates.push(`documento ${user.documento}`);
      }
      if (existingUser.correo.toLowerCase() === user.correo.toLowerCase()) {
        duplicates.push(`correo ${user.correo}`);
      }
    });

    return [...new Set(duplicates)];
  }, []);

  return {
    validateEmail,
    validateDocument,
    validateCode,
    validateName,
    validatePhone,
    validateUser,
    checkDuplicates
  };
};