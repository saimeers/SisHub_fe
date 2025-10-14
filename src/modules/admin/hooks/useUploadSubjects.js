import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../hooks/useToast";
import { useSubjectValidation } from "./useSubjectValidation";
import { useSubjectOperations } from "./useSubjectOperations";
import { useSubjectFileUpload } from "./useSubjectFileUpload";
import { useSubjectSubmit } from "./useSubjectSubmit";

export const useUploadSubjects = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { validateSubject, checkDuplicates } = useSubjectValidation();
  
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({
    codigo: "",
    nombre: "",
    semestre: "",
    creditos: "",
    prerrequisitos: "",
    tipo: "Obligatoria",
    id_area: ""
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleFileUpload } = useSubjectFileUpload({
    subjects,
    setSubjects,
    setCurrentPage,
    validateSubject,
    checkDuplicates,
    toast
  });

  const { addSubject, startEdit, saveEdit, cancelEdit, deleteSubject } = useSubjectOperations({
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
    toast
  });

  const { handleSubmit } = useSubjectSubmit({
    subjects,
    setSubjects,
    setIsSubmitting,
    validateSubject,
    toast,
    navigate
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubject(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e, field) => {
    setEditingSubject(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleCancel = async () => {
    if (subjects.length > 0) {
      const Swal = (await import("sweetalert2")).default;
      const result = await Swal.fire({
        title: "¿Cancelar carga?",
        text: `Se perderán ${subjects.length} materia(s) agregada(s)`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No, continuar",
      });

      if (result.isConfirmed) {
        navigate("/admin/subjects");
      }
    } else {
      navigate("/admin/subjects");
    }
  };

  const totalPages = Math.ceil(subjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubjects = subjects.slice(startIndex, endIndex);

  const adjustedEditingIndex = editingIndex !== null &&
    editingIndex >= startIndex &&
    editingIndex < endIndex
    ? editingIndex - startIndex
    : null;

  const goToPage = (page) => {
    setCurrentPage(page);
    setEditingIndex(null);
  };

  return {
    subjects,
    newSubject,
    editingIndex,
    editingSubject,
    itemsPerPage,
    currentPage,
    isSubmitting,
    paginatedSubjects,
    totalPages,
    startIndex,
    endIndex,
    adjustedEditingIndex,
    handleInputChange,
    handleEditInputChange,
    addSubject,
    handleFileUpload,
    startEdit,
    saveEdit,
    cancelEdit,
    deleteSubject,
    handleSubmit,
    handleCancel,
    setItemsPerPage,
    setCurrentPage,
    goToPage,
  };
};


