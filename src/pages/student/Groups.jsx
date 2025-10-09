import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AdminLayout from "../../modules/student/layouts/StudentLayout";
import RowItem from "../../components/ui/RowItem";
import FieldText from "../../components/ui/FieldText";
import JoinGroupForm from "../../modules/student/components/JoinGroupForm";
import { listarGruposHabilitadosPorMateria } from "../../services/groupServices";
import { joinGroupByAccessKey } from "../../services/groupUserServices";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Groups = () => {
  const location = useLocation();
  const materiaState = location?.state?.materia || null;
  const [selectedMateria, setSelectedMateria] = useState(
    materiaState?.label || ""
  );
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [accessKey, setAccessKey] = useState("");
  const toast = useToast();
  const [joining, setJoining] = useState(false);
  const { userData } = useAuth();
  const navigate = useNavigate();

  const handleJoinGroup = async () => {
    if (!selectedGroupId) {
      toast.error("Selecciona un grupo primero");
      return;
    }
    if (!accessKey) {
      toast.error("Ingresa la clave de acceso");
      return;
    }
    if (!userData?.id_usuario) {
      toast.error("No se encontró el usuario autenticado");
      return;
    }

    try {
      setJoining(true);
      await joinGroupByAccessKey({
        id_usuario: userData.id_usuario,
        id_grupo: selectedGroupId,
        clave_acceso: accessKey,
      });
      toast.success("Te uniste al grupo correctamente");
      setAccessKey("");
    } catch (err) {
      console.error("Error unirse a grupo:", err);

      const mensaje = err?.response?.data?.message || err.message;

      if (mensaje.includes("ya pertenece")) {
        toast.warning("Ya estás inscrito en este grupo");
      } else if (mensaje.includes("clave")) {
        toast.error("Clave de acceso incorrecta");
      } else {
        toast.error("No se pudo unir al grupo. Intenta nuevamente");
      }
    } finally {
      setJoining(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };
  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      if (materiaState?.value) {
        const data = await listarGruposHabilitadosPorMateria(
          materiaState.value
        );
        const ordenados = [...data].sort((a, b) =>
          (a?.nombre || "").localeCompare(b?.nombre || "", undefined, {
            sensitivity: "base",
          })
        );
        setGroups(ordenados);
      } else {
        setGroups([]);
      }
    } catch (err) {
      console.error("Error al cargar grupos habilitados:", err);
      setError("Error al cargar grupos habilitados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedMateria(materiaState?.label || "");
    fetchGroups();
  }, []);

  const handleStatusChange = (index, newStatus) => {
    console.log(`Grupo ${index + 1} cambió a: ${newStatus}`);
  };

  if (loading) {
    return (
      <AdminLayout title="Grupos">
        <div className="text-center text-gray-500 py-16">Cargando...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Grupos">
        <div className="text-center text-red-600 py-6">{error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Grupos">
      <div className="flex flex-col h-full">
        {/* Materia seleccionada */}
        <div className="mb-4 border-b border-gray-300 pb-4">
          <div className="flex items-center gap-4">
            <label
              htmlFor="materia"
              className="block text-base font-semibold text-gray-800"
            >
              Materia:
            </label>
            <FieldText
              type="text"
              id="materia"
              name="materia"
              value={selectedMateria}
              disabled={true}
              className="text-lg font-semibold w-1/3"
            />
          </div>
        </div>

        <h2 className="text-base font-semibold text-gray-800 mb-4 mt-2">
          Grupos Existentes
        </h2>

        <div className="flex-1 overflow-y-auto space-y-2 mb-6 max-h-[210px]">
          {groups.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              {materiaState
                ? `No hay grupos habilitados para "${materiaState.label}"`
                : "Selecciona una materia para ver los grupos"}
            </div>
          ) : (
            groups.map((group) => (
              <RowItem
                key={group.id_grupo}
                columns={[group.nombre, `Docente: ${group.docente}`]}
                status={group.estado}
                editable={false}
                showStatus={false}
                onClick={() => navigate(`/student/groups/${group.id_grupo}`)}
              />
            ))
          )}
        </div>

        {/* Sección de unirme a un grupo */}
        <JoinGroupForm
          onJoin={handleJoinGroup}
          onCancel={handleCancel}
          selectedGroupName={selectedGroupName}
          onAccessKeyChange={setAccessKey}
          loading={joining}
        />
      </div>
    </AdminLayout>
  );
};

export default Groups;
