import React, { useEffect, useState } from "react";
import StudentLayout from "../../modules/student/layouts/StudentLayout";
import { useNavigate } from "react-router-dom";
import GroupGrid from "../../modules/admin/components/GroupGrid";
import GroupFilters from "../../components/ui/GroupFilters";
import useGroupFilters from "../../hooks/useGroupFilters";
import { listarGruposPorUsuario } from "../../services/groupServices";
import { useAuth } from "../../contexts/AuthContext";

const AllGroups = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { userData } = useAuth(); 

  const {
    searchTerm,
    filters,
    filteredGroups,
    handleSearch,
    handleApplyFilters,
    clearAllFilters,
    hasActiveFilters,
  } = useGroupFilters(groups);

  useEffect(() => {
    const loadGroups = async () => {
      if (!userData?.id_usuario) {
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const list = await listarGruposPorUsuario(userData.id_usuario);
        console.log("Grupos del estudiante:", list);
        setGroups(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Error al cargar grupos:", err);
        setError(err?.message || "Error al cargar grupos");
        setGroups([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadGroups();
  }, [userData]);

  if (!userData) {
    return (
      <StudentLayout title="Mis Grupos">
        <div className="text-center text-gray-500 py-16">
          Cargando información del usuario...
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Mis Grupos">
      <div className="flex flex-col gap-4">
        <GroupFilters
          onSearch={handleSearch}
          onApplyFilters={handleApplyFilters}
          onClearAll={clearAllFilters}
          searchTerm={searchTerm}
          filters={filters}
        />
        
        {hasActiveFilters && (
          <div className="text-sm text-gray-600">
            Mostrando {filteredGroups.length} de {groups.length} grupos
          </div>
        )}
        
        {isLoading && (
          <div className="text-center text-gray-500 py-16">
            <div className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando grupos...
            </div>
          </div>
        )}
        
        {error && !isLoading && (
          <div className="text-center py-6">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Reintentar
            </button>
          </div>
        )}
        
        {!isLoading && !error && groups.length === 0 && (
          <div className="text-center text-gray-500 py-16">
            <p className="mb-4">No estás inscrito en ningún grupo aún</p>
            <p className="text-sm">Únete a un grupo usando el código de acceso o escanea el código QR proporcionado por tu profesor</p>
          </div>
        )}
        
        {!isLoading && !error && groups.length > 0 && (
          <GroupGrid
            groups={filteredGroups}
            showQRButton={false}
          />
        )}
      </div>
    </StudentLayout>
  );
};

export default AllGroups;