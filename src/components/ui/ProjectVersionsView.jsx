import React, { useEffect, useState } from "react";
import { verDetallesProyecto } from "../../services/projectServices";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    APROBADO: "bg-green-100 text-green-800 border-green-200",
    REVISION: "bg-yellow-100 text-yellow-800 border-yellow-200",
    RECHAZADO: "bg-red-100 text-red-800 border-red-200",
    EN_CURSO: "bg-blue-100 text-blue-800 border-blue-200",
  };
  const cls = statusConfig[status] || "bg-gray-100 text-gray-800 border-gray-200";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {status || "Sin estado"}
    </span>
  );
};

const ProjectVersionsView = ({ projectId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError("Error al cargar las versiones del proyecto");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (projectId) load();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  const historial = data?.Historial_Proyectos || [];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Versiones del Proyecto</h2>
          <p className="text-gray-600">{data?.Idea?.titulo || `Proyecto ${projectId}`}</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium shadow-sm"
        >
          Volver
        </button>
      </div>

      {loading && (
        <div className="py-16 text-center text-gray-500">Cargando versiones...</div>
      )}
      {error && (
        <div className="py-16 text-center text-red-600">{error}</div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {historial.length === 0 ? (
            <div className="py-16 text-center text-gray-600 bg-gray-50 rounded-2xl">
              No hay versiones registradas.
            </div>
          ) : (
            historial.map((version, index) => (
              <div key={version.id_historial_proyecto || index} className="border border-gray-200 rounded-xl p-5 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Versión {historial.length - index}</h3>
                    <p className="text-sm text-gray-600 mt-1">{version.fecha}</p>
                  </div>
                  {version.Estado?.descripcion && (
                    <StatusBadge status={version.Estado.descripcion} />
                  )}
                </div>

                {version.equipo && version.equipo.Integrante_Equipos && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Equipo</p>
                    <div className="space-y-1">
                      {version.equipo.Integrante_Equipos.map((i, idx) => (
                        <div key={idx} className="text-sm text-gray-700">
                          <span className="font-medium text-gray-600">{i.rol_equipo}:</span>{" "}
                          <span>{i.Usuario?.nombre}</span>{" "}
                          <span className="text-gray-500">({i.Usuario?.codigo})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectVersionsView;


