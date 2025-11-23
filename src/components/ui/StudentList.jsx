import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GroupParticipants from "./GroupParticipants";
import SearchBar from "./SearchBar";
import { toast } from "react-toastify";

const StudentList = ({ basePath, fetchStudents }) => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;

        const loadStudents = async () => {
            console.log("🚀 StudentList: Starting loadStudents");
            if (!fetchStudents) {
                console.error("❌ StudentList: fetchStudents prop is missing");
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                console.log("📡 StudentList: Calling fetchStudents...");
                const resp = await fetchStudents();
                console.log("✅ StudentList: fetchStudents response:", resp);

                let list = [];
                if (Array.isArray(resp)) list = resp;
                else if (Array.isArray(resp?.data)) list = resp.data;
                else if (Array.isArray(resp?.estudiantes)) list = resp.estudiantes;
                else if (Array.isArray(resp?.usuarios)) list = resp.usuarios;

                console.log("📋 StudentList: Raw list extracted:", list);

                if (mounted) {
                    const formattedList = list.map((s) => {
                        if (!s) return null;
                        return {
                            ...s,
                            codigo: s.codigo || "N/A",
                            nombre: s.nombre || "Sin nombre",
                            foto:
                                s.foto ||
                                s.foto_url ||
                                s.imagen ||
                                s.avatar ||
                                s.url_foto ||
                                null,
                        };
                    }).filter(Boolean);
                    console.log("✨ StudentList: Formatted list:", formattedList);
                    setStudents(formattedList);
                    setFilteredStudents(formattedList);
                }
            } catch (err) {
                console.error("❌ StudentList: Error loading students:", err);
                toast.error("No se pudieron cargar los estudiantes");
            } finally {
                if (mounted) {
                    console.log("🏁 StudentList: Finished loading");
                    setLoading(false);
                }
            }
        };

        loadStudents();

        return () => {
            mounted = false;
        };
    }, [fetchStudents]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredStudents(students);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            const filtered = students.filter(
                (s) =>
                    (s.nombre && s.nombre.toLowerCase().includes(lowerTerm)) ||
                    (s.codigo && s.codigo.toString().toLowerCase().includes(lowerTerm))
            );
            setFilteredStudents(filtered);
        }
    }, [searchTerm, students]);

    const handleStudentClick = (student) => {
        navigate(`${basePath}/${student.codigo}`);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleClearFilters = () => {
        setSearchTerm("");
    };

    console.log("StudentList render - students:", students);
    console.log("StudentList render - filteredStudents:", filteredStudents);

    return (
        <div className="w-full max-w-5xl mx-auto mt-10 py-6 px-6 bg-white rounded-2xl shadow-sm">
            <div className="flex flex-col gap-4">
                {/* Controles de filtros y búsqueda */}
                <div className="flex flex-wrap gap-3 items-center mb-4">
                    {/* Botón "Todos" / "Limpiar filtros" */}
                    <button
                        onClick={handleClearFilters}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${searchTerm
                            ? "border-green-300 text-green-600 hover:bg-green-50"
                            : "border-gray-300 text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        {searchTerm ? "Limpiar filtros" : "Todos"}
                    </button>

                    {/* Barra de búsqueda */}
                    <SearchBar
                        onSearch={handleSearch}
                        placeholder="Buscar por nombre o código"
                        initialValue={searchTerm}
                    />

                    {/* Botón de filtros */}
                    <button
                        onClick={() => { }}
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
        </div>
    );
};

export default StudentList;
