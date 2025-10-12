export const useSubjectValidation = () => {
  const validateSubject = (subject) => {
    const errors = [];

    // Validar código - solo números
    if (!/^\d+$/.test(subject.codigo)) {
      errors.push("El código debe contener solo números");
    }

    // Validar semestre - solo números enteros positivos
    const semestreNum = parseInt(subject.semestre);
    if (!Number.isInteger(semestreNum) || semestreNum <= 0) {
      errors.push("El semestre debe ser un número entero mayor que cero");
    }

    // Validar créditos - solo números enteros positivos
    const creditosNum = parseInt(subject.creditos);
    if (!Number.isInteger(creditosNum) || creditosNum <= 0) {
      errors.push("Los créditos deben ser un número entero mayor que cero");
    }

    // Validar tipo
    const validTypes = ["Obligatoria", "Electiva"];
    if (!validTypes.includes(subject.tipo)) {
      errors.push("El tipo debe ser 'Obligatoria' o 'Electiva'");
    }

    // Validar id_area - debe ser un número
    const areaNum = parseInt(subject.id_area);
    if (!Number.isInteger(areaNum) || areaNum <= 0) {
      errors.push("El ID del área debe ser un número entero positivo");
    }

    // Validar prerrequisitos - debe tener al menos uno o "Ninguno"
    if (!subject.prerrequisitos || subject.prerrequisitos.trim() === "") {
      errors.push("Debe seleccionar al menos un prerrequisito o 'Ninguno'");
    }

    return errors;
  };

  const checkDuplicates = (subjects, newSubject, excludeIndex = -1, existingSubjects = []) => {
    const duplicates = [];
    
    // Función para normalizar y limpiar códigos
    const normalizeCode = (code) => {
      if (!code) return "";
      // Convertir a string, quitar espacios, y extraer solo dígitos
      return String(code).replace(/\s+/g, "").replace(/\D/g, "");
    };
    
    // Función para normalizar nombres
    const normalizeName = (name) => {
      if (!name) return "";
      return String(name).trim().toLowerCase().replace(/\s+/g, " ");
    };
    
    // Normalizar la nueva materia
    const normalizedNewCode = normalizeCode(newSubject.codigo);
    const normalizedNewName = normalizeName(newSubject.nombre);
    
    console.log("🔍 Verificando duplicados:");
    console.log("Nueva materia:", { 
      codigo: newSubject.codigo, 
      codigoNormalizado: normalizedNewCode,
      nombre: newSubject.nombre,
      nombreNormalizado: normalizedNewName
    });
    
    // Función para verificar duplicados contra una lista de materias
    const checkAgainstList = (subjectsList, listName) => {
      subjectsList.forEach((subject, index) => {
        // Normalizar materia existente
        const normalizedSubjectCode = normalizeCode(subject.codigo);
        const normalizedSubjectName = normalizeName(subject.nombre);
        
        console.log(`Comparando con ${listName} ${index}:`, {
          codigoOriginal: subject.codigo,
          codigoNormalizado: normalizedSubjectCode,
          nombreOriginal: subject.nombre,
          nombreNormalizado: normalizedSubjectName,
          esCodigoIgual: normalizedSubjectCode === normalizedNewCode,
          esNombreIgual: normalizedSubjectName === normalizedNewName,
          longitudCodigo: normalizedSubjectCode.length,
          longitudCodigoNuevo: normalizedNewCode.length
        });
        
        // Verificar código duplicado - comparación exacta dígito a dígito
        if (normalizedSubjectCode && normalizedNewCode && 
            normalizedSubjectCode === normalizedNewCode) {
          console.log(`❌ Código duplicado encontrado en ${listName}:`, {
            codigoOriginal: subject.codigo,
            codigoNuevo: newSubject.codigo,
            codigoNormalizado: normalizedSubjectCode
          });
          duplicates.push(`Código duplicado: ${subject.codigo} (${subject.nombre})`);
        }
        
        // Verificar nombre duplicado
        if (normalizedSubjectName && normalizedNewName && 
            normalizedSubjectName === normalizedNewName) {
          console.log(`❌ Nombre duplicado encontrado en ${listName}:`, {
            nombreOriginal: subject.nombre,
            nombreNuevo: newSubject.nombre,
            nombreNormalizado: normalizedSubjectName
          });
          duplicates.push(`Nombre duplicado: ${subject.nombre} (${subject.codigo})`);
        }
      });
    };
    
    // Verificar contra materias locales (excluyendo la que se está editando)
    const localSubjects = subjects.filter((_, index) => index !== excludeIndex);
    checkAgainstList(localSubjects, "materias locales");
    
    // Verificar contra materias existentes en la base de datos
    checkAgainstList(existingSubjects, "base de datos");

    console.log("Duplicados encontrados:", duplicates);
    return duplicates;
  };

  return {
    validateSubject,
    checkDuplicates
  };
};
