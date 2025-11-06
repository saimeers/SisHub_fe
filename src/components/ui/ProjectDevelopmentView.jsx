import React, { useEffect, useState } from "react";
import { obtenerEntregablesProyecto, obtenerEntregables } from "../../services/EntregableService";
import { verDetallesProyecto } from "../../services/projectServices";
import { Loader2, Download, Eye, EyeOff, FileText, Video, Music, Image, Code } from "lucide-react";
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

const ProjectDevelopmentView = ({ projectId, activityId, onBack }) => {
  console.log("ProjectDevelopmentView props:", { projectId, activityId });
  const [proyecto, setProyecto] = useState(null);
  const [entregables, setEntregables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  console.log("ProjectDevelopmentView state:", { proyecto, entregables, loading, error });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Obtener datos del proyecto
        const proyectoData = await verDetallesProyecto(projectId);
        console.log("Datos del proyecto obtenidos:", proyectoData);
        if (!mounted) return;
        setProyecto(proyectoData);

        const entregablesData = await (!activityId
          ? obtenerEntregables(projectId)
          : obtenerEntregablesProyecto(projectId, activityId));

        console.log(entregablesData);
        if (!mounted) return;

        // Filtrar solo DOCUMENTO, VIDEO, AUDIO, IMAGEN, REPOSITORIO 
        const entregables = (Array.isArray(entregablesData) ? entregablesData : [])
          .filter(e => ['DOCUMENTO', 'VIDEO', 'AUDIO', 'IMAGEN', 'REPOSITORIO'].includes(e.tipo));

        setEntregables(entregables);
      } catch (e) {
        if (!mounted) return;
        console.error("Error al cargar entregables:", e);
        setError("Error al cargar los entregables");
        toast.error("Error al cargar los entregables");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (projectId) load();
    return () => {
      mounted = false;
    };
  }, [projectId, activityId]);

  console.log("Rendering ProjectDevelopmentView with state:", { proyecto, entregables, loading, error });
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?]+)/,
      /youtube\.com\/embed\/([^&\?]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
  };

  const handleDownload = (entregable) => {
    const url = entregable.url_archivo || entregable.url_video || entregable.url_audio || entregable.url_imagen;
    if (!url) return;

    const link = document.createElement("a");
    link.href = url;
    link.download = entregable.nombre_archivo || "archivo";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getExt = (name = "") => name.split(".").pop()?.toLowerCase();

  const canPreview = (entregable) => {
    if (entregable.tipo === 'VIDEO' && entregable.url_video) return true;
    if (entregable.tipo === 'AUDIO' && entregable.url_audio) return true;
    if (entregable.tipo === 'IMAGEN' && entregable.url_imagen) return true;
    if (entregable.tipo === 'REPOSITORIO' && entregable.url_repositorio) return true;
    if (entregable.tipo === 'REPOSITORIO') { return !!(entregable.url_repositorio || entregable.url_archivo);}
    if (!entregable.url_archivo) return false;
    const ext = getExt(entregable.nombre_archivo || "");
    return ["pdf", "png", "jpg", "jpeg", "webp", "doc", "docx", "mp4", "webm", "mp3", "wav"].includes(ext);
  };

  const renderPreview = (entregable) => {
    // VIDEO
    if (entregable.tipo === 'VIDEO' && entregable.url_video) {
      const embedUrl = getYouTubeEmbedUrl(entregable.url_video);
      if (embedUrl) {
        return (
          <iframe
            src={embedUrl}
            title="Video de YouTube"
            className="w-full h-[400px] rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }

    // AUDIO
    if (entregable.tipo === 'AUDIO' && entregable.url_audio) {
      return (
        <audio controls className="w-full">
          <source src={entregable.url_audio} />
          Tu navegador no soporta el elemento de audio.
        </audio>
      );
    }

    // IMAGEN
    if (entregable.tipo === 'IMAGEN' && entregable.url_imagen) {
      return (
        <img
          src={entregable.url_imagen}
          alt={entregable.nombre_archivo || 'Imagen'}
          className="max-w-full max-h-[500px] rounded-lg mx-auto"
        />
      );
    }

    // ARCHIVO
    if (entregable.url_archivo) {
      const ext = getExt(entregable.nombre_archivo);

      if (ext === "pdf") {
        return (
          <iframe
            title="vista-previa-pdf"
            src={entregable.url_archivo}
            className="w-full h-[600px] border rounded-lg"
          />
        );
      }

      if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
        return (
          <img
            src={entregable.url_archivo}
            alt={entregable.nombre_archivo || "entregable"}
            className="max-h-[520px] rounded-lg mx-auto"
          />
        );
      }

      if (["doc", "docx"].includes(ext)) {
        return (
          <iframe
            title="vista-previa-docx"
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(entregable.url_archivo)}`}
            className="w-full h-[600px] border rounded-lg"
          />
        );
      }

      if (["mp4", "webm"].includes(ext)) {
        return (
          <video controls className="w-full max-h-[520px] rounded-lg bg-black">
            <source src={entregable.url_archivo} />
            Tu navegador no soporta el elemento de video.
          </video>
        );
      }

      if (["mp3", "wav"].includes(ext)) {
        return (
          <audio controls className="w-full">
            <source src={entregable.url_archivo} />
            Tu navegador no soporta el elemento de audio.
          </audio>
        );
      }
    }
    // REPOSITORIO
    if (entregable.tipo === 'REPOSITORIO') {
      // Si tiene URL al repositorio (GitHub, GitLab, etc.)
      if (entregable.url_repositorio) {
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              Repositorio disponible en:
            </p>
            <a
              href={entregable.url_repositorio}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {entregable.url_repositorio}
            </a>
            {entregable.url_repositorio.includes("github.com") && (
              <iframe
                src={entregable.url_repositorio}
                title="Vista del repositorio"
                className="w-full h-[500px] border rounded-lg mt-2"
              />
            )}
          </div>
        );
      }

      // Si tiene un archivo .zip asociado
      if (entregable.url_archivo && entregable.nombre_archivo?.endsWith(".zip")) {
        return (
          <div className="text-sm text-gray-700">
            <p>Archivo comprimido disponible para descarga:</p>
            <button
              onClick={() => handleDownload(entregable)}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Descargar ZIP
            </button>
          </div>
        );
      }
    }


    return <div className="text-sm text-gray-600">No hay vista previa disponible.</div>;
  };

  const getIcon = (tipo) => {
    switch (tipo) {
      case 'VIDEO': return Video;
      case 'AUDIO': return Music;
      case 'IMAGEN': return Image;
      case 'DOCUMENTO': return FileText;
      case 'REPOSITORIO': return Code;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mr-3" />
        <span className="text-gray-500">Cargando entregables...</span>
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
          <h2 className="text-2xl font-bold text-gray-900">Desarrollo</h2>
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
        {entregables.length === 0 ? (
          <div className="py-16 text-center text-gray-600 bg-gray-50 rounded-2xl">
            No hay entregables de desarrollo
          </div>
        ) : (
          entregables.map((entregable, idx) => {
            const Icon = getIcon(entregable.tipo);
            const isExpanded = expandedIndex === idx;

            return (
              <div key={entregable.id_entregable || idx} className="border border-gray-200 rounded-xl p-5 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">
                        {entregable.nombre_archivo || entregable.tipo}
                      </h3>
                      {entregable.Estado?.descripcion && (
                        <StatusBadge status={entregable.Estado.descripcion} />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Tipo: {entregable.tipo}</p>
                    {entregable.fecha_subida && (
                      <p className="text-sm text-gray-600">Subido: {entregable.fecha_subida}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {canPreview(entregable) && (
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
                    <button
                      type="button"
                      onClick={() => handleDownload(entregable)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Descargar
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {renderPreview(entregable)}
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

export default ProjectDevelopmentView;