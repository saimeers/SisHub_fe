import { parseCSV, formatErrorMessage } from "../utils/csvParser";

export const useFileUpload = ({ users, setUsers, setCurrentPage, validateUser, checkDuplicates, toast }) => {
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = parseCSV(
        event.target.result,
        validateUser,
        checkDuplicates,
        users
      );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const { newUsersToAdd, errors, duplicatesFound } = result;

      if (newUsersToAdd.length > 0) {
        setUsers(prev => [...prev, ...newUsersToAdd]);
        setCurrentPage(1);
        toast.success(`✓ ${newUsersToAdd.length} docente(s) importado(s) correctamente`);
      }

      if (duplicatesFound.length > 0) {
        toast.warning(`⚠ ${duplicatesFound.length} usuario(s) duplicado(s) omitido(s):\n${formatErrorMessage(duplicatesFound)}`);
      }

      if (errors.length > 0) {
        toast.error(`✗ ${errors.length} error(es) encontrado(s):\n${formatErrorMessage(errors)}`);
      }

      if (newUsersToAdd.length === 0 && errors.length === 0 && duplicatesFound.length === 0) {
        toast.warning("No se encontraron usuarios válidos para importar");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return { handleFileUpload };
};
