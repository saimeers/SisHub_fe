import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertCircle, XCircle, Download, ExternalLink, Eye, EyeOff, Loader2, Music, Video, Image, Code } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { verDetallesProyecto } from '../../../services/projectServices';
import { revisarProyecto } from '../../../services/proyectoServices';

const ReviewProyecto = ({
  projectId,
  currentUserCode,
  onBack,
  onReviewComplete
}) => {

  console.log("proyect id en review:", projectId);
  const [loading, setLoading] = useState(true);
  const [proyecto, setProyecto] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previewing, setPreviewing] = useState(null);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);

      // Obtener datos completos del proyecto
      const proyectoData = await verDetallesProyecto(projectId);
      setProyecto(proyectoData);

    } catch (error) {
      console.error("Error al cargar proyecto:", error);
      toast.error("Error al cargar el proyecto");
      if (onBack) onBack();
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (accion) => {
    try {
      setSubmitting(true);
      console.log("Codigo: ", currentUserCode);
      console.log("accion: ", accion);
      console.log("proyecto id al enviar: ", projectId);
      await revisarProyecto(
        projectId,
        accion,
        observacion.trim() || null,
        currentUserCode
      );

      let msg = "";
      if (accion === "Aprobar") msg = "Proyecto aprobado exitosamente";
      if (accion === "Aprobar_Con_Observacion") msg = "Proyecto aprobado con observaciones. El estudiante debe realizar correcciones";
      if (accion === "Rechazar") msg = "Proyecto rechazado y devuelto al banco de propuestas";

      toast.success(msg);
      if (onReviewComplete) onReviewComplete();
      else if (onBack) onBack();

    } catch (error) {
      console.error("Error al revisar proyecto:", error);
      toast.error(error.message || "Error al revisar el proyecto");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    const result = await Swal.fire({
      title: "¿Aprobar este proyecto?",
      html: `<p>El proyecto será aprobado y el estudiante podrá continuar.</p>`,
      icon: "success",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Sí, aprobar"
    });
    if (result.isConfirmed) await submitReview("Aprobar");
  };

  const handleApproveWithObservations = async () => {
    if (!observacion.trim()) {
      return toast.warning("Debes escribir las observaciones para el estudiante");
    }
    const result = await Swal.fire({
      title: "¿Aprobar con observaciones?",
      html: `<p>El estudiante deberá realizar las correcciones indicadas.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Sí, solicitar correcciones"
    });
    if (result.isConfirmed) await submitReview("Aprobar_Con_Observacion");
  };

  const handleReject = async () => {
    const result = await Swal.fire({
      title: "¿Rechazar este proyecto?",
      html: `<p>El proyecto será devuelto al banco de propuestas.</p>`,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Sí, rechazar"
    });
    if (result.isConfirmed) await submitReview("Rechazar");
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

  const renderPreview = (entregable) => {
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

  const handleDescargar = (entregable) => {
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
    switch(tipo) {
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
        <p className="text-gray-500">Cargando proyecto...</p>
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontró el proyecto</p>
        {onBack && (
          <button onClick={onBack} className="mt-4 text-red-600 hover:underline">Volver</button>
        )}
      </div>
    );
  }

  const entregables = proyecto.entregables || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Revisar Continuación de Proyecto</h2>
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

        {/* Información básica en formato grid como ProyectoCalificado */}
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
            <span className="ml-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
              EN REVISIÓN
            </span>
          </div>
        </div>

        {/* Información adicional de la idea */}
        {proyecto.Idea?.objetivo_general && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">Objetivo General:</span>
            <p className="text-gray-700 mt-1">{proyecto.Idea.objetivo_general}</p>
          </div>
        )}

        {proyecto.Idea?.problema && (
          <div className="mt-3">
            <span className="text-sm text-gray-500">Problemática:</span>
            <p className="text-gray-700 mt-1 whitespace-pre-wrap">{proyecto.Idea.problema}</p>
          </div>
        )}
      </div>

      {/* Entregables del proyecto */}
      {entregables.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Entregables del Proyecto ({entregables.length})
          </h3>

          <div className="space-y-6">
            {entregables.map((entregable, index) => {
              const Icon = getEntregableIcon(entregable.tipo);
              const isPreviewing = previewing === entregable.id_entregable || previewing === index;

              return (
                <div
                  key={entregable.id_entregable || index}
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
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entregable.Estado.descripcion === 'APROBADO' 
                              ? 'bg-green-100 text-green-700' 
                              : entregable.Estado.descripcion === 'CALIFICADO'
                              ? 'bg-blue-100 text-blue-700'
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
                        onClick={() => togglePreview(entregable.id_entregable || index)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        title={isPreviewing ? 'Ocultar vista previa' : 'Ver vista previa'}
                      >
                        {isPreviewing ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {(entregable.url_archivo || entregable.url_repositorio) && (
                        <button
                          onClick={() => handleDescargar(entregable)}
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
                      {renderPreview(entregable)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Observaciones */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block text-gray-800 font-semibold mb-2">
          Observaciones (opcional)
        </label>
        <textarea
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-red-600"
          placeholder="Escribe observaciones sobre el proyecto..."
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          disabled={submitting}
        />
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleApprove}
          disabled={submitting}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <CheckCircle className="w-5 h-5" /> Aprobar
        </button>

        <button
          onClick={handleApproveWithObservations}
          disabled={submitting}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <AlertCircle className="w-5 h-5" /> Aprobar con observaciones
        </button>

        <button
          onClick={handleReject}
          disabled={submitting}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <XCircle className="w-5 h-5" /> Rechazar
        </button>
      </div>

      {submitting && (
        <div className="text-center text-sm text-gray-600">
          <Loader2 className="animate-spin h-5 w-5 text-red-600 inline mr-2" />
          Procesando revisión...
        </div>
      )}
    </div>
  );
};

export default ReviewProyecto;