import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GroupParticipants from "./GroupParticipants";
import SearchBar from "./SearchBar";
import { toast } from "react-toastify";
import StudentFiltersModal from "./StudentFiltersModal";



const StudentList = ({ basePath, fetchStudents }) => {
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
                    const formattedList = list.map((s) => {
                        if (!s) return null;
                        return {
                            ...s,
                            codigo: s.codigo || "N/A",
                            nombre: s.nombre || "Sin nombre",
                            foto:
                                s.fotoPerfil ||
                                null,
                        };
                    }).filter(Boolean);
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
            result = result.filter((s) => (s.tecnologias || []).includes(filterCriteria.tecnologia));
        }
        if (filterCriteria.lineaInvestigacion) {
            result = result.filter((s) => (s.lineasInvestigacion || []).includes(filterCriteria.lineaInvestigacion));
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
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${hasActiveFilters
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
