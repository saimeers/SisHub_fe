import React, { useEffect, useRef, useState } from "react";
import ProfessorLayout from "../../modules/professor/layouts/ProfessorLayout";
import { useNavigate } from "react-router-dom";
import GroupGrid from "../../modules/professor/components/GroupGrid";
import GroupFilters from "../../components/ui/GroupFilters";
import useGroupFilters from "../../hooks/useGroupFilters";
import {
  listarGruposPorUsuario,
  obtenerClaveYCodigoQR,
  actualizarEstado,
} from "../../services/groupServices";
import { useAuth } from "../../contexts/AuthContext";
import GroupAccessModal from "../../components/ui/GroupAccessModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useToast } from "../../hooks/useToast";

const MyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEstadoConfirm, setShowEstadoConfirm] = useState(false);
  const confirmResolveRef = useRef(null);
  const [isProcessingConfirm, setIsProcessingConfirm] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "Confirmar",
    message: "¿Estás seguro?",
    confirmText: "Confirmar",
  });

  const navigate = useNavigate();
  const { userData } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const {
    searchTerm,
    filters,
    filteredGroups,
    handleSearch,
    handleApplyFilters,
    clearAllFilters,
    hasActiveFilters,
  } = useGroupFilters(groups);

  // Cargar los grupos del profesor
  useEffect(() => {
    const loadGroups = async () => {
      if (!userData?.codigo) return;

      setIsLoading(true);
      setError("");
      try {
        const list = await listarGruposPorUsuario(userData.codigo);
        console.log("Grupos del profesor:", list);
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

  // Manejar apertura del QR
  const handleOpenQRCode = async (group) => {
    try {
      const response = await obtenerClaveYCodigoQR(
        group.codigo_materia,
        group.nombre_grupo,
        group.periodo_grupo,
        group.anio_grupo
      );

      const joinUrl = `http://localhost:5173/join-group?codigo_materia=${encodeURIComponent(
        group.codigo_materia
      )}&nombre=${encodeURIComponent(
        group.nombre_grupo
      )}&periodo=${encodeURIComponent(
        group.periodo_grupo
      )}&anio=${encodeURIComponent(
        group.anio_grupo
      )}&clave=${encodeURIComponent(response?.clave_acceso)}`;

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

  // Solicitar confirmación (habilitar o deshabilitar) desde las cards
  const requestConfirmEstado = ({ title, message, confirmText }) => {
    return new Promise((resolve) => {
      confirmResolveRef.current = resolve;
      setConfirmConfig({ title, message, confirmText });
      setShowEstadoConfirm(true);
    });
  };

  const handleConfirmEstado = () => {
    setIsProcessingConfirm(true);
    setShowEstadoConfirm(false);
    setIsProcessingConfirm(false);
    if (confirmResolveRef.current) {
      confirmResolveRef.current(true);
      confirmResolveRef.current = null;
    }
  };

  const handleCancelEstado = () => {
    setShowEstadoConfirm(false);
    if (confirmResolveRef.current) {
      confirmResolveRef.current(false);
      confirmResolveRef.current = null;
    }
  };

  const handleEstadoActualizado = async (groupData, nuevoEstado) => {
    try {
      // groupData puede ser un objeto con los identificadores del grupo o un id_grupo (para compatibilidad)
      let codigo_materia, nombre, periodo, anio;

      if (typeof groupData === "object") {
        codigo_materia = groupData.codigo_materia;
        nombre = groupData.nombre_grupo;
        periodo = groupData.periodo_grupo;
        anio = groupData.anio_grupo;
      } else {
        // Fallback para compatibilidad con código anterior
        const group = groups.find((g) => g.id_grupo === groupData);
        if (!group) throw new Error("Grupo no encontrado");
        codigo_materia = group.codigo_materia;
        nombre = group.nombre_grupo;
        periodo = group.periodo_grupo;
        anio = group.anio_grupo;
      }

      await actualizarEstado(
        codigo_materia,
        nombre,
        periodo,
        anio,
        nuevoEstado
      );

      setGroups((prev) =>
        prev.map((g) =>
          g.codigo_materia === codigo_materia &&
          g.nombre_grupo === nombre &&
          g.periodo_grupo === periodo &&
          g.anio_grupo === anio
            ? {
                ...g,
                estado: nuevoEstado === 1 ? "Habilitado" : "Deshabilitado",
              }
            : g
        )
      );

      const nombreGrupo = nombre || "grupo";
      const estadoTexto = nuevoEstado === 1 ? "habilitado" : "deshabilitado";
      toastSuccess(`Grupo ${nombreGrupo} ${estadoTexto} correctamente`);
    } catch (error) {
      alert("❌ No se pudo actualizar el estado del grupo");
      toastError("No se pudo actualizar el estado del grupo");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
    setQrData(null);
  };

  if (!userData) {
    return (
      <ProfessorLayout title="Mis Grupos">
        <div className="text-center text-gray-500 py-16">
          Cargando información del usuario...
        </div>
      </ProfessorLayout>
    );
  }

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
          <div className="text-center text-gray-500 py-16">
            <div className="inline-flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-6 w-6 text-gray-500"
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

        {/* Sin grupos */}
        {!isLoading && !error && groups.length === 0 && (
          <div className="text-center text-gray-500 py-16">
            No tienes grupos asignados aún
          </div>
        )}

        {/* Mostrar grupos */}
        {!isLoading && !error && groups.length > 0 && (
          <GroupGrid
            groups={filteredGroups}
            onQRCode={handleOpenQRCode}
            role="professor"
            onEstadoActualizado={handleEstadoActualizado} // 👈 se pasa para actualizar estado
            requestConfirmEstado={requestConfirmEstado}
          />
        )}
      </div>

      {/* Modal QR */}
      <GroupAccessModal
        isOpen={isModalOpen}
        onClose={closeModal}
        group={selectedGroup}
        qrData={qrData}
      />
      <ConfirmModal
        isOpen={showEstadoConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText="Cancelar"
        onConfirm={handleConfirmEstado}
        onCancel={handleCancelEstado}
        loading={isProcessingConfirm}
      />
    </ProfessorLayout>
  );
};

export default MyGroups;
