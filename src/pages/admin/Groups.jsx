import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import Button from "../../components/ui/Button";
import RowItem from "../../components/ui/RowItem";
import { obtenerGrupos, actualizarEstado, listarGruposPorMateria } from "../../services/groupServices";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useToast } from "../../hooks/useToast";

const Groups = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [materiaInput, setMateriaInput] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [error, setError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState(null); 
  const [confirmLoading, setConfirmLoading] = useState(false);
  const toast = useToast();

  const handleCreateGroup = () => {
    if (!selectedMateria) return;
    navigate("/admin/create-group", { state: { materia: selectedMateria } });
  };

  const fetchMaterias = async () => {
    try {
      const materiaFromState = location?.state?.materia;
      if (materiaFromState) {
        setSelectedMateria(materiaFromState);
        setMateriaInput(materiaFromState.label || "");
      }
    } catch (error) {
      console.error("Error al inicializar materias:", error);
      setError("Error al cargar materias");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingGroups(true);
      }
      setError(null);
      
      if (selectedMateria) {
        const gruposData = await listarGruposPorMateria(selectedMateria.value);
        const ordenados = [...gruposData].sort((a, b) => (a?.nombre || "").localeCompare(b?.nombre || "", undefined, { sensitivity: "base" }));
        setGroups(ordenados);
      } else {
        setGroups([]);
      }
    } catch (err) {
      setError("Error al cargar los grupos");
      console.error("Error fetching groups:", err);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setLoadingGroups(false);
      }
    }
  };

  const handleStatusChange = (groupId, newStatus) => {
    const groupName = groups.find(g => g.id_grupo === groupId)?.nombre || "este grupo";
    setPendingChange({ groupId, newStatus, groupName });
    setConfirmOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingChange) return;
    try {
      setConfirmLoading(true);
      const nuevoEstadoBool = pendingChange.newStatus === "Habilitado";
      await actualizarEstado(pendingChange.groupId, nuevoEstadoBool);
      toast.success(`Grupo "${pendingChange.groupName}" ${pendingChange.newStatus.toLowerCase()} correctamente`);
    } catch (err) {
      console.error("Error al cambiar estado del grupo:", err);
      setError("Error al cambiar el estado del grupo");
      toast.error(`No se pudo cambiar el estado del grupo "${pendingChange.groupName}"`);
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setPendingChange(null);
      await fetchGroups(false); // refrescar 
    }
  };

  const cancelStatusChange = async () => {
    setConfirmOpen(false);
    setPendingChange(null);
    await fetchGroups(false);
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  useEffect(() => {
    fetchGroups(false);
  }, [selectedMateria]);

  if (loading) {
    return (
      <AdminLayout title="Grupos">
        <div className="text-center py-16">
          <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando...
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Grupos">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchGroups} text="Reintentar" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Grupos">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <label className="text-bm font-medium text-gray-700 whitespace-nowrap">
            Materia
          </label>
          <input
            type="text"
            className="w-96 sm:w-120 md:w-120 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-gray-50"
            placeholder="Materia seleccionada"
            value={materiaInput}
            readOnly
            aria-readonly="true"
          />
        </div>
        <Button onClick={handleCreateGroup} text="+ Crear Grupo" />
      </div>
      <hr className="border-gray-300 mb-4" />

      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Grupos Existentes
      </h2>

      {loadingGroups ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando grupos...
          </div>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {selectedMateria 
              ? `No hay grupos para la materia "${selectedMateria.label}"` 
              : "Selecciona una materia para ver los grupos"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {groups.map((group) => (
            <RowItem
              key={group.id_grupo}
              columns={[
                group.nombre,
                `${group.participantes} participantes`,
                `Docente: ${group.docente}`,
                group.clave_acceso,
              ]}
              status={group.estado}
              onStatusChange={(newStatus) => handleStatusChange(group.id_grupo, newStatus)}
              editable={true}
            />
          ))}
        </div>
      )}
      <ConfirmModal
        isOpen={confirmOpen}
        title="Confirmar cambio de estado"
        message={pendingChange ? `¿Seguro que deseas ${pendingChange.newStatus.toLowerCase()} el grupo "${pendingChange.groupName}"?` : ""}
        confirmText={pendingChange?.newStatus === "Habilitado" ? "Habilitar" : "Deshabilitar"}
        cancelText="Cancelar"
        onConfirm={confirmStatusChange}
        onCancel={cancelStatusChange}
        loading={confirmLoading}
      />
    </AdminLayout>
  );
};

export default Groups;
