export const parseStudentCSV = (content, validateStudent, checkDuplicates, existingStudents) => {
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return { success: false, error: 'El archivo CSV está vacío' };
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredHeaders = ['codigo_materia', 'nombre_grupo', 'periodo', 'anio', 'codigo', 'nombre', 'documento', 'correo'];
  
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    return { 
      success: false, 
      error: `Faltan columnas requeridas: ${missingHeaders.join(', ')}` 
    };
  }

  const newStudentsToAdd = [];
  const errors = [];
  const duplicatesFound = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    
    if (values.length < requiredHeaders.length) continue;

    const student = {
      id: Date.now() + i,
      grupo_identificador: `${values[0]}-${values[1]}-${values[2]}-${values[3]}`,
      codigo_materia: values[0],
      nombre_grupo: values[1],
      periodo: values[2],
      anio: values[3],
      codigo: values[4],
      nombre: values[5],
      documento: values[6],
      correo: values[7],
      telefono: values[8] || ''
    };

    const validationErrors = validateStudent(student);
    if (validationErrors.length > 0) {
      errors.push(`Línea ${i + 1} (${student.nombre}): ${validationErrors.join(', ')}`);
      continue;
    }

    const duplicates = checkDuplicates(student, [...existingStudents, ...newStudentsToAdd]);
    if (duplicates.length > 0) {
      duplicatesFound.push(`${student.nombre} (${student.grupo_identificador}): ${duplicates[0]}`);
      continue;
    }

    newStudentsToAdd.push(student);
  }

  return { success: true, newStudentsToAdd, errors, duplicatesFound };
};

export const formatErrorMessage = (errors, maxDisplay = 3) => {
  if (errors.length <= maxDisplay) {
    return errors.join('\n');
  }
  return errors.slice(0, maxDisplay).join('\n') + `\n... y ${errors.length - maxDisplay} más`;
};