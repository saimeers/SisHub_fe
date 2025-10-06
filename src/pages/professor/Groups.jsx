import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminLayout from "../../modules/professor/layouts/ProfessorLayout";
import Button from "../../components/ui/Button";
import RowItem from "../../components/ui/RowItem";
import { listarGruposPorMateria } from "../../services/groupServices";

const Groups = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const materiaState = location?.state?.materia || null;

  const [materiaInput, setMateriaInput] = useState(materiaState?.label || "");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateGroup = () => {
    navigate("/professor/create-group", { state: { materia: materiaState } });
  };

  const fetchGroups = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingGroups(true);
      }
      setError(null);

      if (materiaState?.value) {
        const gruposData = await listarGruposPorMateria(materiaState.value);
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

  useEffect(() => {
    setMateriaInput(materiaState?.label || "");
    fetchGroups(true);
  }, []);

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
          <Button onClick={() => fetchGroups(true)} text="Reintentar" />
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
            {materiaState 
              ? `No hay grupos para la materia "${materiaState.label}"` 
              : "Selecciona una materia para ver los grupos"}
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
              ]}
              status={group.estado}
              editable={false}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default Groups;
