import React, { useEffect, useState } from "react";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import { useNavigate } from "react-router-dom";
import GroupGrid from "../../components/ui/GroupGrid";
import GroupFilters from "../../components/ui/GroupFilters";
import useGroupFilters from "../../hooks/useGroupFilters";
import {
  obtenerGrupos,
  obtenerClaveYCodigoQR,
} from "../../services/groupServices";
import GroupAccessModal from "../../components/ui/GroupAccessModal";

const AllGroups = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Estado del modal
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  // Hook de filtros
  const {
    searchTerm,
    filters,
    filteredGroups,
    handleSearch,
    handleApplyFilters,
    clearAllFilters,
    hasActiveFilters,
  } = useGroupFilters(groups);

  // Cargar lista de grupos
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

  // Manejar clic en el ícono de llave
  const handleOpenQRCode = async (group) => {
    try {
      const response = await obtenerClaveYCodigoQR(
        group.codigo_materia,
        group.nombre_grupo,
        group.periodo,
        group.anio
      );

      // Generamos la URL de destino del QR (por ejemplo, una ruta para unirse al grupo)
      //probar con app desplegada https://sishub-fe.vercel.app/
      //porbar con local http://localhost:5173/
      const joinUrl = `https://sishub-fe.vercel.app/join-group?codigo_materia=${
        group.codigo_materia
      }&nombre=${group.nombre_grupo}&periodo=${group.periodo}&anio=${
        group.anio
      }&clave=${response?.clave_acceso || group.clave_acceso}`;

      setQrData({
        clave_acceso: response?.clave_acceso,
        qr_url: joinUrl,
      });

      setSelectedGroup(group);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error al obtener QR:", error);
      alert("No se pudo obtener la clave de acceso.");
    }
  };

  return (
    <AdminLayout title="Grupos">
      <div className="flex flex-col gap-4">
        {/* Filtros */}
        <GroupFilters
          onSearch={handleSearch}
          onApplyFilters={handleApplyFilters}
          onClearAll={clearAllFilters}
          searchTerm={searchTerm}
          filters={filters}
        />

        {/* Indicador de resultados */}
        {hasActiveFilters && (
          <div className="text-sm text-gray-600">
            Mostrando {filteredGroups.length} de {groups.length} grupos
          </div>
        )}

        {/* Estados */}
        {isLoading && (
          <div className="text-center text-gray-500 py-16">Cargando...</div>
        )}
        {error && !isLoading && (
          <div className="text-center text-red-600 py-6">{error}</div>
        )}

        {/* Grilla */}
        {!isLoading && !error && (
          <GroupGrid
            groups={filteredGroups}
            onQRCode={handleOpenQRCode}
            role="admin"
          />
        )}
      </div>

      {/* Modal de clave y QR */}
      <GroupAccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        group={selectedGroup}
        qrData={qrData}
      />
    </AdminLayout>
  );
};

export default AllGroups;
