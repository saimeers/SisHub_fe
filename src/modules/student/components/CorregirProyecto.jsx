import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Edit3, Calendar, User, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import {
  obtenerIdea,
  actualizarIdea,
  rechazarObservacion
} from '../../../services/ideaServices';
import { obtenerUltimoHistorial } from '../../../services/proyectoServices';
import IdeaForm from '../../../components/ui/IdeaForm';

const CorregirProyecto = ({ 
  idIdea, 
  idProyecto, 
  groupParams, 
  currentUserCode, 
  onBack,
  esProyectoSeleccionado 
}) => {
  const [ideaData, setIdeaData] = useState(null);
  const [observationData, setObservationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCorrectForm, setShowCorrectForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!idIdea) {

        console.error("❌ CorregirProyecto: idIdea es null o undefined");
        toast.error("Error: No se proporcionó un ID de idea válido");
        if (onBack) onBack();
        return;
      }

      try {
        setLoading(true);

        // Cargar idea
        const response = await obtenerIdea(idIdea);
        const fetchedIdea = response.data || response;
        console.log('✅ Idea obtenida para corrección:', fetchedIdea);

        // Extraer códigos de integrantes
        let integrantesCodigos = [];
        
        if (fetchedIdea.equipo?.Integrante_Equipos) {
          integrantesCodigos = fetchedIdea.equipo.Integrante_Equipos
            .filter(i => !i.es_lider)
            .map(i => i.Usuario?.codigo || i.codigo)
            .filter(Boolean);
        } else if (fetchedIdea.integrantes) {
          integrantesCodigos = Array.isArray(fetchedIdea.integrantes) 
            ? fetchedIdea.integrantes 
            : [];
        }

        const normalizedIdea = {
          titulo: fetchedIdea.titulo || '',
          problematica: fetchedIdea.problema || '',
          justificacion: fetchedIdea.justificacion || '',
          objetivo_general: fetchedIdea.objetivo_general || '',
          objetivos_especificos: fetchedIdea.objetivos_especificos
            ? (typeof fetchedIdea.objetivos_especificos === 'string'
                ? fetchedIdea.objetivos_especificos.split('\n').filter(obj => obj.trim())
                : fetchedIdea.objetivos_especificos)
            : [''],
          integrantes: integrantesCodigos,
        };

        setIdeaData(normalizedIdea);

        // Cargar historial del proyecto
        try {
          const historial = await obtenerUltimoHistorial(idProyecto);
          console.log('📝 Historial del proyecto:', historial);

          if (historial && historial.length > 0) {
            const ultimoHistorial = historial[0];
            setObservationData({
              text: ultimoHistorial.observacion || 'Sin observaciones',
              date: new Date(ultimoHistorial.fecha).toLocaleDateString('es-ES'),
              professor: ultimoHistorial.Usuario?.nombre || 'Docente',
            });
          } else {
            setObservationData({
              text: 'Sin observaciones registradas',
              date: new Date().toLocaleDateString('es-ES'),
              professor: 'Docente',
            });
          }
        } catch (historialError) {
          console.warn('⚠️ Error al cargar historial:', historialError);
          setObservationData({
            text: 'Error al cargar observaciones',
            date: new Date().toLocaleDateString('es-ES'),
            professor: 'Docente',
          });
        }

      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        toast.error('Error al cargar la información');
        if (onBack) onBack();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [idIdea, idProyecto, onBack]);

  const handleCorrectObservations = async () => {
    const result = await Swal.fire({
      title: '¿Corregir proyecto?',
      html: `
        <div style="text-align: center;">
          <p style="margin-bottom: 15px;">Podrás realizar las correcciones solicitadas por el docente y volver a enviar tu proyecto.</p>
          <p style="font-size: 0.9em; color: #6b7280;">
            Las observaciones permanecerán visibles mientras realizas los ajustes.
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, iniciar correcciones',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      setShowCorrectForm(true);
    }
  };

  const handleRechazarObservacion = async () => {
    const titulo = esProyectoSeleccionado 
      ? '¿Rechazar correcciones y liberar al banco de propuestas?'
      : '¿Rechazar correcciones?';
      
    const texto = esProyectoSeleccionado
      ? 'El proyecto será liberado al banco de propuestas para que otros estudiantes puedan adoptarlo.'
      : 'El proyecto será descartado. Deberás elegir una nueva idea o propuesta.';

    const result = await Swal.fire({
      title: titulo,
      html: `
        <div style="text-align: center;">
          <p style="margin-bottom: 15px;">${texto}</p>
          <div style="background-color: #fef2f2; border-left: 3px solid #dc2626; padding: 12px; border-radius: 4px; margin-top: 15px;">
            <p style="color: #dc2626; font-weight: 600; margin: 0; font-size: 0.9em;">
              ⚠️ Esta acción no se puede deshacer
            </p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        console.log("Al rechazar:",idIdea, currentUserCode, idProyecto);
        await rechazarObservacion(idIdea, idProyecto, currentUserCode);
        toast.success(
          esProyectoSeleccionado 
            ? 'Proyecto liberado al banco de propuestas'
            : 'Correcciones rechazadas. Deberás elegir una nueva idea'
        );
        if (onBack) onBack();
      } catch (error) {
        toast.error(error.message || 'Error al procesar la solicitud');
      }
    }
  };

  const handleSubmitCorrection = async (payload) => {
    try {
      const datosActualizacion = {
        codigo_usuario: currentUserCode,
        titulo: payload.titulo,
        problema: payload.problematica,
        justificacion: payload.justificacion,
        objetivo_general: payload.objetivo_general || '',
        objetivos_especificos: Array.isArray(payload.objetivos_especificos)
          ? payload.objetivos_especificos.join('\n')
          : payload.objetivos_especificos || '',
        integrantes: payload.integrantes || [],
      };

      await actualizarIdea(idIdea, datosActualizacion);
      toast.success('Correcciones enviadas exitosamente');
      if (onBack) onBack();
    } catch (error) {
      toast.error(error.message || 'Error al enviar las correcciones');
    }
  };

  if (loading || !ideaData) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Cargando información...</p>
      </div>
    );
  }

  if (showCorrectForm) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={() => setShowCorrectForm(false)}
            className="px-4 py-2 rounded-full text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50"
          >
            ← Ver Observaciones
          </button>
        </div>

        {observationData && (
          <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4">
            <h3 className="font-semibold text-amber-900 mb-2">
              Observaciones del Docente
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              <strong>{observationData.professor}</strong> - {observationData.date}
            </p>
            <p className="text-gray-800 text-sm whitespace-pre-wrap">
              {observationData.text}
            </p>
          </div>
        )}

        <IdeaForm
          groupParams={groupParams}
          initialData={ideaData}
          readOnly={false}
          defaultSelectedMembers={[]}
          onSubmit={handleSubmitCorrection}
          currentUserCode={currentUserCode}
          showAdoptButton={false}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Correcciones Solicitadas
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

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>
                <strong>Docente:</strong> {observationData?.professor}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{observationData?.date}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-6">
            <h3 className="font-semibold text-amber-900 mb-2">
              Observaciones del proyecto:
            </h3>
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {observationData?.text}
            </p>
          </div>

          {esProyectoSeleccionado && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Este proyecto fue adoptado del banco de propuestas. 
                  Si decides no continuar con las correcciones, el proyecto volverá al banco 
                  para que otros estudiantes puedan adoptarlo.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleCorrectObservations}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <Edit3 className="w-5 h-5" />
              Corregir proyecto
            </button>

            <button
              onClick={handleRechazarObservacion}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <Send className="w-5 h-5" />
              {esProyectoSeleccionado ? 'Rechazar y liberar' : 'No continuar con proyecto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorregirProyecto;