// src/modules/admin/utils/groupCsvParser.js

// Función para parsear CSV de grupos
const parseGroupsCSV = (text, existingGroups = []) => {
  const lines = text
    .split("\n")
    .map((line) => line.replace(/\r/g, "").replace(/\uFEFF/g, "")) // 🔥 limpia BOM y \r
    .filter((line) => line.trim());

  if (lines.length === 0) {
    return {
      success: false,
      error: "El archivo CSV está vacío",
    };
  }

  const newGroups = [];
  const errors = [];
  const duplicatesFound = [];

  // 🔥 CAMBIO CRÍTICO: Usar llave compuesta
  const seenKeys = new Set();

  // Agregar grupos existentes al Set con llave compuesta
  existingGroups.forEach((g) => {
    const key =
      `${g.codigo_materia}-${g.nombre_grupo}-${g.periodo}-${g.anio}`.toLowerCase();
    seenKeys.add(key);
  });

  let startIndex = 0;

  // Detectar encabezado
  const firstLineValues = lines[0]
    .trim()
    .split(";")
    .map((v) => v.trim().toLowerCase());

  if (
    firstLineValues.some((v) => isNaN(v)) &&
    firstLineValues.some((v) => /codigo|nombre|periodo|anio|docente/.test(v))
  ) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const lineNumber = i + 1;
    const line = lines[i].trim();

    const values = line.split(";").map((v) => v.trim());

    if (values.length < 5) {
      const error = `Línea ${lineNumber}: No contiene las 5 columnas requeridas (tiene ${values.length})`;
      errors.push(error);
      continue;
    }

    let [codigo_materia, nombre_grupo, periodo, anio, codigo_docente] = values;

    // Validar campos obligatorios
    if (
      !codigo_materia ||
      !nombre_grupo ||
      !periodo ||
      !anio ||
      !codigo_docente
    ) {
      const error = `Línea ${lineNumber} (${
        nombre_grupo || "sin nombre"
      }): Faltan campos obligatorios`;
      errors.push(error);
      continue;
    }

    // Validar año (debe ser 4 dígitos)
    if (!/^\d{4}$/.test(anio)) {
      const error = `Línea ${lineNumber} (${nombre_grupo}): El año debe tener 4 dígitos (recibido: "${anio}")`;
      errors.push(error);
      continue;
    }

    // Normalizar y validar periodo
    let periodoNormalizado = periodo.trim();

    // Convertir I/II a 01/02
    if (periodoNormalizado.toUpperCase() === "I") {
      periodoNormalizado = "01";
    } else if (periodoNormalizado.toUpperCase() === "II") {
      periodoNormalizado = "02";
    } else if (periodoNormalizado === "1") {
      periodoNormalizado = "01";
    } else if (periodoNormalizado === "2") {
      periodoNormalizado = "02";
    }

    if (!/^(01|02)$/.test(periodoNormalizado)) {
      const error = `Línea ${lineNumber} (${nombre_grupo}): El periodo debe ser 1, 2, 01, 02, I o II (recibido: "${periodo}")`;
      errors.push(error);
      continue;
    }

    // 🔥 VALIDAR DUPLICADOS CON LLAVE COMPUESTA
    const key =
      `${codigo_materia}-${nombre_grupo}-${periodoNormalizado}-${anio}`.toLowerCase();

    if (seenKeys.has(key)) {
      const duplicate = `Línea ${lineNumber}: Grupo duplicado (${codigo_materia}-${nombre_grupo}-${anio}-${periodoNormalizado})`;
      duplicatesFound.push(duplicate);
      continue;
    }

    // Agregar al Set
    seenKeys.add(key);

    // Normalizar nombre del grupo a mayúsculas
    const nombreGrupoNormalizado = nombre_grupo.toUpperCase();

    const grupo = {
      codigo_materia,
      nombre_grupo: nombreGrupoNormalizado,
      periodo: periodoNormalizado,
      anio,
      codigo_docente,
      id: Date.now() + Math.random(), // ID único temporal
    };

    newGroups.push(grupo);
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
