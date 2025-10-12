import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import UploadGroupsTable from "./UploadGroupsTable";
import { useToast } from "../../../hooks/useToast";
import Swal from "sweetalert2";
import { cargarGruposDesdeCSV } from "../../../services/groupServices";
import { parseGroupsCSV, formatGroupCSVErrors } from "../utils/groupCsvParser";

const UploadGroups = () => {
  const navigate = useNavigate();
  const { success, error, warning, info } = useToast();

  // ==================== ESTADOS ====================
  const [groups, setGroups] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [newGroup, setNewGroup] = useState({
    codigo_materia: "",
    nombre_grupo: "",
    periodo: "",
    anio: "",
    codigo_docente: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ==================== HANDLERS ====================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGroup((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e, field) => {
    setEditingGroup((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const addGroup = () => {
    const camposVacios = Object.values(newGroup).some((v) => !v.trim());
    if (camposVacios) {
      warning("Por favor completa todos los campos obligatorios");
      return;
    }

    // Validar año (debe ser 4 dígitos)
    if (!/^\d{4}$/.test(newGroup.anio.trim())) {
      error("El año debe tener exactamente 4 dígitos (ej: 2025)");
      return;
    }

    // Validar periodo (debe ser 01 o 02)
    const periodoNormalizado = newGroup.periodo.trim().padStart(2, "0");
    if (!/^(01|02)$/.test(periodoNormalizado)) {
      error("El periodo debe ser: 01 o 02");
      return;
    }

    setGroups((prev) => [
      ...prev,
      { ...newGroup, periodo: periodoNormalizado, id: Date.now() },
    ]);
    setNewGroup({
      codigo_materia: "",
      nombre_grupo: "",
      periodo: "",
      anio: "",
      codigo_docente: "",
    });
    setCurrentPage(1);
    success(`Grupo ${newGroup.nombre_grupo} agregado correctamente`);
  };

  // 📂 Cargar CSV
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      error("Solo se permiten archivos CSV.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      error("El archivo es demasiado grande. Máximo 2MB permitido.");
      return;
    }

    try {
      info("Procesando archivo CSV, por favor espera...");

      const text = await file.text();
      const {
        success: parseSuccess,
        data,
        errors,
        duplicatesFound,
      } = parseGroupsCSV(text, groups);

      if (!parseSuccess || data.length === 0) {
        const mensaje =
          formatGroupCSVErrors(errors) || "No se encontraron grupos válidos";
        warning(mensaje);
        return;
      }

      // Guardamos el archivo original
      setCsvFile(file);

      success(`Se cargaron ${data.length} grupos correctamente.`);
      setGroups((prev) => [...prev, ...data]);
    } catch (err) {
      error("Error al procesar el archivo CSV. Verifica el formato.");
    } finally {
      e.target.value = "";
    }
  };

  const startEdit = (index) => {
    const actualIndex = (currentPage - 1) * itemsPerPage + index;
    setEditingIndex(actualIndex);
    setEditingGroup({ ...groups[actualIndex] });
  };

  const saveEdit = (index) => {
    // Validar campos vacíos
    const { codigo_materia, nombre_grupo, periodo, anio, codigo_docente } =
      editingGroup;

    if (
      !codigo_materia?.toString().trim() ||
      !nombre_grupo?.toString().trim() ||
      !periodo?.toString().trim() ||
      !anio?.toString().trim() ||
      !codigo_docente?.toString().trim()
    ) {
      warning("Por favor completa todos los campos obligatorios");
      return;
    }

    // Validar año (debe ser 4 dígitos)
    const anioStr = anio.toString().trim();
    if (!/^\d{4}$/.test(anioStr)) {
      error("El año debe tener exactamente 4 dígitos (ej: 2025)");
      return;
    }

    // Validar periodo (debe ser 01 o 02)
    const periodoStr = periodo.toString().trim();
    const periodoNormalizado = periodoStr.padStart(2, "0");
    if (!/^(01|02)$/.test(periodoNormalizado)) {
      error("El periodo debe ser: 01 o 02 (puedes escribir 1 o 2)");
      return;
    }

    const actualIndex = (currentPage - 1) * itemsPerPage + index;
    const updated = [...groups];
    updated[actualIndex] = {
      ...editingGroup,
      periodo: periodoNormalizado,
      anio: anioStr,
    };
    setGroups(updated);
    setEditingIndex(null);
    setEditingGroup(null);

    // Si editamos, invalidamos el archivo CSV original
    setCsvFile(null);

    success(`Grupo ${nombre_grupo} actualizado`);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingGroup(null);
  };

  const deleteGroup = async (index) => {
    const actualIndex = (currentPage - 1) * itemsPerPage + index;
    const groupName = groups[actualIndex].nombre_grupo;

    const result = await Swal.fire({
      title: `¿Eliminar ${groupName}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      setGroups((prev) => prev.filter((_, i) => i !== actualIndex));

      // Si eliminamos, invalidamos el archivo CSV original
      setCsvFile(null);

      Swal.fire({
        title: "Eliminado",
        text: `${groupName} eliminado correctamente.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const handleSubmit = async () => {
    if (groups.length === 0) {
      warning("No hay grupos para cargar");
      return;
    }

    const result = await Swal.fire({
      title: "¿Confirmar carga de grupos?",
      html: `<p>Se cargarán <strong>${groups.length}</strong> grupos al sistema.</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#B70000",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cargar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);
    try {
      const csvContent = [
        "codigo_materia;nombre_grupo;periodo;anio;codigo_docente",
        ...groups.map(
          (g) =>
            `${g.codigo_materia};${g.nombre_grupo};${g.periodo};${g.anio};${g.codigo_docente}`
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const file = new File([blob], "grupos.csv", { type: "text/csv" });

      const response = await cargarGruposDesdeCSV(file);
      const { resultado } = response;
      // Construir mensaje con scroll
      let mensaje = `<div class="text-left" style="font-family: system-ui, -apple-system, sans-serif;">`;
      mensaje += `<p class="font-semibold mb-3" style="font-size: 16px; color: #1f2937;"> Resumen:</p>`;

      // Exitosos con scroll
      if (resultado.exitosos > 0) {
        mensaje += `<p style="font-weight: 600; color: #059669; margin-bottom: 8px;">${resultado.exitosos} Exitoso(s)</p>`;
        mensaje += `<div style="max-height: 160px; overflow-y: auto; background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 12px; margin-bottom: 16px;">`;
        mensaje += `<ul style="margin: 0; padding: 0; list-style: none;">`;
        resultado.detalles_exitosos.forEach((msg) => {
          mensaje += `<li style="margin-bottom: 6px; color: #047857; font-size: 14px;">• ${msg}</li>`;
        });
        mensaje += `</ul>`;
        mensaje += `</div>`;
      }

      // Errores con scroll
      if (resultado.fallidos > 0) {
        mensaje += `<p style="font-weight: 600; color: #dc2626; margin-bottom: 8px;"> ${resultado.fallidos} Error(es) encontrado(s):</p>`;
        mensaje += `<div style="max-height: 160px; overflow-y: auto; background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 12px; margin-bottom: 16px;">`;
        mensaje += `<ul style="margin: 0; padding: 0; list-style: none;">`;
        resultado.detalles_errores.forEach((err) => {
          mensaje += `<li style="margin-bottom: 6px; color: #b91c1c; font-size: 14px;">• ${err}</li>`;
        });
        mensaje += `</ul>`;
        mensaje += `</div>`;
      }

      mensaje += `</div>`;

      await Swal.fire({
        title:
          resultado.fallidos > 0
            ? "Carga completada con errores"
            : "¡Carga exitosa!",
        html: mensaje,
        icon:
          resultado.fallidos > 0 && resultado.exitosos === 0
            ? "error"
            : resultado.fallidos > 0
            ? "warning"
            : "success",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#B70000",
        width: "650px",
        customClass: {
          popup: "swal-scrollable",
        },
      });

      if (resultado.exitosos > 0) {
        navigate("/admin/grupos");
      }
    } catch (err) {
      console.error("Error al subir grupos:", err);
      error(err.message || "Error al subir los grupos");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(groups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGroups = groups.slice(startIndex, startIndex + itemsPerPage);
  const adjustedEditingIndex =
    editingIndex !== null &&
    editingIndex >= startIndex &&
    editingIndex < startIndex + itemsPerPage
      ? editingIndex - startIndex
      : null;

  const goToPage = (page) => {
    setCurrentPage(page);
    setEditingIndex(null);
  };

  // ==================== RENDER ====================
  return (
    <AdminLayout title="Cargar Grupos">
      <div className="space-y-6">
        {/* Header */}
        <div>
          {/* Header */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
              <p className="text-gray-600">
                Añade grupos manualmente o importa desde un archivo CSV
              </p>

              {/* Botón Importar CSV */}
              <label className="cursor-pointer self-end sm:self-auto">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <div
                  className={`bg-[#B70000] hover:bg-red-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 text-base shadow-md ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Importar CSV
                </div>
              </label>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Formato CSV: codigo_materia;nombre_grupo;periodo;año;codigo_docente
          </p>
        </div>

        {/* Tabla */}
        <UploadGroupsTable
          groups={groups}
          newGroup={newGroup}
          editingIndex={adjustedEditingIndex}
          editingGroup={editingGroup}
          onInputChange={handleInputChange}
          onEditInputChange={handleEditInputChange}
          onAddGroup={addGroup}
          onStartEdit={startEdit}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onDeleteGroup={deleteGroup}
        />

        {/* Botones finales */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || groups.length === 0}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Procesando...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Guardar ({groups.length})
              </>
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UploadGroups;
