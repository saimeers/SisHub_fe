import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle, Star, MessageSquare, 
  ExternalLink, Download, Loader2 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { obtenerEntregablesProyecto } from '../../../services/EntregableService';

const TIPO_CONFIG = {
  DOCUMENTO: { icon: FileText, label: 'Documento', color: 'blue' },
  VIDEO: { icon: FileText, label: 'Video', color: 'purple' },
  AUDIO: { icon: FileText, label: 'Audio', color: 'green' },
  IMAGEN: { icon: FileText, label: 'Imagen', color: 'pink' },
  REPOSITORIO: { icon: FileText, label: 'Repositorio Git', color: 'gray' }
};

const ProyectoCalificado = ({
  proyecto,
  actividad,
  currentUserCode,
  onBack
}) => {
  const [entregables, setEntregables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntregables = async () => {
      if (!proyecto?.id_proyecto || !actividad?.id_actividad) return;

      try {
        setLoading(true);
        const data = await obtenerEntregablesProyecto(
          proyecto.id_proyecto,
          actividad.id_actividad
        );
        
        // Filtrar solo los entregables que ya fueron calificados
        const entregablesCalificados = data.filter(e => 
          e.calificacion !== null && e.calificacion !== undefined
        );
        
        setEntregables(entregablesCalificados);
      } catch (error) {
        console.error("Error al cargar entregables:", error);
        toast.error("Error al cargar los entregables calificados");
        setEntregables([]);
      } finally {
        setLoading(false);
      }
    };

    loadEntregables();
  }, [proyecto?.id_proyecto, actividad?.id_actividad]);

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
        <p className="ml-3 text-gray-600">Cargando información...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Proyecto Calificado
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

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            <strong>¡Felicitaciones!</strong> Tu proyecto ha sido revisado y calificado. 
            Puedes ver las observaciones y calificaciones de cada entregable a continuación.
          </p>
        </div>
      </div>

      {/* Entregables calificados */}
      <div className="space-y-4">
        {entregables.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron entregables calificados</p>
          </div>
        ) : (
          entregables.map((entregable) => (
            <EntregableCalificadoCard
              key={entregable.id_entregable}
              entregable={entregable}
              onVisualizar={handleVisualizar}
            />
          ))
        )}
      </div>
    </div>
  );
};

const EntregableCalificadoCard = ({ entregable, onVisualizar }) => {
  const config = TIPO_CONFIG[entregable.tipo] || TIPO_CONFIG.DOCUMENTO;
  const Icon = config.icon;

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    pink: 'bg-pink-50 border-pink-200 text-pink-600',
    gray: 'bg-gray-50 border-gray-200 text-gray-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header del entregable */}
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

        {/* Calificación */}
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
          <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
          <span className="font-bold text-gray-900">
            {entregable.calificacion !== null && entregable.calificacion !== undefined 
              ? `${entregable.calificacion}/5` 
              : 'Sin calificar'}
          </span>
        </div>
      </div>

      {/* Comentarios del docente */}
      {entregable.comentarios && (
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Comentarios del Docente:
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {entregable.comentarios}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botón visualizar */}
      <button
        onClick={() => onVisualizar(entregable)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
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
    </div>
  );
};

export default ProyectoCalificado;