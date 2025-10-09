import React, { useEffect, useState } from "react";
import ProfessorLayout from "../../modules/professor/layouts/ProfessorLayout";
import { useNavigate } from "react-router-dom";
import GroupGrid from "../../modules/admin/components/GroupGrid";
import GroupFilters from "../../components/ui/GroupFilters";
import useGroupFilters from "../../hooks/useGroupFilters";
import { listarGruposPorUsuario } from "../../services/groupServices";
import { useAuth } from "../../modules/auth/hooks/useAuth";

const AllGroups = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

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
      setIsLoading(true);
      setError("");
      try {
        if (user?.id) {
          const list = await listarGruposPorUsuario(user.id);
           console.log("Grupos recibidos del backend:", list);
          setGroups(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        setError(err?.message || "Error al cargar grupos");
      } finally {
        setIsLoading(false);
      }
    };
    loadGroups();
  }, [user]);

  const handleQRCode = (group) => {
    alert(`Generar QR para el grupo: ${group.nombre || group.nombre_grupo}`);
  };

  return (
    <ProfessorLayout title="Mis Grupos">
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
          <div className="text-center text-gray-500 py-16">Cargando...</div>
        )}
        {error && !isLoading && (
          <div className="text-center text-red-600 py-6">{error}</div>
        )}
        {!isLoading && !error && (
          <GroupGrid
            groups={filteredGroups}
            onQRCode={handleQRCode}
          />
        )}
      </div>
    </ProfessorLayout>
  );
};

export default AllGroups;