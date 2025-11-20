import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, Eye, EyeOff, Music, Video, Image, Code, Loader2, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import { verDetallesProyecto } from '../../services/projectServices';
import { historicoEntregables } from '../../services/EntregableService';

const ProyectoCalificado = ({
  projectId,
  onBack
}) => {
  console.log("llega en calificado el siguiente id:", projectId)
  const [loading, setLoading] = useState(true);
  const [proyecto, setProyecto] = useState(null);
  const [historialEntregables, setHistorialEntregables] = useState([]);
  const [previewing, setPreviewing] = useState(null);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);

      // Obtener datos del proyecto
      const proyectoData = await verDetallesProyecto(projectId);
      setProyecto(proyectoData);

      // Obtener historial de entregables
      const historial = await historicoEntregables(projectId);
      setHistorialEntregables(Array.isArray(historial) ? historial : []);

    } catch (error) {
      console.error("Error al cargar datos del proyecto:", error);
      toast.error("Error al cargar el proyecto calificado");
      if (onBack) onBack();
    } finally {
      setLoading(false);
    }
  };

  const togglePreview = (id_entregable) => {
    setPreviewing(prev => prev === id_entregable ? null : id_entregable);
  };

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

  const renderPreview = (entregableData) => {
    const entregable = entregableData.entregable || entregableData;

    if (entregable.url_video) {
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
      return <p className="text-sm text-gray-600">URL de video no válida</p>;
    }

    if (entregable.url_audio) {
      return (
        <audio controls className="w-full">
          <source src={entregable.url_audio} />
          Tu navegador no soporta el elemento de audio.
        </audio>
      );
    }

    if (entregable.url_imagen) {
      return (
        <img
          src={entregable.url_imagen}
          alt={entregable.nombre_archivo || 'Imagen'}
          className="max-w-full max-h-[500px] rounded-lg mx-auto"
        />
      );
    }

    if (entregable.url_repositorio) {
      return (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Code className="w-5 h-5 text-gray-600" />
            <p className="text-sm font-medium text-gray-900">Repositorio</p>
          </div>
          <a
            href={entregable.url_repositorio}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm break-all"
          >
            {entregable.url_repositorio}
          </a>
        </div>
      );
    }

    if (entregable.url_archivo) {
      const ext = entregable.nombre_archivo?.split('.').pop()?.toLowerCase() || '';

      if (ext === 'doc' || ext === 'docx') {
        return (
          <div className="relative">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(entregable.url_archivo)}`}
              title="Vista previa Word"
              className="w-full h-[600px] rounded-lg border"
            />
            <div className="mt-2 text-center">
              <a
                href={entregable.url_archivo}
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

      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return (
          <img
            src={entregable.url_archivo}
            alt={entregable.nombre_archivo}
            className="max-w-full max-h-[500px] rounded-lg mx-auto"
          />
        );
      }

      if (['mp4', 'webm'].includes(ext)) {
        return (
          <video controls className="w-full max-h-[500px] rounded-lg bg-black">
            <source src={entregable.url_archivo} />
            Tu navegador no soporta el elemento de video.
          </video>
        );
      }

      if (['mp3', 'wav'].includes(ext)) {
        return (
          <audio controls className="w-full">
            <source src={entregable.url_archivo} />
            Tu navegador no soporta el elemento de audio.
          </audio>
        );
      }
    }

    return <p className="text-sm text-gray-600">No hay vista previa disponible</p>;
  };

  const handleDescargar = (entregableData) => {
    const entregable = entregableData.entregable || entregableData;
    const url = entregable.url_archivo || entregable.url_repositorio;
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = entregable.nombre_archivo || 'archivo';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info('Descargando archivo...');
  };

  const getEntregableIcon = (tipo) => {
    switch (tipo) {
      case 'VIDEO': return Video;
      case 'AUDIO': return Music;
      case 'IMAGEN': return Image;
      case 'REPOSITORIO': return Code;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mr-3" />
        <p className="text-gray-500">Cargando proyecto calificado...</p>
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontró el proyecto</p>
        {onBack && (
          <button onClick={onBack} className="mt-4 text-red-600 hover:underline">
            Volver
          </button>
        )}
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Proyecto Calificado</h2>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-full text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50"
            >
              ← Volver
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">Título:</span>
            <p className="font-semibold text-gray-900">{proyecto.Idea?.titulo}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Línea de Investigación:</span>
            <p className="text-gray-900">{proyecto.linea_investigacion}</p>
          </div>
          {proyecto.tecnologias && (
            <div>
              <span className="text-sm text-gray-500">Tecnologías:</span>
              <p className="text-gray-900">{proyecto.tecnologias}</p>
            </div>
          )}
          {proyecto.palabras_clave && (
            <div>
              <span className="text-sm text-gray-500">Palabras Clave:</span>
              <p className="text-gray-900">{proyecto.palabras_clave}</p>
            </div>
          )}
          <div>
            <span className="text-sm text-gray-500">Tipo de Alcance:</span>
            <p className="text-gray-900">{proyecto.Tipo_alcance?.nombre}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Estado:</span>
            <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              CALIFICADO
            </span>
          </div>
        </div>

        {proyecto.Idea?.objetivo_general && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">Objetivo General:</span>
            <p className="text-gray-700 mt-1">{proyecto.Idea.objetivo_general}</p>
          </div>
        )}
      </div>

      {/* Historial de Entregables Calificados */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Historial de Entregables ({historialEntregables.length})
        </h3>

        {historialEntregables.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron entregables calificados
          </div>
        ) : (
          <div className="space-y-6">
            {historialEntregables.map((historial) => {
              const entregable = historial.entregable;
              if (!entregable) return null;

              const Icon = getEntregableIcon(entregable.tipo);
              const isPreviewing = previewing === entregable.id_entregable;
              const tieneCalificacion = entregable.calificacion !== null && entregable.calificacion !== undefined;

              return (
                <div
                  key={historial.id_historial_entregable}
                  className="border border-gray-200 rounded-xl p-5 bg-gray-50"
                >
                  {/* Header del entregable */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5 text-gray-600" />
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {entregable.tipo}
                        </span>
                        <span className="text-sm text-gray-500">
                          {entregable.fecha_subida}
                        </span>
                        {entregable.Estado?.descripcion && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${entregable.Estado.descripcion === 'APROBADO'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                            }`}>
                            {entregable.Estado.descripcion}
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-900">{entregable.nombre_archivo}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => togglePreview(entregable.id_entregable)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        title={isPreviewing ? 'Ocultar vista previa' : 'Ver vista previa'}
                      >
                        {isPreviewing ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {(entregable.url_archivo || entregable.url_repositorio) && (
                        <button
                          onClick={() => handleDescargar(historial)}
                          className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Vista previa */}
                  {isPreviewing && (
                    <div className="mb-4 p-4 border-t border-gray-200 bg-white rounded-lg">
                      {renderPreview(historial)}
                    </div>
                  )}

                  {/* Calificación y Observaciones */}
                  {tieneCalificacion && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      <div className="bg-white rounded-lg p-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Calificación
                        </label>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${entregable.calificacion < 3
                              ? "text-red-600"
                              : entregable.calificacion < 4
                                ? "text-yellow-500"
                                : "text-green-600"
                            }`}>
                            {entregable.calificacion}
                          </span>
                          <span className="text-sm text-gray-500">/ 5.0</span>
                        </div>
                      </div>

                      <div className="md:col-span-2 bg-white rounded-lg p-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Observaciones del Profesor
                        </label>
                        <p className="text-gray-700 text-sm">
                          {entregable.comentarios || 'Sin observaciones'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProyectoCalificado;