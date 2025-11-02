// GroupDetail.jsx - Vista del Profesor con Gestión de Actividades

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfessorLayout from "../../modules/professor/layouts/ProfessorLayout";
import GroupParticipants from "../../components/ui/GroupParticipants";
import AccessDenied from "../../components/ui/AccessDenied";
import { listarParticipantesGrupo } from "../../services/groupUserServices";
import { listarGruposPorUsuario } from "../../services/groupServices";
import { 
  verificarActividadGrupo, 
  obtenerActividadById,
  crearActividad,
  editarActividad 
} from "../../services/actividadService";
import { 
  listarEsquemasPorTipo, 
  listarItemsPorEsquema 
} from "../../services/esquemaService";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const GroupDetail = () => {
  const { codigo_materia, nombre, periodo, anio } = useParams();
  const navigate = useNavigate();
  const { error } = useToast();
  const { userData } = useAuth();
  
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("participantes");
  const [groupInfo, setGroupInfo] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const hasLoaded = useRef(false);

  // Estados para proyecto/actividad
  const [currentView, setCurrentView] = useState("checkActivity");
  const [tieneActividad, setTieneActividad] = useState(null);
  const [actividad, setActividad] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const groupParams = { codigo_materia, nombre, periodo, anio };

  // Cargar datos del grupo
  useEffect(() => {
    const loadGroupData = async () => {
      if (hasLoaded.current) return;
      hasLoaded.current = true;

      if (!codigo_materia || !nombre || !periodo || !anio || !userData?.codigo) {
        return;
      }

      setIsLoading(true);
      setValidationError(null);

      try {
        const professorGroups = await listarGruposPorUsuario(userData.codigo);

        const isAssignedToGroup = professorGroups.some(
          (group) =>
            String(group.codigo_materia) === String(codigo_materia) &&
            String(group.nombre_grupo) === String(nombre) &&
            String(group.periodo_grupo) === String(periodo) &&
            String(group.anio_grupo) === String(anio)
        );

        if (!isAssignedToGroup) {
          setValidationError(
            "No estás asignado a este grupo o la materia no existe en el catálogo."
          );
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        const participantsData = await listarParticipantesGrupo(
          codigo_materia,
          nombre,
          periodo,
          anio
        );

        setParticipants(Array.isArray(participantsData) ? participantsData : []);
        setGroupInfo({
          nombre: codigo_materia,
          grupo: nombre,
          periodo: `${periodo}-${anio}`,
        });
        setIsAuthorized(true);
      } catch (err) {
        console.error("Error al cargar datos del grupo:", err);
        if (err.response?.status === 404) {
          setValidationError(
            "Esta materia no existe en el catálogo o no estás asignado a este grupo."
          );
        } else {
          setValidationError(
            "Error al cargar los datos del grupo. Por favor, intenta nuevamente."
          );
        }
        setIsAuthorized(false);
        error("No se pudieron cargar los datos del grupo");
      } finally {
        setIsLoading(false);
      }
    };

    loadGroupData();
  }, [codigo_materia, nombre, periodo, anio, userData, error]);

  // Verificar actividad cuando se selecciona la pestaña proyecto
  useEffect(() => {
    if (activeTab === "proyecto" && isAuthorized) {
      checkActivity();
    }
  }, [activeTab, isAuthorized]);

  const checkActivity = async () => {
    setLoadingActivity(true);
    try {
      const tiene = await verificarActividadGrupo(codigo_materia, nombre, periodo, anio);
      setTieneActividad(tiene);

      if (tiene) {
        // Obtener los datos de la actividad existente
        const actividadData = await obtenerActividadById(1); // Ajustar según cómo obtengas el ID
        setActividad(actividadData);
        setCurrentView("activityDetail");
      } else {
        setCurrentView("createActivity");
      }
    } catch (err) {
      console.error("Error al verificar actividad:", err);
      toast.error("Error al verificar la actividad del grupo");
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleActivityCreated = (newActivity) => {
    setActividad(newActivity);
    setTieneActividad(true);
    setCurrentView("activityDetail");
    toast.success("Actividad creada exitosamente");
  };

  const handleEditActivity = () => {
    setCurrentView("editActivity");
  };

  const handleActivityUpdated = (updatedActivity) => {
    setActividad(updatedActivity);
    setCurrentView("activityDetail");
    toast.success("Actividad actualizada exitosamente");
  };

  const tabs = [
    { id: "proyecto", label: "Proyecto" },
    { id: "equipo", label: "Equipo" },
    { id: "participantes", label: "Participantes" },
  ];

  if (validationError && !isAuthorized && !isLoading) {
    return (
      <ProfessorLayout title="Acceso Denegado">
        <AccessDenied
          message={validationError}
          primaryButtonText="Volver a Mis Grupos"
          primaryButtonPath="/professor/my-groups"
          secondaryButtonText="Ver Catálogo de Materias"
          secondaryButtonPath="/professor/subjects"
          showSecondaryButton={true}
          additionalInfo="Si crees que esto es un error, contacta al administrador."
        />
      </ProfessorLayout>
    );
  }

  return (
    <ProfessorLayout
      title={
        groupInfo
          ? `${groupInfo.nombre} | ${groupInfo.grupo} | ${groupInfo.periodo}`
          : "Cargando grupo..."
      }
    >
      <div className="w-full max-w-7xl mx-auto py-10 px-6 bg-white rounded-2xl shadow-sm">
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex justify-center space-x-2 bg-gray-100 p-1 rounded-full w-fit mx-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        {isAuthorized && (
          <div className="rounded-xl">
            {activeTab === "participantes" && (
              <div className="mt-8">
                <div className="mb-4 grid grid-cols-2 text-sm font-semibold text-gray-600 px-4">
                  <span>Código</span>
                  <span>Nombre</span>
                </div>
                <div className="flex flex-col gap-3">
                  {isLoading ? (
                    <p className="text-gray-500 text-center py-6">
                      Cargando participantes...
                    </p>
                  ) : participants.length > 0 ? (
                    <GroupParticipants participants={participants} />
                  ) : (
                    <p className="text-gray-500 text-center py-6">
                      No hay participantes registrados
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "proyecto" && (
              <div>
                {loadingActivity ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Verificando actividad...</p>
                  </div>
                ) : currentView === "createActivity" ? (
                  <ActivityForm
                    groupParams={groupParams}
                    onSubmit={handleActivityCreated}
                    onCancel={() => setCurrentView("checkActivity")}
                  />
                ) : currentView === "editActivity" ? (
                  <ActivityForm
                    groupParams={groupParams}
                    initialData={actividad}
                    isEditing={true}
                    onSubmit={handleActivityUpdated}
                    onCancel={() => setCurrentView("activityDetail")}
                  />
                ) : currentView === "activityDetail" && actividad ? (
                  <ActivityDetail
                    actividad={actividad}
                    onEdit={handleEditActivity}
                  />
                ) : null}
              </div>
            )}

            {activeTab === "equipo" && (
              <div className="text-center py-12 text-gray-500">
                <p>Información del equipo próximamente...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ProfessorLayout>
  );
};

// ===== COMPONENTE: Detalle de Actividad =====
const ActivityDetail = ({ actividad, onEdit }) => {
  return (
    <div className="rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] overflow-hidden bg-white">
      <div
        className="relative px-6 py-10 text-center text-white"
        style={{
          background: "linear-gradient(90deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)",
        }}
      >
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide">
          {actividad.titulo}
        </h2>
        <button
          onClick={onEdit}
          className="absolute right-6 top-6 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          title="Editar actividad"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
      <div className="px-8 py-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">DESCRIPCIÓN</h3>
          <p className="text-gray-700 leading-relaxed">{actividad.descripcion}</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">FECHA INICIO</h3>
            <p className="text-gray-900 font-medium">
              {new Date(actividad.fecha_inicio).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">FECHA CIERRE</h3>
            <p className="text-gray-900 font-medium">
              {new Date(actividad.fecha_cierre).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            MÁXIMO DE INTEGRANTES
          </h3>
          <p className="text-gray-900 font-medium">
            {actividad.maximo_integrantes} estudiantes
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">TIPO DE ALCANCE</h3>
          <p className="text-gray-900 font-medium">
            {actividad.id_tipo_alcance === 1 ? "Investigativo" : "Desarrollo"}
          </p>
        </div>
      </div>
    </div>
  );
};

// ===== COMPONENTE: Formulario de Actividad =====
const ActivityForm = ({
  groupParams,
  initialData = null,
  isEditing = false,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState({
    titulo: initialData?.titulo || "",
    descripcion: initialData?.descripcion || "",
    fecha_inicio: initialData?.fecha_inicio || "",
    fecha_cierre: initialData?.fecha_cierre || "",
    maximo_integrantes: initialData?.maximo_integrantes || 2,
    id_tipo_alcance: initialData?.id_tipo_alcance || "",
  });

  const [selectedEsquema, setSelectedEsquema] = useState(null);
  const [esquemas, setEsquemas] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loadingEsquemas, setLoadingEsquemas] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  const tiposAlcance = [
    { id: 1, nombre: "Investigativo" },
    { id: 2, nombre: "Desarrollo" },
  ];

  useEffect(() => {
    console.log("🎯 Estado de items cambió:", {
      itemsLength: items.length,
      items: items,
      selectedEsquema: selectedEsquema,
      loadingItems: loadingItems
    });
  }, [items]);

  useEffect(() => {
    if (form.id_tipo_alcance) {
      console.log("🚀 Tipo de alcance seleccionado:", form.id_tipo_alcance);
      loadEsquemas(form.id_tipo_alcance);
    }
  }, [form.id_tipo_alcance]);

  useEffect(() => {
    if (selectedEsquema) {
      console.log("🚀 Esquema seleccionado (useEffect):", selectedEsquema);
      console.log("🚀 Tipo de selectedEsquema:", typeof selectedEsquema);
      loadItems(selectedEsquema);
    } else {
      console.log("⚠️ selectedEsquema es falsy:", selectedEsquema);
    }
  }, [selectedEsquema]);

  const loadEsquemas = async (tipoId) => {
    console.log("🔍 Cargando esquemas para tipo:", tipoId);
    setLoadingEsquemas(true);
    setSelectedEsquema(null);
    setItems([]);
    setSelectedItems([]);
    try {
      const data = await listarEsquemasPorTipo(tipoId);
      console.log("📦 Esquemas recibidos:", data);
      console.log("📦 Esquemas RAW (stringified):", JSON.stringify(data, null, 2));
      
      const esquemasList = Array.isArray(data) ? data : [];
      console.log("✅ Esquemas procesados:", esquemasList);
      
      if (esquemasList.length > 0) {
        console.log("🔎 Primer esquema:", esquemasList[0]);
        console.log("🔎 Estructura:", {
          id_esquema: esquemasList[0].id_esquema,
          ubicacion: esquemasList[0].ubicacion,
          tipo: typeof esquemasList[0].id_esquema
        });
      }
      
      setEsquemas(esquemasList);
    } catch (error) {
      console.error("❌ Error al cargar esquemas:", error);
      toast.error("Error al cargar esquemas");
      setEsquemas([]);
    } finally {
      setLoadingEsquemas(false);
    }
  };

  const loadItems = async (esquemaId) => {
    console.log("🔍 Cargando items para esquema:", esquemaId);
    setLoadingItems(true);
    setSelectedItems([]);
    try {
      const data = await listarItemsPorEsquema(esquemaId);
      console.log("📦 Items recibidos (raw):", data);
      console.log("📦 Tipo de data:", typeof data);
      console.log("📦 Es array?:", Array.isArray(data));
      
      const itemsList = Array.isArray(data) ? data : [];
      console.log("✅ Items procesados:", itemsList);
      console.log("✅ Cantidad de items:", itemsList.length);
      
      if (itemsList.length > 0) {
        console.log("🔎 Primer item:", itemsList[0]);
      }
      
      setItems(itemsList);
    } catch (error) {
      console.error("❌ Error al cargar items:", error);
      console.error("❌ Error completo:", JSON.stringify(error, null, 2));
      toast.error("Error al cargar items del esquema");
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "id_tipo_alcance") {
      setSelectedEsquema(null);
      setItems([]);
      setSelectedItems([]);
    }
  };

  const toggleItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      ...groupParams,
      items_seleccionados: selectedItems,
    };

    try {
      if (isEditing) {
        await editarActividad(initialData.id_actividad, payload);
        onSubmit({ ...initialData, ...payload });
      } else {
        const result = await crearActividad(payload);
        onSubmit(result);
      }
    } catch (error) {
      console.error("Error al guardar actividad:", error);
      toast.error("Error al guardar la actividad");
    }
  };

  const canSubmit =
    form.titulo &&
    form.descripcion &&
    form.fecha_inicio &&
    form.fecha_cierre &&
    form.maximo_integrantes &&
    form.id_tipo_alcance &&
    selectedItems.length > 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna izquierda */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Título</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Título de la actividad"
              value={form.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">Descripción</label>
            <textarea
              className="w-full rounded-xl border border-gray-300 px-4 py-3 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Describe la actividad"
              value={form.descripcion}
              onChange={(e) => handleChange("descripcion", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-800 font-semibold mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
                value={form.fecha_inicio}
                onChange={(e) => handleChange("fecha_inicio", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-800 font-semibold mb-2">
                Fecha Cierre
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
                value={form.fecha_cierre}
                onChange={(e) => handleChange("fecha_cierre", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Máximo de Integrantes
            </label>
            <input
              type="number"
              min="1"
              max="10"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={form.maximo_integrantes}
              onChange={(e) =>
                handleChange("maximo_integrantes", parseInt(e.target.value))
              }
            />
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Tipo de Alcance
            </label>
            <select
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={form.id_tipo_alcance}
              onChange={(e) => handleChange("id_tipo_alcance", parseInt(e.target.value))}
            >
              <option value="">Seleccionar tipo</option>
              {tiposAlcance.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>

          {form.id_tipo_alcance && (
            <div>
              <label className="block text-gray-800 font-semibold mb-2">Esquema</label>
              {loadingEsquemas ? (
                <p className="text-gray-500 text-sm">Cargando esquemas...</p>
              ) : (
                <select
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={selectedEsquema || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedEsquema(value ? parseInt(value) : null);
                  }}
                >
                  <option value="">Seleccionar esquema</option>
                  {esquemas.map((esq) => (
                    <option key={esq.id_esquema} value={esq.id_esquema}>
                      {esq.id_esquema}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {selectedEsquema && (
            <div>
              <label className="block text-gray-800 font-semibold mb-3">
                Ítems del Esquema
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({selectedItems.length} seleccionados)
                </span>
              </label>
              <div className="border border-gray-300 rounded-xl p-4 max-h-[400px] overflow-y-auto bg-gray-50">
                {loadingItems ? (
                  <p className="text-gray-500 text-sm">Cargando ítems...</p>
                ) : (
                  <ItemsTree
                    items={items}
                    selectedItems={selectedItems}
                    onToggle={toggleItem}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isEditing ? "Actualizar Actividad" : "Crear Actividad"}
        </button>
      </div>
    </div>
  );
};

// ===== COMPONENTE: Árbol de Items Jerárquico =====
const ItemsTree = ({ items, selectedItems, onToggle, level = 0 }) => {
  console.log("🌲 ItemsTree renderizando:", {
    itemsLength: items?.length,
    items: items,
    level: level,
    selectedItemsLength: selectedItems?.length
  });

  if (!items || items.length === 0) {
    console.log("⚠️ No hay items para mostrar");
    return (
      <p className="text-gray-500 text-sm italic">No hay ítems disponibles</p>
    );
  }

  return (
    <div className={`space-y-2 ${level > 0 ? "ml-6" : ""}`}>
      {items.map((item) => {
        console.log("📝 Renderizando item:", item);
        return (
          <div key={item.id_item}>
            <label className="flex items-start gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id_item)}
                onChange={() => {
                  console.log("✅ Toggle item:", item.id_item);
                  onToggle(item.id_item);
                }}
                className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span
                className={`flex-1 ${
                  level === 0 ? "font-semibold text-gray-900" : "text-gray-700"
                }`}
              >
                {item.nombre}
              </span>
            </label>
            {item.subitems && item.subitems.length > 0 && (
              <ItemsTree
                items={item.subitems}
                selectedItems={selectedItems}
                onToggle={onToggle}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GroupDetail;