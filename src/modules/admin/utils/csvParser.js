export const parseCSV = (text, validateUser, checkDuplicates, existingUsers) => {
  const lines = text.split('\n').filter(line => line.trim());

  if (lines.length <= 1) {
    return {
      success: false,
      error: "El archivo CSV está vacío o no tiene datos"
    };
  }

  const newUsersToAdd = [];
  const errors = [];
  const duplicatesFound = [];

  const seenDocuments = new Set();
  const seenEmails = new Set();
  const seenCodes = new Set();

  // Registrar los usuarios ya existentes (para evitar duplicar si se sube el mismo CSV varias veces)
  existingUsers.forEach(u => {
    seenCodes.add(u.codigo.toLowerCase());
    seenDocuments.add(u.documento);
    seenEmails.add(u.correo.toLowerCase());
  });

  lines.slice(1).forEach((line, index) => {
    let cleanLine = line.trim().replace(/^"|"$/g, '');
    let values = cleanLine.includes('\t')
      ? cleanLine.split('\t').map(v => v.trim())
      : cleanLine.split(',').map(v => v.trim());

    const lineNumber = index + 2;

    const user = {
      id: Date.now() + index,
      codigo: values[0] || "",
      nombre: values[1] || "",
      documento: values[2] || "",
      correo: values[3] || "",
      telefono: values[4] || ""
    };

    // Validar campos obligatorios
    if (!user.codigo || !user.nombre || !user.documento || !user.correo) {
      errors.push(`Línea ${lineNumber} (${user.nombre || 'sin nombre'}): Faltan campos obligatorios`);
      return;
    }

    // Validar formato
    const validationErrors = validateUser(user);
    if (validationErrors.length > 0) {
      errors.push(`Línea ${lineNumber} (${user.nombre}): ${validationErrors.join(', ')}`);
      return;
    }

    const lowerCode = user.codigo.toLowerCase();
    const lowerEmail = user.correo.toLowerCase();

    // Duplicados dentro del mismo archivo o ya cargados
    if (seenCodes.has(lowerCode)) {
      duplicatesFound.push(`${user.nombre}: Código duplicado (${user.codigo})`);
      return;
    }
    if (seenDocuments.has(user.documento)) {
      duplicatesFound.push(`${user.nombre}: Documento duplicado (${user.documento})`);
      return;
    }
    if (seenEmails.has(lowerEmail)) {
      duplicatesFound.push(`${user.nombre}: Correo duplicado (${user.correo})`);
      return;
    }

    // Marcar como vistos
    seenCodes.add(lowerCode);
    seenDocuments.add(user.documento);
    seenEmails.add(lowerEmail);

    newUsersToAdd.push(user);
  });

  return {
    success: true,
    newUsersToAdd,
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
