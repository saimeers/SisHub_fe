import { useToast } from "../../../hooks/useToast";

export const useSubjectOperations = ({
  subjects,
  setSubjects,
  newSubject,
  setNewSubject,
  editingSubject,
  setEditingSubject,
  editingIndex,
  setEditingIndex,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  validateSubject,
  checkDuplicates,
  setSelectedPrerequisites,
  existingSubjects,
  toast
}) => {
  const addSubject = () => {
    const validationErrors = validateSubject(newSubject);
    if (validationErrors.length > 0) {
      toast.error(`Errores de validación: ${validationErrors.join(', ')}`);
      return;
    }

    const duplicates = checkDuplicates(subjects, newSubject, -1, existingSubjects);
    if (duplicates.length > 0) {
      toast.error(`Duplicados encontrados: ${duplicates.join(', ')}`);
      return;
    }

    setSubjects(prev => [...prev, { ...newSubject }]);
    setNewSubject({
      codigo: "",
      nombre: "",
      semestre: "",
      creditos: "",
      prerrequisitos: "",
      tipo: "Obligatoria",
      id_area: ""
    });
    // Resetear los prerrequisitos seleccionados
    setSelectedPrerequisites([]);
    toast.success("Materia agregada correctamente");
  };

  const startEdit = (localIndex) => {
    // Calcular el índice global basado en la página actual
    const globalIndex = (currentPage - 1) * itemsPerPage + localIndex;
    const subject = subjects[globalIndex];
    setEditingIndex(globalIndex);
    setEditingSubject({ ...subject });
  };

  const saveEdit = (localIndex) => {
    const validationErrors = validateSubject(editingSubject);
    if (validationErrors.length > 0) {
      toast.error(`Errores de validación: ${validationErrors.join(', ')}`);
      return;
    }

    // Usar el índice global que ya está en editingIndex
    const globalIndex = editingIndex;
    const duplicates = checkDuplicates(subjects, editingSubject, globalIndex, existingSubjects);
    if (duplicates.length > 0) {
      toast.error(`Duplicados encontrados: ${duplicates.join(', ')}`);
      return;
    }

    setSubjects(prev => 
      prev.map((subject, i) => i === globalIndex ? { ...editingSubject } : subject)
    );
    setEditingIndex(null);
    setEditingSubject(null);
    toast.success("Materia actualizada correctamente");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingSubject(null);
  };

  const deleteSubject = (localIndex) => {
    // Calcular el índice global basado en la página actual
    const globalIndex = (currentPage - 1) * itemsPerPage + localIndex;
    
    setSubjects(prev => prev.filter((_, i) => i !== globalIndex));
    
    // Ajustar página si es necesario
    const totalPages = Math.ceil((subjects.length - 1) / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
    
    // Si estamos editando la materia que se eliminó, cancelar la edición
    if (editingIndex === globalIndex) {
      setEditingIndex(null);
      setEditingSubject(null);
    }
    
    toast.success("Materia eliminada correctamente");
  };

  return {
    addSubject,
    startEdit,
    saveEdit,
    cancelEdit,
    deleteSubject
  };
};
