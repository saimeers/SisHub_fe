export const parseSubjectCSV = (text, validateSubject, checkDuplicates, existingSubjects) => {
  // Función de validación específica para CSV que permite 0 créditos
  const validateSubjectCSV = (subject) => {
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

    // Validar créditos - solo números enteros (incluyendo 0 para CSV)
    const creditosNum = parseInt(subject.creditos);
    if (!Number.isInteger(creditosNum) || creditosNum < 0) {
      errors.push("Los créditos deben ser un número entero mayor o igual a cero");
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
  const lines = text.split('\n').filter(line => line.trim());

  if (lines.length <= 1) {
    return {
      success: false,
      error: "El archivo CSV está vacío o no tiene datos"
    };
  }

  const newSubjectsToAdd = [];
  const errors = [];
  const duplicatesFound = [];

  const seenCodes = new Set();
  const seenNames = new Set();

  // Función para normalizar códigos (solo dígitos)
  const normalizeCode = (code) => {
    if (!code) return "";
    return String(code).replace(/\s+/g, "").replace(/\D/g, "");
  };
  
  // Función para normalizar nombres
  const normalizeName = (name) => {
    if (!name) return "";
    return String(name).trim().toLowerCase().replace(/\s+/g, " ");
  };

  // Registrar las materias ya existentes (para evitar duplicar si se sube el mismo CSV varias veces)
  existingSubjects.forEach(s => {
    seenCodes.add(normalizeCode(s.codigo));
    seenNames.add(normalizeName(s.nombre));
  });

  lines.slice(1).forEach((line, index) => {
    // Parsear CSV respetando comillas para campos con comas
    let values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    // Limpiar comillas de los valores
    values = values.map(v => v.replace(/^"|"$/g, '').trim());

    const lineNumber = index + 2;

    const subject = {
      id: Date.now() + index,
      codigo: values[0] || "",
      nombre: values[1] || "",
      semestre: values[2] || "",
      creditos: values[3] || "",
      prerrequisitos: values[4] && values[4].trim() !== "" ? values[4].trim() : "Ninguno",
      tipo: values[5] || "",
      id_area: values[6] || ""
    };

    // Validar campos obligatorios
    if (!subject.codigo || !subject.nombre || !subject.semestre || !subject.creditos || !subject.tipo || !subject.id_area) {
      errors.push(`Línea ${lineNumber} (${subject.nombre || 'sin nombre'}): Faltan campos obligatorios`);
      return;
    }

    // Validar formato usando validación específica para CSV
    const validationErrors = validateSubjectCSV(subject);
    if (validationErrors.length > 0) {
      errors.push(`Línea ${lineNumber} (${subject.nombre}): ${validationErrors.join(', ')}`);
      return;
    }

    const normalizedCode = normalizeCode(subject.codigo);
    const normalizedName = normalizeName(subject.nombre);

    // Duplicados dentro del mismo archivo o ya cargados
    if (normalizedCode && seenCodes.has(normalizedCode)) {
      duplicatesFound.push(`Código duplicado: ${subject.codigo} (${subject.nombre})`);
      return;
    }
    if (normalizedName && seenNames.has(normalizedName)) {
      duplicatesFound.push(`Nombre duplicado: ${subject.nombre} (${subject.codigo})`);
      return;
    }

    // Marcar como vistos
    if (normalizedCode) seenCodes.add(normalizedCode);
    if (normalizedName) seenNames.add(normalizedName);

    newSubjectsToAdd.push(subject);
  });

  return {
    success: true,
    newSubjectsToAdd,
    errors,
    duplicatesFound
  };
};

export const formatErrorMessage = (items, maxItems = 3) => {
  if (items.length <= maxItems) {
    return items.join('\n');
  }
  return `${items.slice(0, maxItems).join('\n')}\n... y ${items.length - maxItems} más`;
};
