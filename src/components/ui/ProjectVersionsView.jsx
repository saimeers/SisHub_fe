import React, { useEffect, useState } from "react";
import { verDetallesProyecto } from "../../services/projectServices";
import { historicoEntregables } from "../../services/EntregableService";
import { Loader2, FileText, Video, Music, Image, Code, Calendar, User } from "lucide-react";
import { toast } from "react-toastify";

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
  console.log("El id que llega a versiones es:",projectId);
  const [proyecto, setProyecto] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        // Obtener historial de entregables
        const historialData = await historicoEntregables(projectId);
        if (!mounted) return;
        
        // Ordenar por fecha descendente (más reciente primero)
        const historialOrdenado = (Array.isArray(historialData) ? historialData : [])
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        setHistorial(historialOrdenado);
      } catch (e) {
        if (!mounted) return;
        console.error("Error al cargar versiones:", e);
        setError("Error al cargar las versiones del proyecto");
        toast.error("Error al cargar el historial de entregables");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (projectId) load();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  const getEntregableIcon = (tipo) => {
    switch(tipo) {
      case 'VIDEO': return Video;
      case 'AUDIO': return Music;
      case 'IMAGEN': return Image;
      case 'REPOSITORIO': return Code;
      case 'DOCUMENTO': return FileText;
      default: return FileText;
    }
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return 'Fecha no disponible';
    
    try {
      const fecha = new Date(fechaString);
      if (isNaN(fecha.getTime())) return fechaString;

      return fecha.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return fechaString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mr-3" />
        <span className="text-gray-500">Cargando versiones...</span>
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
          <h2 className="text-2xl font-bold text-gray-900">Historial de Entregables</h2>
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
        {historial.length === 0 ? (
          <div className="py-16 text-center text-gray-600 bg-gray-50 rounded-2xl">
            No hay historial de entregables registrado.
          </div>
        ) : (
          historial.map((version, index) => {
            const entregable = version.entregable;
            if (!entregable) return null;

            const Icon = getEntregableIcon(entregable.tipo);
            const versionNumber = historial.length - index;

            return (
              <div 
                key={version.id_historial_entregable || index} 
                className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full font-bold text-sm">
                        {versionNumber}
                      </div>
                      <Icon className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {entregable.nombre_archivo || `Entregable ${entregable.tipo}`}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        {entregable.tipo}
                      </span>
                      
                      {entregable.Estado?.descripcion && (
                        <StatusBadge status={entregable.Estado.descripcion} />
                      )}

                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatearFecha(version.fecha)}</span>
                      </div>

                      {version.codigo_usuario && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <User className="w-4 h-4" />
                          <span>{version.codigo_usuario}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Observación del historial */}
                {version.observacion && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">Observación: </span>
                      {version.observacion}
                    </p>
                  </div>
                )}

                {/* Calificación y comentarios del entregable (si existe) */}
                {(entregable.calificacion !== null || entregable.comentarios) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {entregable.calificacion !== null && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Calificación
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-green-600">
                              {entregable.calificacion}
                            </span>
                            <span className="text-sm text-gray-500">/ 5.0</span>
                          </div>
                        </div>
                      )}

                      {entregable.comentarios && (
                        <div className={`rounded-lg p-3 bg-blue-50 ${entregable.calificacion !== null ? 'md:col-span-2' : 'md:col-span-3'}`}>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Retroalimentación del Profesor
                          </label>
                          <p className="text-sm text-gray-700">
                            {entregable.comentarios}
                          </p>
                        </div>
                      )}
                    </div>
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

export default ProjectVersionsView;