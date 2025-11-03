import React, { useEffect, useMemo, useState } from "react";
import { verDetallesProyecto } from "../../services/projectServices";

const ProjectDevelopmentView = ({ projectId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

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
        setError("Error al cargar información de desarrollo");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (projectId) load();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  const entregables = useMemo(() => {
    return (data?.entregables || []).filter((e) => e.tipo === "DESARROLLO" || e.tipo === "CÓDIGO");
  }, [data]);

  const handleOpen = (url) => {
    if (url) window.open(url, "_blank");
  };

  const handleDownload = (url, name) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = name || "archivo";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getExt = (name = "") => name.split(".").pop()?.toLowerCase();
  const canPreview = (ent) => {
    const ext = getExt(ent?.nombre_archivo || "");
    if (!ent?.url_archivo) return false;
    if (["mp4", "webm"].includes(ext)) return true;
    if (ext === "pdf") return true;
    return ["png", "jpg", "jpeg", "webp"].includes(ext);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Desarrollo</h2>
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

      {loading && <div className="py-16 text-center text-gray-500">Cargando información...</div>}
      {error && <div className="py-16 text-center text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="space-y-4">
          {entregables.length === 0 ? (
            <div className="py-16 text-center text-gray-600 bg-gray-50 rounded-2xl">No hay entregables de desarrollo</div>
          ) : (
            entregables.map((d, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-5 bg-white">
                <div className="flex items-start justify-between">
                  <div className="pr-4">
                    <h3 className="font-semibold text-gray-900">
                      {d.nombre_archivo || "Entregable de desarrollo"}
                    </h3>
                    <p className="text-sm text-gray-600">Tipo: {d.tipo}</p>
                    {d.fecha_subida && (
                      <p className="text-sm text-gray-600">Subido: {d.fecha_subida}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {d.url_archivo && canPreview(d) && (
                      <button
                        type="button"
                        onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                        className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                      >
                        {expandedIndex === idx ? "Ocultar" : "Ver"}
                      </button>
                    )}
                    {d.url_archivo && (
                      <button
                        type="button"
                        onClick={() => handleDownload(d.url_archivo, d.nombre_archivo)}
                        className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
                      >
                        Descargar
                      </button>
                    )}
                  </div>
                </div>

                {expandedIndex === idx && d.url_archivo && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {(() => {
                      const ext = getExt(d.nombre_archivo);
                      if (["mp4", "webm"].includes(ext)) {
                        return (
                          <video controls src={d.url_archivo} className="w-full max-h-[520px] rounded-lg bg-black" />
                        );
                      }
                      if (ext === "pdf") {
                        return (
                          <iframe title="vista-previa-pdf" src={d.url_archivo} className="w-full h-[600px] border rounded-lg" />
                        );
                      }
                      if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
                        return (
                          <img src={d.url_archivo} alt={d.nombre_archivo || "entregable"} className="max-h-[520px] rounded-lg" />
                        );
                      }
                      return <div className="text-sm text-gray-600">No hay vista previa disponible. Usa Abrir o Descargar.</div>;
                    })()}
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

export default ProjectDevelopmentView;


