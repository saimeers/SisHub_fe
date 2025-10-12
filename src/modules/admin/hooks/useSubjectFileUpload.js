import { useToast } from "../../../hooks/useToast";
import { parseSubjectCSV, formatErrorMessage } from "../utils/subjectCsvParser";

export const useSubjectFileUpload = ({
  subjects,
  setSubjects,
  setCurrentPage,
  validateSubject,
  checkDuplicates,
  toast
}) => {
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.name !== "materias.csv") {
      toast.error("El archivo debe llamarse 'materias.csv'");
      return;
    }

    if (!file.name.endsWith('.csv')) {
      toast.error("El archivo debe ser de tipo CSV");
      return;
    }

    try {
      const text = await file.text();
      const result = parseSubjectCSV(text, validateSubject, checkDuplicates, subjects);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (result.errors.length > 0) {
        const errorMessage = formatErrorMessage(result.errors);
        toast.error(`Errores encontrados:\n${errorMessage}`);
      }

      if (result.duplicatesFound.length > 0) {
        const duplicateMessage = formatErrorMessage(result.duplicatesFound);
        toast.warning(`Duplicados encontrados:\n${duplicateMessage}`);
      }

      if (result.newSubjectsToAdd.length > 0) {
        setSubjects(prev => [...prev, ...result.newSubjectsToAdd]);
        setCurrentPage(1);
        toast.success(`${result.newSubjectsToAdd.length} materia(s) agregada(s) correctamente`);
      } else {
        toast.warning("No se agregaron materias nuevas");
      }

    } catch (error) {
      toast.error("Error al procesar el archivo CSV");
      console.error("Error processing CSV:", error);
    }
  };

  return {
    handleFileUpload
  };
};
