import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GroupParticipants from "./GroupParticipants";
import SearchBar from "./SearchBar";
import { toast } from "react-toastify";
import StudentFiltersModal from "./StudentFiltersModal";
import * as XLSX from "xlsx";

const StudentList = ({ basePath, fetchStudents, showExportButton = false }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    role: "",
    tecnologia: "",
    lineaInvestigacion: "",
  });
  const [availableTechnologies, setAvailableTechnologies] = useState([]);
  const [availableLines, setAvailableLines] = useState([]);
  const navigate = useNavigate();

  // Función para exportar estudiantes a Excel
  const handleExportExcel = () => {
    try {
      // Preparar datos para Excel
      const excelData = filteredStudents.map((student) => ({
        Código: student.codigo || "N/A",
        Nombre: student.nombre || "Sin nombre",
        Correo: student.correo || "",
        Teléfono: student.telefono || "",
        Tecnologías: (student.tecnologias || []).join(", "),
        "Líneas de Investigación": (student.lineasInvestigacion || []).join(
          ", "
        ),
      }));

      // Crear libro de trabajo
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Estudiantes");

      // Ajustar ancho de columnas
      const columnWidths = [
        { wch: 12 }, // Código
        { wch: 30 }, // Nombre
        { wch: 45 }, // Correo
        { wch: 15 }, // Teléfono
        { wch: 50 }, // Tecnologías
        { wch: 40 }, // Líneas de Investigación
      ];
      worksheet["!cols"] = columnWidths;

      const fecha = new Date().toISOString().split("T")[0];
      const fileName = `estudiantes_${fecha}.xlsx`;

      XLSX.writeFile(workbook, fileName);

      toast.success(`Se exportaron ${filteredStudents.length} estudiantes`);
    } catch (error) {
      toast.error("Error al exportar la lista de estudiantes");
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadStudents = async () => {
      if (!fetchStudents) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const resp = await fetchStudents();
        let list = [];
        if (Array.isArray(resp)) list = resp;
        else if (Array.isArray(resp?.data)) list = resp.data;
        else if (Array.isArray(resp?.estudiantes)) list = resp.estudiantes;
        else if (Array.isArray(resp?.usuarios)) list = resp.usuarios;

        if (mounted) {
          const formattedList = list
            .map((s) => {
              if (!s) return null;
              return {
                ...s,
                codigo: s.codigo || "N/A",
                nombre: s.nombre || "Sin nombre",
                foto: s.fotoPerfil || null,
              };
            })
            .filter(Boolean);
          setStudents(formattedList);
          setFilteredStudents(formattedList);
          // Extract unique technologies and research lines for filter options
          const techSet = new Set();
          const lineSet = new Set();
          formattedList.forEach((s) => {
            (s.tecnologias || []).forEach((t) => techSet.add(t));
            (s.lineasInvestigacion || []).forEach((l) => lineSet.add(l));
          });
          setAvailableTechnologies(Array.from(techSet));
          setAvailableLines(Array.from(lineSet));
        }
      } catch (err) {
        toast.error("No se pudieron cargar los estudiantes");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadStudents();
  }, [fetchStudents]);
  useEffect(() => {
    let result = students;
    if (searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          (s.nombre && s.nombre.toLowerCase().includes(lowerTerm)) ||
          (s.codigo && s.codigo.toString().toLowerCase().includes(lowerTerm))
      );
    }
    if (filterCriteria.role) {
      const isLider = filterCriteria.role === "lider";
      result = result.filter((s) => Boolean(s.roles?.esLider) === isLider);
    }
    if (filterCriteria.tecnologia) {
      result = result.filter((s) =>
        (s.tecnologias || []).includes(filterCriteria.tecnologia)
      );
    }
    if (filterCriteria.lineaInvestigacion) {
      result = result.filter((s) =>
        (s.lineasInvestigacion || []).includes(
          filterCriteria.lineaInvestigacion
        )
      );
    }

    setFilteredStudents(result);
  }, [searchTerm, students, filterCriteria]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterCriteria({ role: "", tecnologia: "", lineaInvestigacion: "" });
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleStudentClick = (student) => {
    navigate(`${basePath}/${student.codigo}`);
  };

  const handleOpenFilters = () => {
    setIsFiltersOpen(true);
  };

  const handleApplyFilters = (filters) => {
    setFilterCriteria(filters);
    setIsFiltersOpen(false);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    filterCriteria.role !== "" ||
    filterCriteria.tecnologia !== "" ||
    filterCriteria.lineaInvestigacion !== "";

  return (
    <div className="w-full max-w-5xl mx-auto mt-10 py-6 px-6 bg-white rounded-2xl shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Controles de filtros y búsqueda */}
        <div className="flex flex-wrap gap-3 items-center mb-4">
          {/* Botón "Todos" / "Limpiar filtros" */}
          <button
            onClick={handleClearFilters}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              hasActiveFilters
                ? "border-green-300 text-green-600 hover:bg-green-50"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {hasActiveFilters ? "Limpiar filtros" : "Todos"}
          </button>

          {/* Barra de búsqueda */}
          <SearchBar
            onSearch={handleSearch}
            placeholder="Buscar por nombre o código"
            initialValue={searchTerm}
          />

          {/* Botón de filtros */}
          <button
            onClick={handleOpenFilters}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors border-gray-300 text-gray-700 hover:bg-gray-100`}
          >
            Filtros
          </button>

          {/* Botón de exportar Excel - solo para admin */}
          {showExportButton && (
            <button
              onClick={handleExportExcel}
              className="bg-[#B70000] hover:bg-red-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
              title="Exportar lista de estudiantes a Excel"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Exportar estudiantes
            </button>
          )}
        </div>

        <div>
          <div className="mb-4 grid grid-cols-[1fr_3fr_auto] text-sm font-semibold text-gray-600 px-6">
            <span>Código</span>
            <span>Nombre</span>
            <span className="text-right">Foto</span>
          </div>

          <GroupParticipants
            participants={filteredStudents}
            isLoading={loading}
            onParticipantClick={handleStudentClick}
          />
        </div>
      </div>
      <StudentFiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApplyFilters={handleApplyFilters}
        technologies={availableTechnologies}
        researchLines={availableLines}
      />
    </div>
  );
};

export default StudentList;
