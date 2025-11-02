import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Edit3, Calendar, User } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import {
  obtenerIdea,
  obtenerUltimoHistorial,
  moverIdeaAlBanco,
  actualizarIdea,
} from '../../../services/ideaServices';
import IdeaForm from '../../../components/ui/IdeaForm';

const SuggestionReview = ({ idIdea, groupParams, currentUserCode, onBack }) => {
  const [ideaData, setIdeaData] = useState(null);
  const [observationData, setObservationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCorrectForm, setShowCorrectForm] = useState(false);

  // ✅ Cargar idea completa y su historial
  useEffect(() => {
    const loadIdea = async () => {
      if (!idIdea) return;
      try {
        setLoading(true);

        const response = await obtenerIdea(idIdea);
        const fetchedIdea = response.data || response;
        console.log('Idea obtenida para revisión de sugerencias:', fetchedIdea);

        const normalizedIdea = {
          titulo: fetchedIdea.titulo || '',
          problematica: fetchedIdea.problema || '',
          justificacion: fetchedIdea.justificacion || '',
          objetivo_general: fetchedIdea.objetivo_general || '',
          objetivos_especificos: fetchedIdea.objetivos_especificos
            ? fetchedIdea.objetivos_especificos.split('\n')
            : [''],
          integrantes:
            fetchedIdea.equipo?.Integrantes?.map((i) => i.codigo) || [],
        };

        setIdeaData(normalizedIdea);

        const historial = await obtenerUltimoHistorial(idIdea);
        console.log(
          'Historial obtenido para revisión de sugerencias:',
          historial
        );

        // ✅ Mejor UX: extraer solo la parte útil del texto después de los dos puntos
        let textoLimpio = historial?.observacion || 'Sin observaciones';
        const partes = textoLimpio.split('Observaciones:');
        if (partes.length > 1) {
          textoLimpio = partes[1].trim();
        } else {
          textoLimpio = textoLimpio.replace(
            'Idea aprobada con observaciones. En espera de corrección del estudiante.',
            ''
          ).trim();
        }

        setObservationData({
          text: textoLimpio || 'Sin observaciones adicionales',
          date: historial?.fecha || 'Fecha no disponible',
          professor: historial?.Usuario?.nombre || 'Docente',
        });
      } catch (error) {
        console.error('Error al cargar datos de la idea o historial:', error);
        toast.error('Error al cargar la información de la idea');
      } finally {
        setLoading(false);
      }
    };

    loadIdea();
  }, [idIdea]);

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

  const handleSendToIdeaBank = async () => {
    const result = await Swal.fire({
      title: '¿Liberar proyecto al Banco de Ideas?',
      html: `
        <div style="text-align: center;">
          <p style="margin-bottom: 15px;">
            Tu proyecto será liberado al banco de ideas y <strong>otros estudiantes podrán verlo y utilizarlo</strong>.
          </p>
          <div style="background-color: #fef2f2; border-left: 3px solid #dc2626; padding: 12px; border-radius: 4px; margin-top: 15px;">
            <p style="color: #dc2626; font-weight: 600; margin: 0; font-size: 0.9em;">
              ⚠️ Esta acción no se puede deshacer
            </p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#eab308',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, liberar proyecto',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await moverIdeaAlBanco(idIdea, currentUserCode);
        toast.success('Proyecto liberado al banco de ideas correctamente');
        if (onBack) onBack();
      } catch (error) {
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          'Error al liberar proyecto';
        toast.error(errorMessage);
      }
    }
  };

  const handleSubmitCorrection = async (payload) => {
    try {
      const datosActualizacion = {
        codigo_usuario: currentUserCode,
        titulo: payload.titulo,
        problema: payload.problema,
        justificacion: payload.justificacion,
        objetivo_general: payload.objetivo_general || '',
        objetivos_especificos: Array.isArray(payload.objetivos_especificos)
          ? payload.objetivos_especificos.join('\n')
          : payload.objetivos_especificos || '',
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
              <strong>{observationData.professor}</strong> -{' '}
              {observationData.date}
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
              <h2 className="text-xl font-bold text-gray-900">Observación</h2>
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
              Idea aprobada con observaciones:
            </h3>
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {observationData?.text}
            </p>
          </div>
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Al enviarla al banco de ideas, tu idea será
              visible para otros estudiantes y podrá ser utilizada como
              referencia en futuros proyectos.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleCorrectObservations}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <Edit3 className="w-5 h-5" />
              Corregir observaciones
            </button>

            <button
              onClick={handleSendToIdeaBank}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <Send className="w-5 h-5" />
              Enviar al banco de ideas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionReview;