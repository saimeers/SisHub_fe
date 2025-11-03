import React, { useState, useEffect } from 'react';
import { FileText, Send, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import EntregablesInvestigativo from './EntregablesInvestigativo';
import EntregablesDesarrollo from './EntregablesDesarrollo';
import {
  obtenerEntregablesProyecto,
  enviarProyectoARevision
} from '../../../services/EntregableService';

const ProyectoEnCurso = ({
  proyecto,
  equipo,
  actividad,
  esquemaInfo,
  currentUserCode,
  onBack
}) => {
  const [entregables, setEntregables] = useState([]);
  const [loadingEntregables, setLoadingEntregables] = useState(true);
  const [enviandoRevision, setEnviandoRevision] = useState(false);

  const tipoAlcance = actividad?.id_tipo_alcance;
  const esInvestigativo = tipoAlcance === 1;

  useEffect(() => {
    const loadEntregables = async () => {
      if (!proyecto?.id_proyecto || !actividad?.id_actividad) return;
      console.log(proyecto.id_proyecto, actividad.id_actividad);
      try {
        setLoadingEntregables(true);
        const data = await obtenerEntregablesProyecto(
          proyecto.id_proyecto,
          actividad.id_actividad
        );
        console.log('Entregables recibidos:', data);
        setEntregables(data);
      } catch (error) {
        console.error("Error al cargar entregables:", error);
        // No mostrar error si es la primera vez (sin entregables)
        if (error.response?.status !== 404) {
          toast.error("Error al cargar los entregables");
        }
        setEntregables([]);
      } finally {
        setLoadingEntregables(false);
      }
    };

    loadEntregables();
  }, [proyecto?.id_proyecto, actividad?.id_actividad]);

  const handleEntregableCreado = (nuevoEntregable) => {
    setEntregables(prev => {
      // Si ya existe un entregable del mismo tipo, reemplazarlo
      const existe = prev.findIndex(e => e.tipo === nuevoEntregable.tipo);
      if (existe !== -1) {
        const nuevos = [...prev];
        nuevos[existe] = nuevoEntregable;
        return nuevos;
      }
      return [...prev, nuevoEntregable];
    });
  };

  const handleEntregableActualizado = (entregableActualizado) => {
    setEntregables(prev => {
      return prev.map(e => 
        e.id_entregable === entregableActualizado.id_entregable 
          ? entregableActualizado 
          : e
      );
    });
  };

  const handleEnviarRevision = async () => {
    try {
      setEnviandoRevision(true);
      await enviarProyectoARevision(
        proyecto.id_proyecto,
        currentUserCode
      );
      toast.success("Proyecto enviado a revisión exitosamente");
      if (onBack) onBack();
    } catch (error) {
      toast.error(error.message || "Error al enviar a revisión");
    } finally {
      setEnviandoRevision(false);
    }
  };

  if (loadingEntregables) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <p className="ml-3 text-gray-600">Cargando entregables...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Gestión de Entregables
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
            <span className="text-gray-500">Actividad:</span>
            <p className="font-semibold text-gray-900">{actividad?.titulo}</p>
          </div>
          <div>
            <span className="text-gray-500">Tipo de Alcance:</span>
            <p className="font-semibold text-gray-900">
              {esInvestigativo ? 'Investigativo' : 'Desarrollo'}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Esquema:</span>
            <p className="font-semibold text-gray-900">{esquemaInfo?.id_esquema}</p>
          </div>
        </div>
      </div>

      {/* Componente específico según tipo de alcance */}
      {esInvestigativo ? (
        <EntregablesInvestigativo
          proyecto={proyecto}
          equipo={equipo}
          actividad={actividad}
          esquemaInfo={esquemaInfo}
          entregables={entregables}
          currentUserCode={currentUserCode}
          onEntregableCreado={handleEntregableCreado}
          onEntregableActualizado={handleEntregableActualizado}
        />
      ) : (
        <EntregablesDesarrollo
          proyecto={proyecto}
          equipo={equipo}
          actividad={actividad}
          esquemaInfo={esquemaInfo}
          entregables={entregables}
          currentUserCode={currentUserCode}
          onEntregableCreado={handleEntregableCreado}
        />
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <button
          onClick={handleEnviarRevision}
          disabled={enviandoRevision || entregables.length === 0}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          {enviandoRevision ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Enviar a Revisión
            </>
          )}
        </button>

        {entregables.length === 0 && (
          <p className="text-center text-sm text-gray-500 mt-3">
            Debes subir al menos un entregable antes de enviar a revisión
          </p>
        )}
      </div>
    </div>
  );
};

export default ProyectoEnCurso;