import { useCallback } from 'react';
import { studentSchema } from '../../../../utils/studentSchema';
import { ZodError } from 'zod';

export const useStudentValidation = () => {
  const getGroupIdentifier = (student) => {
    if (student.grupo_identificador) return student.grupo_identificador;
    return `${student.codigo_materia}-${student.nombre_grupo}-${student.periodo}-${student.anio}`;
  };

  const validateStudent = useCallback((student) => {
    const studentToValidate = {
      ...student,
      grupo_identificador: getGroupIdentifier(student),
      documento: student.documento?.toString().trim().replace(/\D/g, '') || '',
      telefono: student.telefono?.toString().trim().replace(/\D/g, '') || '',
    };

    try {
      studentSchema.parse(studentToValidate);
      return []; // No hay errores
    } catch (err) {
      if (err instanceof ZodError) {
        return err.issues.map(e => `${e.path[0]}: ${e.message}`);
      }
      console.error(err);
      return ['Error desconocido al validar el estudiante'];
    }
  }, []);

  const checkDuplicates = useCallback((student, students, excludeIndex = null) => {
    const duplicates = [];
    const grupoIdentificador = getGroupIdentifier(student);

    students.forEach((existingStudent, index) => {
      if (excludeIndex !== null && index === excludeIndex) return;

      const existingGrupo = getGroupIdentifier(existingStudent);

      if (
        existingStudent.codigo.toLowerCase() === student.codigo.toLowerCase() &&
        existingGrupo === grupoIdentificador
      ) {
        duplicates.push(`código ${student.codigo} en el mismo grupo`);
      }
      if (
        existingStudent.documento === student.documento &&
        existingGrupo === grupoIdentificador
      ) {
        duplicates.push(`documento ${student.documento} en el mismo grupo`);
      }
    });

    return [...new Set(duplicates)];
  }, []);

  return { validateStudent, checkDuplicates };
};
