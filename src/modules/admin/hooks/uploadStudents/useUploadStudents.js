import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../../hooks/useToast";
import Swal from "sweetalert2";
import Papa from "papaparse";
import { pollProgress } from "../../../../services/progressService";
import { matricularEstudiantesMasivamente, buscarEstudiantePorCodigo } from "../../../../services/userServices";
import { obtenerGrupos } from "../../../../services/groupServices";

export const useUploadStudents = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({
    codigo: "",
    nombre: "",
    documento: "",
    correo: "",
    telefono: "",
    codigo_materia: "",
    nombre_grupo: "",
    periodo: "",
    anio: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [loadingStudent, setLoadingStudent] = useState(false);

  // Cargar grupos disponibles al montar el componente
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const grupos = await obtenerGrupos();
        setAvailableGroups(grupos);
      } catch (error) {
        console.error("Error al cargar grupos:", error);
        toast.error("No se pudieron cargar los grupos disponibles");
      }
    };
    fetchGroups();
  }, []);

  const totalPages = Math.ceil(students.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = students.slice(startIndex, endIndex);

  const adjustedEditingIndex = useMemo(() => {
    if (editingIndex === null) return null;
    return editingIndex - startIndex;
  }, [editingIndex, startIndex]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e, field) => {
    if (field === 'groupData') {
      setEditingStudent((prev) => ({
        ...prev,
        ...e.target.value
      }));
    } else {
      setEditingStudent((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    }
  };

  // Autocompletar datos del estudiante cuando se ingresa el código
  const handleStudentCodeBlur = async (codigo, isEditing = false) => {
    if (!codigo) return;

    const cleanCode = codigo.trim();

    const codigoValido = /^[0-9]{7}$/;

    if (!codigoValido.test(cleanCode)) {
      toast.error("El código debe tener 7 dígitos numéricos sin letras ni símbolos");
      return;
    }

    setLoadingStudent(true);
    try {
      const estudianteData = await buscarEstudiantePorCodigo(cleanCode);

      if (estudianteData) {
        const updatedData = {
          codigo: estudianteData.estudiante.codigo || "",
          nombre: estudianteData.estudiante.nombre || "",
          documento: estudianteData.estudiante.documento || "",
          correo: estudianteData.estudiante.correo || "",
          telefono: estudianteData.estudiante.telefono || "",
        };

        if (isEditing) {
          setEditingStudent(prev => ({ ...prev, ...updatedData }));
        } else {
          setNewStudent(prev => ({ ...prev, ...updatedData }));
        }

        toast.success("Datos del estudiante cargados correctamente");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.warning("Estudiante no registrado. Digite sus datos");
      } else {
        console.error("Error al buscar estudiante:", error);
        toast.error(error.message || "Error al buscar estudiante por código");
      }
    } finally {
      setLoadingStudent(false);
    }
  };

  const validateStudent = (student) => {
    const errors = [];

    if (!student.codigo?.trim()) errors.push("código");
    if (!student.nombre?.trim()) errors.push("nombre");
    if (!student.documento?.trim()) errors.push("documento");
    if (!student.correo?.trim()) errors.push("correo");
    if (!student.codigo_materia?.trim()) errors.push("código de materia");
    if (!student.nombre_grupo?.trim()) errors.push("nombre de grupo");
    if (!student.periodo?.trim()) errors.push("período");
    if (!student.anio?.trim()) errors.push("año");

    if (!student.correo?.includes("@ufps.edu.co")) {
      errors.push("correo debe ser @ufps.edu.co");
    }

    return errors;
  };

  const addStudent = () => {
    const errors = validateStudent(newStudent);

    if (errors.length > 0) {
      toast.error(`Faltan campos obligatorios: ${errors.join(", ")}`);
      return;
    }

    // Verificar duplicados en el mismo grupo
    const isDuplicate = students.some((s) =>
      s.codigo === newStudent.codigo &&
      s.codigo_materia === newStudent.codigo_materia &&
      s.nombre_grupo === newStudent.nombre_grupo &&
      s.periodo === newStudent.periodo &&
      s.anio === newStudent.anio
    );

    if (isDuplicate) {
      toast.error("Ya existe un estudiante con ese código en el mismo grupo");
      return;
    }

    setStudents([...students, { ...newStudent, id: Date.now() }]);
    setNewStudent({
      codigo: "",
      nombre: "",
      documento: "",
      correo: "",
      telefono: "",
      codigo_materia: "",
      nombre_grupo: "",
      periodo: "",
      anio: "",
    });
    setCurrentPage(1);
    toast.success("Estudiante añadido correctamente");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validStudents = [];
        const invalidRows = [];

        results.data.forEach((row, index) => {
          const student = {
            id: Date.now() + index,
            codigo: row.codigo?.trim() || "",
            nombre: row.nombre?.trim() || "",
            documento: row.documento?.trim() || "",
            correo: row.correo?.trim() || "",
            telefono: row.telefono?.trim() || "",
            codigo_materia: row.codigo_materia?.trim() || "",
            nombre_grupo: row.nombre_grupo?.trim() || "",
            periodo: row.periodo?.trim() || "",
            anio: row.anio?.trim() || "",
          };

          const errors = validateStudent(student);
          if (errors.length === 0) {
            validStudents.push(student);
          } else {
            invalidRows.push({ row: index + 2, errors });
          }
        });

        if (invalidRows.length > 0) {
          const errorMsg = invalidRows
            .slice(0, 5)
            .map((item) => `Fila ${item.row}: ${item.errors.join(", ")}`)
            .join("\n");

          toast.warning(
            `Se encontraron ${invalidRows.length} filas con errores. ${invalidRows.length > 5 ? "Mostrando las primeras 5:" : ""
            }\n${errorMsg}`,
            { autoClose: 8000 }
          );
        }

        if (validStudents.length > 0) {
          setStudents(validStudents);
          setCurrentPage(1);
          toast.success(`${validStudents.length} estudiantes cargados correctamente`);
        } else {
          toast.error("No se encontraron estudiantes válidos en el archivo");
        }
      },
      error: (error) => {
        console.error("Error al procesar CSV:", error);
        toast.error("Error al leer el archivo CSV");
      },
    });

    e.target.value = "";
  };

  const startEdit = (index) => {
    const actualIndex = startIndex + index;
    setEditingIndex(actualIndex);
    setEditingStudent({ ...students[actualIndex] });
  };

  const saveEdit = () => {
    const errors = validateStudent(editingStudent);

    if (errors.length > 0) {
      toast.error(`Faltan campos obligatorios: ${errors.join(", ")}`);
      return;
    }

    const updatedStudents = [...students];
    updatedStudents[editingIndex] = editingStudent;
    setStudents(updatedStudents);
    setEditingIndex(null);
    setEditingStudent(null);
    toast.success("Estudiante actualizado correctamente");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingStudent(null);
  };

  const deleteStudent = async (index) => {
    const actualIndex = startIndex + index;
    const student = students[actualIndex];

    const result = await Swal.fire({
      title: "¿Eliminar estudiante?",
      html: `¿Estás seguro de eliminar a <strong>${student.nombre}</strong>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      setStudents(students.filter((_, i) => i !== actualIndex));

      // Ajustar página si es necesario
      const newTotalPages = Math.ceil((students.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      toast.success("Estudiante eliminado");
    }
  };

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressData, setProgressData] = useState(null);

  const handleSubmit = async () => {
    if (students.length === 0) {
      toast.error("No hay estudiantes para matricular");
      return;
    }

    // Validar que todos los estudiantes tengan datos de grupo completos
    const studentsWithoutGroup = students.filter(s =>
      !s.codigo_materia || !s.nombre_grupo || !s.periodo || !s.anio
    );

    if (studentsWithoutGroup.length > 0) {
      toast.error(`${studentsWithoutGroup.length} estudiante(s) no tienen grupo asignado`);
      console.error("Estudiantes sin grupo:", studentsWithoutGroup);
      return;
    }

    // Agrupar estudiantes por grupo
    const matriculasPorGrupo = {};

    students.forEach(student => {
      const key = `${student.codigo_materia}-${student.nombre_grupo}-${student.periodo}-${student.anio}`;

      if (!matriculasPorGrupo[key]) {
        matriculasPorGrupo[key] = {
          codigo_materia: student.codigo_materia,
          nombre_grupo: student.nombre_grupo,
          periodo: student.periodo,
          anio: parseInt(student.anio),
          estudiantes: []
        };
      }

      matriculasPorGrupo[key].estudiantes.push({
        codigo: student.codigo,
        nombre: student.nombre,
        documento: student.documento,
        correo: student.correo,
        telefono: student.telefono || ""
      });
    });

    const matriculas = Object.values(matriculasPorGrupo);

    // Log de depuración
    console.log("📊 Estudiantes a matricular:", students);
    console.log("📦 Payload agrupado:", { matriculas });

    const result = await Swal.fire({
      title: "¿Matricular estudiantes?",
      html: `
      <div style="text-align: center;">
        <p>Se matricularán <strong>${students.length} estudiante(s)</strong> en <strong>${matriculas.length} grupo(s)</strong>.</p>
        <ul style="margin-top: 10px; font-size: 0.9em; color: #374151; text-align: left; list-style: none; padding-left: 20px;">
          <li>✓ Los estudiantes serán agregados a sus respectivos grupos</li>
          <li>✓ Recibirán acceso inmediato al sistema</li>
        </ul>
        <div style="margin-top: 15px; padding: 10px; background: #f3f4f6; border-radius: 8px; text-align: left; font-size: 0.85em;">
          <p style="margin: 0; font-weight: 600; color: #374151;">Grupos:</p>
          ${matriculas.map(m =>
        `<p style="margin: 5px 0; color: #6b7280;">• ${m.codigo_materia} - ${m.nombre_grupo} (${m.periodo}/${m.anio}) - ${m.estudiantes.length} estudiante(s)</p>`
      ).join('')}
        </div>
      </div>
    `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, matricular",
      cancelButtonText: "Cancelar",
      width: '600px'
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);
    setShowProgressModal(true);

    try {
      console.log("🚀 Enviando payload:", { matriculas });

      // Iniciar proceso (retorna progressId)
      const response = await matricularEstudiantesMasivamente(matriculas);
      const { progressId } = response;

      console.log("✅ Respuesta del servidor:", response);
      console.log("🔑 Progress ID:", progressId);

      // Iniciar polling del progreso
      const cleanup = pollProgress(
        progressId,
        // onUpdate - Se ejecuta cada vez que hay una actualización
        (progress) => {
          console.log("📊 Progreso actualizado:", progress);
          setProgressData(progress);
        },
        // onComplete - Se ejecuta cuando termina exitosamente
        (finalProgress) => {
          console.log("✅ Proceso completado:", finalProgress);
          setProgressData(finalProgress);
          setIsSubmitting(false);

          toast.success(
            `¡Matrícula completada! ${finalProgress.success?.length || 0} estudiantes matriculados`
          );
        },
        // onError - Se ejecuta si hay un error
        (error) => {
          console.error("❌ Error en progreso:", error);
          setIsSubmitting(false);
          setShowProgressModal(false);

          Swal.fire({
            title: "Error en el proceso",
            text: error.message || "Error al procesar la matrícula",
            icon: "error",
            confirmButtonColor: "#dc2626",
          });
        },
        1000 // Intervalo de polling: 1 segundo
      );

      // Guardar cleanup function para poder cancelar el polling si es necesario
      // (opcional, puedes usarlo si implementas un botón de cancelar)
      return cleanup;

    } catch (error) {
      console.error("❌ Error al iniciar matrícula:", error);
      console.error("Error response:", error.response?.data);

      setIsSubmitting(false);
      setShowProgressModal(false);

      const errorMessage = error.response?.data?.mensaje ||
        error.response?.data?.error ||
        error.message ||
        "Error al matricular estudiantes";

      const errorDetails = error.response?.data?.detalle || "";

      Swal.fire({
        title: "Error al iniciar la matrícula",
        html: `
        <div style="text-align: left;">
          <p style="color: #dc2626; font-weight: 600; margin-bottom: 10px;">${errorMessage}</p>
          ${errorDetails ? `
            <p style="font-size: 0.85em; color: #6b7280; padding: 10px; background-color: #fef2f2; border-left: 3px solid #dc2626; border-radius: 4px;">
              ${errorDetails}
            </p>
          ` : ''}
          <p style="font-size: 0.85em; color: #6b7280; margin-top: 15px;">
            Por favor verifica los datos e intenta nuevamente.
          </p>
        </div>
      `,
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const handleCancel = async () => {
    if (students.length === 0) {
      navigate("/admin/dashboard");
      return;
    }

    const result = await Swal.fire({
      title: "¿Cancelar operación?",
      text: `Se perderán ${students.length} estudiante(s) añadido(s)`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Volver",
    });

    if (result.isConfirmed) {
      navigate("/admin/dashboard");
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    setEditingIndex(null);
    setEditingStudent(null);
  };

  const handleCloseProgress = () => {
    setShowProgressModal(false);
  };

  return {
    students,
    newStudent,
    editingIndex,
    editingStudent,
    itemsPerPage,
    currentPage,
    isSubmitting,
    paginatedStudents,
    totalPages,
    startIndex,
    endIndex,
    adjustedEditingIndex,
    handleInputChange,
    handleEditInputChange,
    addStudent,
    handleFileUpload,
    startEdit,
    saveEdit,
    cancelEdit,
    deleteStudent,
    handleSubmit,
    handleCancel,
    setItemsPerPage,
    setCurrentPage,
    goToPage,
    handleStudentCodeBlur,
    availableGroups,
    loadingStudent,
    showProgressModal,
    progressData,
    handleCloseProgress,
  };
};