// src/modules/admin/utils/groupCsvParser.js

// Función para parsear CSV de grupos
const parseGroupsCSV = (text, existingGroups = []) => {
  const lines = text.split("\n").filter((line) => line.trim());

  if (lines.length === 0) {
    return {
      success: false,
      error: "El archivo CSV está vacío",
    };
  }

  const newGroups = [];
  const errors = [];
  const duplicatesFound = [];

  const seenCodes = new Set();
  const seenNames = new Set();

  existingGroups.forEach((g) => {
    seenCodes.add(g.codigo_materia?.toLowerCase());
    seenNames.add(g.nombre_grupo?.toLowerCase());
  });

  let startIndex = 0;

  // Detectar encabezado: si la primera línea tiene letras o palabras clave
  const firstLineValues = lines[0]
    .trim()
    .split(";")
    .map((v) => v.trim().toLowerCase());

  if (
    firstLineValues.some((v) => isNaN(v)) &&
    firstLineValues.some((v) => /codigo|nombre|periodo|anio|docente/.test(v))
  ) {
    startIndex = 1; // ignorar primera línea
  }

  for (let i = startIndex; i < lines.length; i++) {
    const lineNumber = i + 1;
    const values = lines[i]
      .trim()
      .split(";")
      .map((v) => v.trim());

    if (values.length < 5) {
      errors.push(`Línea ${lineNumber}: No contiene las 5 columnas requeridas`);
      continue;
    }

    const [codigo_materia, nombre_grupo, periodo, anio, codigo_docente] =
      values;

    if (
      !codigo_materia ||
      !nombre_grupo ||
      !periodo ||
      !anio ||
      !codigo_docente
    ) {
      errors.push(
        `Línea ${lineNumber} (${
          nombre_grupo || "sin nombre"
        }): Faltan campos obligatorios`
      );
      continue;
    }

    if (!/^\d{4}$/.test(anio)) {
      errors.push(
        `Línea ${lineNumber} (${nombre_grupo}): El año debe tener 4 dígitos`
      );
      continue;
    }

    if (!/^(1|2|I|II)$/i.test(periodo)) {
      errors.push(
        `Línea ${lineNumber} (${nombre_grupo}): El periodo debe ser 1, 2, I o II`
      );
      continue;
    }

    const lowerCode = codigo_materia.toLowerCase();
    const lowerName = nombre_grupo.toLowerCase();

    if (seenCodes.has(lowerCode)) {
      duplicatesFound.push(
        `Línea ${lineNumber}: Código de materia duplicado (${codigo_materia})`
      );
      continue;
    }

    if (seenNames.has(lowerName)) {
      duplicatesFound.push(
        `Línea ${lineNumber}: Nombre de grupo duplicado (${nombre_grupo})`
      );
      continue;
    }

    seenCodes.add(lowerCode);
    seenNames.add(lowerName);

    newGroups.push({
      codigo_materia,
      nombre_grupo,
      periodo,
      anio,
      codigo_docente,
    });
  }

  return {
    success: true,
    data: newGroups,
    errors,
    duplicatesFound,
  };
};

// Función para formatear errores de CSV
const formatGroupCSVErrors = (items, maxItems = 3) => {
  if (!items || items.length === 0) return null;
  if (items.length <= maxItems) return items.join("\n");
  return `${items.slice(0, maxItems).join("\n")}\n... y ${
    items.length - maxItems
  } más`;
};

// Export nombrado para ambas funciones
export { parseGroupsCSV, formatGroupCSVErrors };
