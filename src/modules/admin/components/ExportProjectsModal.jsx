import React, { useState } from "react";
import { FiX, FiDownload, FiCalendar } from "react-icons/fi";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

const ExportProjectsModal = ({ isOpen, onClose, onExport }) => {
  const [formato, setFormato] = useState("excel"); // "excel" o "pdf"
  const [tipoFiltro, setTipoFiltro] = useState("todos"); // "todos", "fecha", "semestre"
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [semestre, setSemestre] = useState(""); // Formato: "2025-02"
  const [isExporting, setIsExporting] = useState(false);

  // Validar y parsear semestre
  const parseSemestre = (semestreStr) => {
    if (!semestreStr || !semestreStr.includes("-")) {
      return null;
    }
    const [anio, periodo] = semestreStr.split("-");
    if (!anio || !periodo || (periodo !== "1" && periodo !== "2")) {
      return null;
    }
    return { anio: parseInt(anio), periodo: parseInt(periodo) };
  };

  const handleExport = async () => {
    // Validaciones
    if (tipoFiltro === "fecha") {
      if (!fechaInicio || !fechaFin) {
        alert("Por favor, seleccione ambas fechas");
        return;
      }
      if (new Date(fechaInicio) > new Date(fechaFin)) {
        alert("La fecha de inicio debe ser anterior a la fecha de fin");
        return;
      }
    } else if (tipoFiltro === "semestre") {
      const semestreData = parseSemestre(semestre);
      if (!semestreData) {
        alert("Por favor, ingrese un semestre válido (formato: YYYY-P, ejemplo: 2025-02)");
        return;
      }
    }

    setIsExporting(true);
    try {
      let filtros = {};
      
      if (tipoFiltro === "fecha") {
        filtros = { fechaInicio, fechaFin };
      } else if (tipoFiltro === "semestre") {
        const semestreData = parseSemestre(semestre);
        filtros = { anio: semestreData.anio, periodo: semestreData.periodo };
      }

      await onExport(formato, tipoFiltro, filtros);
      onClose();
    } catch (error) {
      console.error("Error al exportar:", error);
      alert(error.message || "Error al exportar proyectos");
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    // Resetear formulario al cerrar
    setFormato("excel");
    setTipoFiltro("todos");
    setFechaInicio("");
    setFechaFin("");
    setSemestre("");
    setIsExporting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <FiDownload className="text-[#B70000]" />
            Exportar Proyectos
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
            disabled={isExporting}
          >
            <FiX />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto px-2">
          <div className="space-y-6">
            {/* Selector de formato */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Formato de exportación
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormato("excel")}
                  disabled={isExporting}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                    formato === "excel"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-gray-400 bg-white"
                  } ${isExporting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <FaFileExcel
                    className={`text-4xl mb-2 ${
                      formato === "excel" ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      formato === "excel" ? "text-green-700" : "text-gray-600"
                    }`}
                  >
                    Excel (.xlsx)
                  </span>
                </button>
                <button
                  onClick={() => setFormato("pdf")}
                  disabled={isExporting}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                    formato === "pdf"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400 bg-white"
                  } ${isExporting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <FaFilePdf
                    className={`text-4xl mb-2 ${
                      formato === "pdf" ? "text-red-600" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      formato === "pdf" ? "text-red-700" : "text-gray-600"
                    }`}
                  >
                    PDF (.pdf)
                  </span>
                </button>
              </div>
            </div>

            {/* Selector de filtro */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Filtro de exportación
              </label>
              <div className="space-y-3">
                {/* Opción: Todos */}
                <label className="flex items-center p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="tipoFiltro"
                    value="todos"
                    checked={tipoFiltro === "todos"}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                    disabled={isExporting}
                    className="mr-3 w-4 h-4 text-[#B70000] focus:ring-[#B70000]"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-700">Todos los proyectos</span>
                    <p className="text-sm text-gray-500">Exportar todos los proyectos registrados</p>
                  </div>
                </label>

                {/* Opción: Por fechas */}
                <label className="flex items-center p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="tipoFiltro"
                    value="fecha"
                    checked={tipoFiltro === "fecha"}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                    disabled={isExporting}
                    className="mr-3 w-4 h-4 text-[#B70000] focus:ring-[#B70000]"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <FiCalendar className="text-gray-500" />
                      Por rango de fechas
                    </span>
                    <p className="text-sm text-gray-500">Exportar proyectos por rango de fechas</p>
                  </div>
                </label>

                {/* Opción: Por semestre */}
                <label className="flex items-center p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="tipoFiltro"
                    value="semestre"
                    checked={tipoFiltro === "semestre"}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                    disabled={isExporting}
                    className="mr-3 w-4 h-4 text-[#B70000] focus:ring-[#B70000]"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <FiCalendar className="text-gray-500" />
                      Por semestre
                    </span>
                    <p className="text-sm text-gray-500">Exportar proyectos de un semestre específico</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Campos condicionales según el tipo de filtro */}
            {tipoFiltro === "fecha" && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Fecha de inicio
                    </label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      disabled={isExporting}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B70000] focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Fecha de fin
                    </label>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      disabled={isExporting}
                      min={fechaInicio}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B70000] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {tipoFiltro === "semestre" && (
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700">
                  Semestre (formato: YYYY-P)
                </label>
                <input
                  type="text"
                  value={semestre}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Permitir formato YYYY-P o YYYY-PP
                    if (value === "" || /^\d{4}-[12]$/.test(value)) {
                      setSemestre(value);
                    }
                  }}
                  disabled={isExporting}
                  placeholder="Ejemplo: 2025-02"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B70000] focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                  Ingrese el año y período (1 o 2). Ejemplo: 2025-02 para el segundo período de 2025
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleClose}
            disabled={isExporting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 px-4 py-2 bg-[#B70000] text-white rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                Exportando...
              </>
            ) : (
              <>
                <FiDownload />
                Exportar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportProjectsModal;

