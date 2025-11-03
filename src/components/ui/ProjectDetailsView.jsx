import React, { useEffect, useState } from "react";
import { verDetallesProyecto } from "../../services/projectServices";

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
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${cls}`}>{status || "Sin estado"}</span>;
};

const ProjectDetailsView = ({ projectId, onBack }) => {
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
  const estado = data?.Historial_Proyectos?.[0]?.Estado?.descripcion || data?.Estado?.descripcion;

  const tecnologias = (data?.tecnologias || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Detalles del Proyecto</h2>
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

      {loading && <div className="py-16 text-center text-gray-500">Cargando detalles...</div>}
      {error && <div className="py-16 text-center text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="space-y-6">
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

          <p className="text-gray-700 leading-relaxed">
            {data?.Idea?.objetivo_general || "Sin descripción disponible."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Tipo de Alcance" value={alcance} />
            <InfoItem label="Línea de Investigación" value={data?.linea_investigacion} />
            <InfoItem label="Palabras Clave" value={data?.palabras_clave} />
            <InfoItem label="Fecha de Creación" value={data?.fecha_creacion} />
          </div>

          {tecnologias.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Tecnologías</p>
              <div className="flex flex-wrap gap-2">
                {tecnologias.map((tech, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsView;


