import React, { useEffect, useState } from "react";
import { obtenerEntregablesProyecto, obtenerEntregables } from "../../services/EntregableService";
import { verDetallesProyecto } from "../../services/projectServices";
import { Loader2, Download, Eye, EyeOff, FileText, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";

const StatusBadge = ({ status }) => {
  const map = {
    REVISION: "bg-yellow-100 text-yellow-800 border-yellow-200",
    APROBADO: "bg-green-100 text-green-800 border-green-200",
    RECHAZADO: "bg-red-100 text-red-800 border-red-200",
  };
  const cls = map[status] || "bg-gray-100 text-gray-800 border-gray-200";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {status || "Sin estado"}
    </span>
  );
};

const ProjectDocumentsView = ({ projectId, activityId, onBack }) => {
  const [proyecto, setProyecto] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Obtener datos del proyecto
        const proyectoData = await verDetallesProyecto(projectId);
        if (!mounted) return;
        setProyecto(proyectoData);

        // Obtener entregables del proyecto para esta actividad
        const entregablesData = await (!activityId
          ? obtenerEntregables(projectId)
          : obtenerEntregablesProyecto(projectId, activityId));

        if (!mounted) return;

        // Filtrar SOLO documentos (tipo investigativo)
        const docs = (Array.isArray(entregablesData) ? entregablesData : [])
          .filter(e => e.tipo === 'DOCUMENTO');

        setDocumentos(docs);
      } catch (e) {
        if (!mounted) return;
        console.error("Error al cargar documentos:", e);
        setError("Error al cargar los documentos");
        toast.error("Error al cargar los documentos");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (projectId) load();
    return () => {
      mounted = false;
    };
  }, [projectId, activityId]);

  const handleDownload = (documento) => {
    const url = documento.url_archivo;
    if (!url) return;

    const link = document.createElement("a");
    link.href = url;
    link.download = documento.nombre_archivo || "documento";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getExt = (name = "") => name.split(".").pop()?.toLowerCase();

  const canPreview = (documento) => {
    if (!documento.url_archivo) return false;
    const ext = getExt(documento.nombre_archivo || "");
    return ["doc", "docx", "pdf"].includes(ext);
  };

  const renderPreview = (documento) => {
    if (!documento.url_archivo) {
      return <div className="text-sm text-gray-600">No hay archivo disponible.</div>;
    }

    const ext = getExt(documento.nombre_archivo);

    if (["doc", "docx"].includes(ext)) {
      return (
        <div className="relative">
          <iframe
            title="vista-previa-word"
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(documento.url_archivo)}`}
            className="w-full h-[600px] border rounded-lg"
          />
          <div className="mt-2 text-center">
            <a
              href={documento.url_archivo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir en nueva pestaña
            </a>
          </div>
        </div>
      );
    }

    if (ext === "pdf") {
      return (
        <iframe
          title="vista-previa-pdf"
          src={documento.url_archivo}
          className="w-full h-[600px] border rounded-lg"
        />
      );
    }

    return <div className="text-sm text-gray-600">No hay vista previa disponible para este formato.</div>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mr-3" />
        <span className="text-gray-500">Cargando documentos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-600">{error}</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 text-red-600 hover:underline"
          >
            Volver
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documentación</h2>
          <p className="text-gray-600">{proyecto?.Idea?.titulo || `Proyecto ${projectId}`}</p>
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium shadow-sm"
          >
            ← Volver
          </button>
        )}
      </div>

      <div className="space-y-4">
        {documentos.length === 0 ? (
          <div className="py-16 text-center text-gray-600 bg-gray-50 rounded-2xl">
            No hay documentos cargados
          </div>
        ) : (
          documentos.map((documento, idx) => {
            const isExpanded = expandedIndex === idx;

            return (
              <div key={documento.id_entregable || idx} className="border border-gray-200 rounded-xl p-5 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">
                        {documento.nombre_archivo || 'Documento'}
                      </h3>
                      {documento.Estado?.descripcion && (
                        <StatusBadge status={documento.Estado.descripcion} />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Tipo: Documento</p>
                    {documento.fecha_subida && (
                      <p className="text-sm text-gray-600">Subido: {documento.fecha_subida}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {canPreview(documento) && (
                      <button
                        type="button"
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                      >
                        {isExpanded ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Ver
                          </>
                        )}
                      </button>
                    )}
                    {documento.url_archivo && (
                      <button
                        type="button"
                        onClick={() => handleDownload(documento)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Descargar
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {renderPreview(documento)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProjectDocumentsView;