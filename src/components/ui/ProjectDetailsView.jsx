import React, { useEffect, useState } from "react";
import {
  verDetallesProyecto,
  liberarProyecto,
} from "../../services/projectServices";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/useToast";
import Swal from "sweetalert2";

const InfoItem = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
    <p className="text-gray-900 break-words">{value || "No disponible"}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    EN_CURSO: "bg-blue-100 text-blue-800 border-blue-200",
    APROBADO: "bg-green-100 text-green-800 border-green-200",
    REVISION: "bg-yellow-100 text-yellow-800 border-yellow-200",
    RECHAZADO: "bg-red-100 text-red-800 border-red-200",
  };
  const cls = map[status] || "bg-gray-100 text-gray-800 border-gray-200";
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold border ${cls}`}
    >
      {status || "Sin estado"}
    </span>
  );
};

const ProjectDetailsView = ({ projectId, onBack, onProjectLiberated }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userData } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await verDetallesProyecto(projectId);
        if (!mounted) return;
        setData(resp);
      } catch (e) {
        if (!mounted) return;
        setError("Error al cargar los detalles del proyecto");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (projectId) load();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  const alcance = data?.Tipo_alcance?.nombre || data?.TipoAlcance?.nombre;
  const estado =
    data?.Historial_Proyectos?.[0]?.Estado?.descripcion ||
    data?.Estado?.descripcion;

  const tecnologias = (data?.tecnologias || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const teamMembers = (() => {
    const list = Array.isArray(data?.Historial_Proyectos)
      ? data.Historial_Proyectos
      : [];
    const withTeam = [...list]
      .reverse()
      .find(
        (h) =>
          h?.equipo?.Integrante_Equipos &&
          h.equipo.Integrante_Equipos.length > 0
      );
    return withTeam?.equipo?.Integrante_Equipos || [];
  })();

  const isStudent = userData?.Rol?.descripcion === "ESTUDIANTE";

  const handleLiberarProyecto = async () => {
    const result = await Swal.fire({
      title: "Confirmar liberación de proyecto",
      text: "¿Estás seguro de que deseas liberar este proyecto? Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Liberar Proyecto",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        if (!userData?.codigo) {
          showError("No se pudo obtener el código del usuario");
          return;
        }

        const resultado = await liberarProyecto(projectId, userData.codigo);

        showSuccess("Proyecto liberado exitosamente");

        if (onProjectLiberated) {
          onProjectLiberated(projectId);
        }

        if (onBack) {
          onBack();
        }
      } catch (error) {
        console.error("Error al liberar proyecto:", error);

        let errorMessage =
          "No se pudo liberar el proyecto. Inténtalo de nuevo.";

        if (error.message) {
          errorMessage = error.message;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }

        showError(errorMessage);
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Detalles del Proyecto
          </h2>
        </div>
        <div className="flex gap-3">
          {isStudent && !loading && data && (
            <button
              type="button"
              onClick={handleLiberarProyecto}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium shadow-sm"
            >
              Liberar Proyecto
            </button>
          )}
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium shadow-sm"
          >
            Volver
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-16 text-center text-gray-500">
          Cargando detalles...
        </div>
      )}
      {error && <div className="py-16 text-center text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            {estado && <StatusBadge status={estado} />}
            {alcance && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold border bg-indigo-100 text-indigo-800 border-indigo-200">
                {alcance}
              </span>
            )}
            {typeof data?.porcentaje === "number" && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-800 border-gray-200">
                {Math.max(0, Math.min(100, data.porcentaje))}% ejecución
              </span>
            )}
          </div>

          {/* Información General */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Título del Proyecto" value={data?.Idea?.titulo} />
              <InfoItem
                label="Línea de Investigación"
                value={data?.linea_investigacion}
              />
              <InfoItem label="Palabras Clave" value={data?.palabras_clave} />
              <InfoItem
                label="Fecha de Creación"
                value={
                  data?.fecha_creacion
                    ? new Date(data.fecha_creacion).toLocaleString("es-ES")
                    : ""
                }
              />
            </div>
          </div>

          {/* Contexto del Proyecto */}
          {(data?.Idea?.problema || data?.Idea?.justificacion) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Contexto del Proyecto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.Idea?.problema && (
                  <InfoItem label="Problema" value={data.Idea.problema} />
                )}
                {data?.Idea?.justificacion && (
                  <InfoItem
                    label="Justificación"
                    value={data.Idea.justificacion}
                  />
                )}
              </div>
            </div>
          )}

          {/* Objetivos */}
          {(data?.Idea?.objetivo_general ||
            data?.Idea?.objetivos_especificos) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Objetivos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.Idea?.objetivo_general && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Objetivo General
                    </p>
                    <p className="text-gray-900 break-words leading-relaxed">
                      {data.Idea.objetivo_general}
                    </p>
                  </div>
                )}
                {data?.Idea?.objetivos_especificos && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Objetivos Específicos
                    </p>
                    {(() => {
                      const items = String(data.Idea.objetivos_especificos)
                        .split(/\r?\n|;|,/)
                        .map((s) => s.trim())
                        .filter(Boolean);
                      return (
                        <ol className="list-decimal ml-5 space-y-1 text-gray-900">
                          {items.map((it, idx) => (
                            <li key={idx}>{it}</li>
                          ))}
                        </ol>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tecnologías e Integrantes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tecnologías */}
            {tecnologias.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Tecnologías
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tecnologias.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Integrantes del Equipo */}
            {Array.isArray(teamMembers) && teamMembers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Integrantes del Equipo
                </h3>
                <div className="space-y-3">
                  {teamMembers.map((m, idx) => {
                    const nombre = m?.Usuario?.nombre || "Sin nombre";
                    const codigo = m?.Usuario?.codigo || "-";
                    const rol = m?.rol_equipo || "Integrante";
                    const isLeader =
                      String(rol).toLowerCase().includes("líder") ||
                      String(rol).toLowerCase().includes("lider");
                    return (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {nombre}
                          </p>
                          <p className="text-xs text-gray-600">
                            Código: {codigo}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                            isLeader
                              ? "bg-purple-100 text-purple-800 border-purple-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                        >
                          {rol}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Secciones de Entregables e Historial se gestionan en sus vistas dedicadas */}
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsView;