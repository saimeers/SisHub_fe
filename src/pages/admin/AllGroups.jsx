import React, { useEffect, useState } from "react";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import { useNavigate } from "react-router-dom";
import GroupGrid from "../../modules/admin/components/GroupGrid";
import GroupFilters from "../../components/ui/GroupFilters";
import useGroupFilters from "../../hooks/useGroupFilters";
import { obtenerGrupos } from "../../services/groupServices";

const AllGroups = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  // Hook para manejar filtros y búsqueda
  const {
    searchTerm,
    filters,
    filteredGroups,
    handleSearch,
    handleApplyFilters,
    clearAllFilters,
    hasActiveFilters,
  } = useGroupFilters(groups);

  const loadGroups = async () => {
    setIsLoading(true);
    setError("");
    try {
      const list = await obtenerGrupos();
      setGroups(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "Error al cargar grupos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCreateGroup = () => {
    navigate("/admin/groups/create");
  };

  const handleQRCode = (group) => {
    // Por ahora solo mostramos un alert, después implementaremos el modal QR
    alert(`Generar QR para el grupo: ${group.nombre || group.nombre_grupo}`);
  };

  return (
    <AdminLayout title="Mis Grupos">
      <div className="flex flex-col gap-4">
        {/* Componente de filtros */}
        <GroupFilters
          onSearch={handleSearch}
          onApplyFilters={handleApplyFilters}
          onClearAll={clearAllFilters}
          searchTerm={searchTerm}
          filters={filters}
          showCreateButton={true}
          onCreateClick={handleCreateGroup}
          createButtonText="+ Crear Grupo"
        />

        {/* Indicador de resultados */}
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
    </AdminLayout>
  );
};

export default AllGroups;
