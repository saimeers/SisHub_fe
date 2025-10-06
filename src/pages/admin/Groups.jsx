import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import Button from "../../components/ui/Button";
import RowItem from "../../components/ui/RowItem";
import SelectField from "../../components/ui/SelectField";
import LoadingScreen from "../../components/ui/LoadingScreen";
import { fetchSubjects } from "../../services/materiaServices";
import { obtenerGrupos, deshabilitarGrupo, listarGruposPorMateria } from "../../services/groupServices";

const Groups = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateGroup = () => {
    if (!selectedMateria) return;
    navigate("/admin/create-group", { state: { materia: selectedMateria } });
  };

  const fetchMaterias = async () => {
    try {
      const materiasData = await fetchSubjects();
      const materiasOptions = materiasData.map((materia) => ({
        value: materia.id_materia,
        label: materia.nombre,
      }));
      setMaterias(materiasOptions);
      // preseleccionar si viene desde navegación
      const materiaFromState = location?.state?.materia;
      if (materiaFromState) {
        setSelectedMateria(materiaFromState);
      }
    } catch (error) {
      console.error("Error al cargar materias:", error);
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

  const handleMateriaChange = (selectedOption) => {
    setSelectedMateria(selectedOption);
  };

  const handleStatusChange = async (groupId, newStatus) => {
    try {
      if (newStatus === "Deshabilitado") {
        await deshabilitarGrupo(groupId);
        // Recargar la lista de grupos
        await fetchGroups(false);
      }
    } catch (err) {
      console.error("Error al cambiar estado del grupo:", err);
      setError("Error al cambiar el estado del grupo");
    }
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
        {/* Filtro por Materia */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <label className="text-bm font-medium text-gray-700 whitespace-nowrap">
            Materia
          </label>
          <div className="w-80 sm:w-96 md:w-120">
            <SelectField
              value={selectedMateria}
              onChange={handleMateriaChange}
              options={materias}
              placeholder="Seleccionar materia..."
              isClearable={true}
            />
          </div>
        </div>
        <Button onClick={handleCreateGroup} text="+ Crear Grupo" disabled={!selectedMateria} />
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
        <div className="space-y-2">
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
    </AdminLayout>
  );
};

export default Groups;
