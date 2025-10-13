import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../hooks/useToast";
import { useSubjectValidation } from "./useSubjectValidation";
import { useSubjectOperations } from "./useSubjectOperations";
import { useSubjectFileUpload } from "./useSubjectFileUpload";
import { useSubjectSubmit } from "./useSubjectSubmit";
import { getSubjectCodes, fetchSubjects } from "../../../services/materiaServices";

export const useSubjectForm = () => {
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
    tipo: "",
    id_area: ""
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingCodes, setExistingCodes] = useState([]);
  const [existingSubjects, setExistingSubjects] = useState([]);
  const [selectedPrerequisites, setSelectedPrerequisites] = useState([]);
  const [editingPrerequisites, setEditingPrerequisites] = useState([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);

  // Cargar materias existentes al montar el componente
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        // Cargar códigos para prerrequisitos
        const codes = await getSubjectCodes();
        const codesList = Array.isArray(codes) ? codes : [];
        setExistingCodes(codesList);

        // Cargar materias completas para validación de duplicados
        const subjects = await fetchSubjects();
        const subjectsList = Array.isArray(subjects) ? subjects : [];
        setExistingSubjects(subjectsList);

        console.log("📚 Materias existentes cargadas:", subjectsList.length);
      } catch (err) {
        console.warn("No se pudieron cargar los datos existentes:", err);
        setExistingCodes([]);
        setExistingSubjects([]);
      }
    };

    loadExistingData();
  }, []);

  useEffect(() => {
    const loadFilteredCodes = async () => {
      if (!newSubject.semestre) {
        setExistingCodes([]);
        return;
      }

      setIsLoadingCodes(true);
      try {
        const codes = await getSubjectCodes(newSubject.semestre);
        const codesList = Array.isArray(codes) ? codes : [];
        setExistingCodes(codesList);
        console.log(`🔄 Prerrequisitos para semestre ${newSubject.semestre}:`, codesList.length);

        // Limpiar prerrequisitos seleccionados que ya no son válidos
        if (selectedPrerequisites.length > 0 && !selectedPrerequisites.some(p => p.value === "ninguno")) {
          const validPrereqs = selectedPrerequisites.filter(
            prereq => codesList.some(code => code.codigo === prereq.value)
          );

          if (validPrereqs.length !== selectedPrerequisites.length) {
            if (validPrereqs.length > 0) {
              setSelectedPrerequisites(validPrereqs);
              const codes = validPrereqs.map(opt => opt.value).join(", ");
              setNewSubject(prev => ({ ...prev, prerrequisitos: codes }));
            } else {
              setSelectedPrerequisites([{ value: "ninguno", label: "Ninguno" }]);
              setNewSubject(prev => ({ ...prev, prerrequisitos: "Ninguno" }));
            }
          }
        }
      } catch (err) {
        console.warn("Error al cargar códigos filtrados:", err);
        setExistingCodes([]);
      } finally {
        setIsLoadingCodes(false);
      }
    };

    loadFilteredCodes();
  }, [newSubject.semestre]);

  useEffect(() => {
    const loadFilteredCodesForEdit = async () => {
      if (!editingSubject?.semestre) {
        return;
      }

      setIsLoadingCodes(true);
      try {
        const codes = await getSubjectCodes(editingSubject.semestre);
        const codesList = Array.isArray(codes) ? codes : [];

        // Filtrar el código de la materia que se está editando
        const filteredCodes = codesList.filter(code => code.codigo !== editingSubject.codigo);
        setExistingCodes(filteredCodes);
        console.log(`🔄 Prerrequisitos para edición semestre ${editingSubject.semestre}:`, filteredCodes.length);

        // Limpiar prerrequisitos seleccionados que ya no son válidos
        if (editingPrerequisites.length > 0 && !editingPrerequisites.some(p => p.value === "ninguno")) {
          const validPrereqs = editingPrerequisites.filter(
            prereq => filteredCodes.some(code => code.codigo === prereq.value)
          );

          if (validPrereqs.length !== editingPrerequisites.length) {
            if (validPrereqs.length > 0) {
              setEditingPrerequisites(validPrereqs);
              const codes = validPrereqs.map(opt => opt.value).join(", ");
              setEditingSubject(prev => ({ ...prev, prerrequisitos: codes }));
            } else {
              setEditingPrerequisites([{ value: "ninguno", label: "Ninguno" }]);
              setEditingSubject(prev => ({ ...prev, prerrequisitos: "Ninguno" }));
            }
          }
        }
      } catch (err) {
        console.warn("Error al cargar códigos filtrados para edición:", err);
      } finally {
        setIsLoadingCodes(false);
      }
    };

    loadFilteredCodesForEdit();
  }, [editingSubject?.semestre]);

  // Crear opciones de prerrequisitos
  const prerequisiteOptions = useMemo(() => {
    const options = existingCodes.map((code) => ({
      value: code.codigo,
      label: `${code.codigo} - ${code.nombre}`,
    }));

    // Agregar opción "Ninguno" al inicio
    return [
      { value: "ninguno", label: "Ninguno" },
      ...options
    ];
  }, [existingCodes]);

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
    setSelectedPrerequisites,
    existingSubjects,
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

    // Validación especial para créditos - solo números enteros positivos
    if (name === "creditos") {
      const intValue = parseInt(value);
      if (value === "" || (Number.isInteger(intValue) && intValue > 0)) {
        setNewSubject(prev => ({ ...prev, [name]: value }));
      }
    }
    // Validación especial para código - solo números
    else if (name === "codigo") {
      if (value === "" || /^\d+$/.test(value)) {
        setNewSubject(prev => ({ ...prev, [name]: value }));
      }
    }
    // Validación especial para semestre - solo números positivos (no cero)
    else if (name === "semestre") {
      if (value === "" || (/^\d+$/.test(value) && parseInt(value) > 0)) {
        setNewSubject(prev => ({ ...prev, [name]: value }));
      }
    }
    // Validación especial para id_area - solo números
    else if (name === "id_area") {
      if (value === "" || /^\d+$/.test(value)) {
        setNewSubject(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setNewSubject(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditInputChange = (e, field) => {
    const value = e.target.value;

    // Aplicar las mismas validaciones que en handleInputChange
    if (field === "creditos") {
      const intValue = parseInt(value);
      if (value === "" || (Number.isInteger(intValue) && intValue > 0)) {
        setEditingSubject(prev => ({ ...prev, [field]: value }));
      }
    } else if (field === "codigo") {
      if (value === "" || /^\d+$/.test(value)) {
        setEditingSubject(prev => ({ ...prev, [field]: value }));
      }
    } else if (field === "semestre") {
      if (value === "" || (/^\d+$/.test(value) && parseInt(value) > 0)) {
        setEditingSubject(prev => ({ ...prev, [field]: value }));
      }
    } else if (field === "id_area") {
      if (value === "" || /^\d+$/.test(value)) {
        setEditingSubject(prev => ({ ...prev, [field]: value }));
      }
    } else {
      setEditingSubject(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePrerequisitesChange = (selectedOptions) => {
    const options = selectedOptions || [];
    setSelectedPrerequisites(options);

    // Si se selecciona "ninguno", limpiar otras selecciones
    if (options.some && options.some(opt => opt.value === "ninguno")) {
      setSelectedPrerequisites([{ value: "ninguno", label: "Ninguno" }]);
      setNewSubject(prev => ({ ...prev, prerrequisitos: "Ninguno" }));
    } else {
      // Filtrar "ninguno" si está seleccionado junto con otros
      const filteredOptions = options.filter ? options.filter(opt => opt.value !== "ninguno") : [];
      setSelectedPrerequisites(filteredOptions);

      if (filteredOptions.length === 0) {
        setNewSubject(prev => ({ ...prev, prerrequisitos: "" }));
      } else {
        const codes = filteredOptions.map(opt => opt.value).join(", ");
        setNewSubject(prev => ({ ...prev, prerrequisitos: codes }));
      }
    }
  };

  const handleEditPrerequisitesChange = (selectedOptions) => {
    const options = selectedOptions || [];
    setEditingPrerequisites(options);

    // Si se selecciona "ninguno", limpiar otras selecciones
    if (options.some && options.some(opt => opt.value === "ninguno")) {
      setEditingPrerequisites([{ value: "ninguno", label: "Ninguno" }]);
      setEditingSubject(prev => ({ ...prev, prerrequisitos: "Ninguno" }));
    } else {
      // Filtrar "ninguno" si está seleccionado junto con otros
      const filteredOptions = options.filter ? options.filter(opt => opt.value !== "ninguno") : [];
      setEditingPrerequisites(filteredOptions);

      if (filteredOptions.length === 0) {
        setEditingSubject(prev => ({ ...prev, prerrequisitos: "" }));
      } else {
        const codes = filteredOptions.map(opt => opt.value).join(", ");
        setEditingSubject(prev => ({ ...prev, prerrequisitos: codes }));
      }
    }
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
    // No resetear editingIndex aquí, se maneja en las operaciones específicas
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
    prerequisiteOptions,
    handlePrerequisitesChange,
    handleEditPrerequisitesChange,
    selectedPrerequisites,
    editingPrerequisites,
    isLoadingCodes,
  };
};
