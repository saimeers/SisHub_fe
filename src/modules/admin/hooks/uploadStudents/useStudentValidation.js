import { useCallback } from 'react';

export const useStudentValidation = () => {
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

  const validateGroupIdentifier = useCallback((identifier) => {
    // Format: 1154306-B-02-2025
    const regex = /^\d{7}-[A-Z]-\d{2}-\d{4}$/;
    return regex.test(identifier);
  }, []);

  const validateStudent = useCallback((student) => {
    const errors = [];

    if (!validateGroupIdentifier(student.grupo_identificador)) {
      errors.push('Grupo inválido (formato: 1154306-B-02-2025)');
    }
    if (!validateCode(student.codigo)) {
      errors.push('Código inválido (mínimo 3 caracteres)');
    }
    if (!validateName(student.nombre)) {
      errors.push('Nombre inválido (mínimo 3 caracteres)');
    }
    if (!validateDocument(student.documento)) {
      errors.push('Documento inválido (6-10 dígitos numéricos)');
    }
    if (!validateEmail(student.correo)) {
      errors.push('Correo debe ser @ufps.edu.co');
    }
    if (!validatePhone(student.telefono)) {
      errors.push('Teléfono inválido (7-10 dígitos)');
    }

    return errors;
  }, [validateCode, validateName, validateDocument, validateEmail, validatePhone, validateGroupIdentifier]);

  const checkDuplicates = useCallback((student, students, excludeIndex = null) => {
    const duplicates = [];

    students.forEach((existingStudent, index) => {
      if (excludeIndex !== null && index === excludeIndex) return;

      if (existingStudent.codigo.toLowerCase() === student.codigo.toLowerCase() &&
          existingStudent.grupo_identificador === student.grupo_identificador) {
        duplicates.push(`código ${student.codigo} en el mismo grupo`);
      }
      if (existingStudent.documento === student.documento &&
          existingStudent.grupo_identificador === student.grupo_identificador) {
        duplicates.push(`documento ${student.documento} en el mismo grupo`);
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
    validateGroupIdentifier,
    validateStudent,
    checkDuplicates
  };
};