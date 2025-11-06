import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, Save, Send, Loader2, Eye, EyeOff, Music, Video, Image, Code } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { verDetallesProyecto } from '../../../services/projectServices';
import { obtenerEntregablesProyecto, retroalimentarEntregable } from '../../../services/EntregableService';
import { calificarProyecto } from '../../../services/proyectoServices';

const CalificarProyecto = ({
  projectId,
  activityId,
  currentUserCode,
  onBack,
  onCalificacionComplete
}) => {
  const [loading, setLoading] = useState(true);
  const [proyecto, setProyecto] = useState(null);
  const [entregables, setEntregables] = useState([]);
  const [calificaciones, setCalificaciones] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [previewing, setPreviewing] = useState(null);
  const [savingFeedback, setSavingFeedback] = useState(null);

  useEffect(() => {
    loadProjectData();
  }, [projectId, activityId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      // Obtener datos del proyecto
      const proyectoData = await verDetallesProyecto(projectId);
      setProyecto(proyectoData);

      // Obtener entregables del proyecto para esta actividad
      const entregablesData = await obtenerEntregablesProyecto(projectId, activityId);
      setEntregables(Array.isArray(entregablesData) ? entregablesData : []);

      // Inicializar calificaciones
      const initialCalificaciones = {};
      (Array.isArray(entregablesData) ? entregablesData : []).forEach(e => {
        initialCalificaciones[e.id_entregable] = {
          calificacion: e.calificacion || '',
          comentarios: e.comentarios || '',
          guardado: e.calificacion !== null && e.calificacion !== undefined
        };
      });
      setCalificaciones(initialCalificaciones);

    } catch (error) {
      console.error("Error al cargar datos del proyecto:", error);
      toast.error("Error al cargar el proyecto");
      if (onBack) onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCalificacionChange = (id_entregable, field, value) => {
    setCalificaciones(prev => ({
      ...prev,
      [id_entregable]: {
        ...prev[id_entregable],
        [field]: value,
        guardado: false
      }
    }));
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

  const handleGuardarRetroalimentacion = async (id_entregable) => {
    const cal = calificaciones[id_entregable];
    
    if (!cal?.calificacion || cal.calificacion === '') {
      toast.error('Debes asignar una calificación');
      return;
    }

    const nota = parseFloat(cal.calificacion);
    if (isNaN(nota) || nota < 0 || nota > 5) {
      toast.error('La calificación debe estar entre 0 y 5');
      return;
    }

    try {
      setSavingFeedback(id_entregable);

      await retroalimentarEntregable(
        id_entregable,
        cal.comentarios || null,
        nota,
        currentUserCode
      );

      setCalificaciones(prev => ({
        ...prev,
        [id_entregable]: {
          ...prev[id_entregable],
          guardado: true
        }
      }));

      toast.success('Retroalimentación guardada exitosamente');

    } catch (error) {
      console.error("Error al guardar retroalimentación:", error);
      toast.error(error.message || "Error al guardar la retroalimentación");
    } finally {
      setSavingFeedback(null);
    }
  };

  const todosRetroalimentados = () => {
    return entregables.every(e => calificaciones[e.id_entregable]?.guardado);
  };

  const handleEnviarCalificacion = async () => {
    if (!todosRetroalimentados()) {
      toast.error("Debes guardar la retroalimentación de todos los entregables antes de enviar");
      return;
    }

    const result = await Swal.fire({
      title: '¿Calificar proyecto?',
      html: `
        <p>Se calificará el proyecto completo y se notificará al estudiante.</p>
        <p class="text-sm text-gray-600 mt-2">Esta acción no se puede deshacer.</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, calificar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);

      await calificarProyecto(
        projectId,
        "Proyecto calificado exitosamente",
        currentUserCode
      );

      toast.success("Proyecto calificado exitosamente");
      if (onCalificacionComplete) onCalificacionComplete();
      else if (onBack) onBack();

    } catch (error) {
      console.error("Error al calificar proyecto:", error);
      toast.error(error.message || "Error al calificar el proyecto");
    } finally {
      setSubmitting(false);
    }
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
            <FileText className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Calificar Proyecto</h2>
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

        <div className="space-y-3">
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
          <div>
            <span className="text-sm text-gray-500">Tipo de Alcance:</span>
            <p className="text-gray-900">{proyecto.Tipo_alcance?.nombre}</p>
          </div>
        </div>
      </div>

      {/* Entregables */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Entregables a Calificar ({entregables.length})
        </h3>

        {entregables.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron entregables para esta actividad
          </div>
        ) : (
          <div className="space-y-6">
            {entregables.map((entregable) => {
              const Icon = getEntregableIcon(entregable.tipo);
              const isPreviewing = previewing === entregable.id_entregable;
              const isSaving = savingFeedback === entregable.id_entregable;
              const isGuardado = calificaciones[entregable.id_entregable]?.guardado;

              return (
                <div
                  key={entregable.id_entregable}
                  className={`border rounded-xl p-5 transition-colors ${

                    isGuardado ? 'bg-green-50 border-green-200' : 'bg-zinc-100 border-zinc-300'
                    
                    }`}
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
                        {isGuardado && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            ✓ Retroalimentación guardada
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

                  {/* Formulario de calificación */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Calificación (0-5) <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={calificaciones[entregable.id_entregable]?.calificacion || ''}
                        onChange={(e) => handleCalificacionChange(
                          entregable.id_entregable,
                          'calificacion',
                          e.target.value
                        )}
                        disabled={isGuardado}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100"
                        placeholder="Ej: 4.5"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Observaciones (opcional)
                      </label>
                      <div className="flex gap-2">
                        <textarea
                          value={calificaciones[entregable.id_entregable]?.comentarios || ''}
                          onChange={(e) => handleCalificacionChange(
                            entregable.id_entregable,
                            'comentarios',
                            e.target.value
                          )}
                          disabled={isGuardado}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100"
                          placeholder="Comentarios sobre este entregable..."
                        />
                        {!isGuardado && (
                          <button
                            onClick={() => handleGuardarRetroalimentacion(entregable.id_entregable)}
                            disabled={isSaving}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                            title="Guardar retroalimentación"
                          >
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Save className="w-4 h-4" />
                                <span className="hidden sm:inline">Guardar</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botón enviar calificación final */}
      {entregables.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <button
            onClick={handleEnviarCalificacion}
            disabled={submitting || !todosRetroalimentados()}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando calificación...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Calificar Proyecto Completo
              </>
            )}
          </button>

          {!todosRetroalimentados() && (
            <p className="text-center text-sm text-amber-600 mt-3 font-medium">
              ⚠️ Debes guardar la retroalimentación de todos los entregables antes de calificar el proyecto
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CalificarProyecto;