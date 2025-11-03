import React, { useState, useEffect } from 'react';
import { 
  FileText, Star, MessageSquare, Send, 
  ExternalLink, Download, Loader2, CheckCircle 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { 
  obtenerEntregablesProyecto,
  retroalimentarEntregable 
} from '../../../services/EntregableService';
import { calificarProyecto } from '../../../services/proyectoServices';

const TIPO_CONFIG = {
  DOCUMENTO: { icon: FileText, label: 'Documento', color: 'blue' },
  VIDEO: { icon: FileText, label: 'Video', color: 'purple' },
  AUDIO: { icon: FileText, label: 'Audio', color: 'green' },
  IMAGEN: { icon: FileText, label: 'Imagen', color: 'pink' },
  REPOSITORIO: { icon: FileText, label: 'Repositorio Git', color: 'gray' }
};

const CalificarProyecto = ({
  proyecto,
  actividad,
  equipo,
  currentUserCode,
  onBack,
  onCalificacionCompleta
}) => {
  const [entregables, setEntregables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calificaciones, setCalificaciones] = useState({});
  const [comentarios, setComentarios] = useState({});
  const [guardando, setGuardando] = useState({});
  const [finalizando, setFinalizando] = useState(false);

  useEffect(() => {
    const loadEntregables = async () => {
      if (!proyecto?.id_proyecto || !actividad?.id_actividad) return;

      try {
        setLoading(true);
        const data = await obtenerEntregablesProyecto(
          proyecto.id_proyecto,
          actividad.id_actividad
        );
        setEntregables(data);

        // Inicializar estados con valores existentes
        const initialCalificaciones = {};
        const initialComentarios = {};
        
        data.forEach(e => {
          initialCalificaciones[e.id_entregable] = e.calificacion || '';
          initialComentarios[e.id_entregable] = e.comentarios || '';
        });

        setCalificaciones(initialCalificaciones);
        setComentarios(initialComentarios);
      } catch (error) {
        console.error("Error al cargar entregables:", error);
        toast.error("Error al cargar los entregables");
        setEntregables([]);
      } finally {
        setLoading(false);
      }
    };

    loadEntregables();
  }, [proyecto?.id_proyecto, actividad?.id_actividad]);

  const handleCalificacionChange = (id_entregable, value) => {
    // Validar que sea un número entre 0 y 5
    const num = parseFloat(value);
    if (value === '' || (num >= 0 && num <= 5)) {
      setCalificaciones(prev => ({
        ...prev,
        [id_entregable]: value
      }));
    }
  };

  const handleComentarioChange = (id_entregable, value) => {
    setComentarios(prev => ({
      ...prev,
      [id_entregable]: value
    }));
  };

  const handleGuardarRetroalimentacion = async (entregable) => {
    const calificacion = calificaciones[entregable.id_entregable];
    const comentario = comentarios[entregable.id_entregable];

    // Validación
    if (!calificacion || calificacion === '') {
      toast.warning('Debes asignar una calificación');
      return;
    }

    const num = parseFloat(calificacion);
    if (isNaN(num) || num < 0 || num > 5) {
      toast.error('La calificación debe estar entre 0 y 5');
      return;
    }

    try {
      setGuardando(prev => ({ ...prev, [entregable.id_entregable]: true }));
      
      await retroalimentarEntregable(
        entregable.id_entregable,
        comentario || 'Sin comentarios',
        num,
        currentUserCode
      );

      // Actualizar el entregable en el estado local
      setEntregables(prev => prev.map(e => 
        e.id_entregable === entregable.id_entregable
          ? { ...e, calificacion: num, comentarios: comentario }
          : e
      ));

      toast.success('Retroalimentación guardada exitosamente');
    } catch (error) {
      toast.error(error.message || 'Error al guardar retroalimentación');
    } finally {
      setGuardando(prev => ({ ...prev, [entregable.id_entregable]: false }));
    }
  };

  const handleFinalizarCalificacion = async () => {
    // Verificar que todos los entregables estén calificados
    const entregablesSinCalificar = entregables.filter(e => 
      !e.calificacion && e.calificacion !== 0
    );

    if (entregablesSinCalificar.length > 0) {
      toast.warning('Debes calificar todos los entregables antes de finalizar');
      return;
    }

    const result = await Swal.fire({
      title: '¿Finalizar calificación del proyecto?',
      html: `
        <div style="text-align: center;">
          <p style="margin-bottom: 15px;">
            Se marcará el proyecto como <strong>CALIFICADO</strong> y el estudiante 
            podrá ver todas las retroalimentaciones.
          </p>
          <div style="background-color: #dbeafe; border-left: 3px solid #3b82f6; padding: 12px; border-radius: 4px; margin-top: 15px;">
            <p style="color: #1e40af; font-weight: 600; margin: 0; font-size: 0.9em;">
              ℹ️ Esta acción no se puede deshacer
            </p>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, finalizar calificación',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setFinalizando(true);
        await calificarProyecto(
          proyecto.id_proyecto,
          'Proyecto calificado exitosamente',
          currentUserCode
        );
        toast.success('Proyecto calificado exitosamente');
        
        if (onCalificacionCompleta) {
          onCalificacionCompleta();
        } else if (onBack) {
          onBack();
        }
      } catch (error) {
        toast.error(error.message || 'Error al finalizar calificación');
      } finally {
        setFinalizando(false);
      }
    }
  };

  const handleVisualizar = (entregable) => {
    if (!entregable) return;

    // URLs externas
    if (entregable.url_repositorio) {
      window.open(entregable.url_repositorio, '_blank');
      return;
    }
    if (entregable.url_video) {
      window.open(entregable.url_video, '_blank');
      return;
    }
    if (entregable.url_audio) {
      window.open(entregable.url_audio, '_blank');
      return;
    }
    if (entregable.url_imagen) {
      window.open(entregable.url_imagen, '_blank');
      return;
    }

    // Archivos subidos
    const extension = entregable.nombre_archivo?.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf' || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      window.open(entregable.url_archivo, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = entregable.url_archivo;
      link.download = entregable.nombre_archivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.info('Descargando archivo...');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <p className="ml-3 text-gray-600">Cargando entregables...</p>
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
            <h2 className="text-xl font-bold text-gray-900">
              Calificar Proyecto
            </h2>
          </div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-full text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50"
            >
              ← Volver
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Proyecto:</span>
            <p className="font-semibold text-gray-900">
              {proyecto?.Idea?.titulo || 'Sin título'}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Equipo:</span>
            <p className="font-semibold text-gray-900">
              {equipo?.Integrante_Equipos?.length || 0} integrantes
            </p>
          </div>
          <div>
            <span className="text-gray-500">Actividad:</span>
            <p className="font-semibold text-gray-900">{actividad?.titulo}</p>
          </div>
        </div>
      </div>

      {/* Entregables para calificar */}
      <div className="space-y-4">
        {entregables.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron entregables</p>
          </div>
        ) : (
          entregables.map((entregable) => (
            <EntregableCalificarCard
              key={entregable.id_entregable}
              entregable={entregable}
              calificacion={calificaciones[entregable.id_entregable] || ''}
              comentario={comentarios[entregable.id_entregable] || ''}
              onCalificacionChange={handleCalificacionChange}
              onComentarioChange={handleComentarioChange}
              onGuardar={handleGuardarRetroalimentacion}
              onVisualizar={handleVisualizar}
              guardando={guardando[entregable.id_entregable] || false}
            />
          ))
        )}
      </div>

      {/* Botón finalizar calificación */}
      {entregables.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <button
            onClick={handleFinalizarCalificacion}
            disabled={finalizando}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            {finalizando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Finalizando...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Finalizar Calificación del Proyecto
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

const EntregableCalificarCard = ({
  entregable,
  calificacion,
  comentario,
  onCalificacionChange,
  onComentarioChange,
  onGuardar,
  onVisualizar,
  guardando
}) => {
  const config = TIPO_CONFIG[entregable.tipo] || TIPO_CONFIG.DOCUMENTO;
  const Icon = config.icon;

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    pink: 'bg-pink-50 border-pink-200 text-pink-600',
    gray: 'bg-gray-50 border-gray-200 text-gray-600',
  };

  const yaCalificado = entregable.calificacion !== null && entregable.calificacion !== undefined;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${colorClasses[config.color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{config.label}</h3>
            <p className="text-sm text-gray-500">{entregable.nombre_archivo}</p>
          </div>
        </div>

        {yaCalificado && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Calificado</span>
          </div>
        )}
      </div>

      {/* Botón visualizar */}
      <button
        onClick={() => onVisualizar(entregable)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors mb-4"
      >
        {entregable.tipo === 'REPOSITORIO' && entregable.url_repositorio ? (
          <>
            <ExternalLink className="w-5 h-5" />
            Ver Repositorio
          </>
        ) : entregable.tipo === 'REPOSITORIO' ? (
          <>
            <Download className="w-5 h-5" />
            Descargar ZIP
          </>
        ) : (
          <>
            <ExternalLink className="w-5 h-5" />
            Ver Entregable
          </>
        )}
      </button>

      {/* Formulario de calificación */}
      <div className="space-y-4">
        {/* Calificación */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Calificación (0.0 - 5.0) <span className="text-red-600">*</span>
          </label>
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={calificacion}
              onChange={(e) => onCalificacionChange(entregable.id_entregable, e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Ej: 4.5"
            />
          </div>
        </div>

        {/* Comentarios */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Comentarios
          </label>
          <textarea
            value={comentario}
            onChange={(e) => onComentarioChange(entregable.id_entregable, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
            rows="3"
            placeholder="Escribe comentarios sobre este entregable..."
          />
        </div>

        {/* Botón guardar retroalimentación */}
        <button
          onClick={() => onGuardar(entregable)}
          disabled={guardando}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {guardando ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Guardar Retroalimentación
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CalificarProyecto;