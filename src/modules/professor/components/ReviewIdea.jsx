import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, User, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { obtenerIdea, revisarIdea } from '../../../services/ideaServices';

const fieldBase = "w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3";

const ReviewIdea = ({ idIdea, currentUserCode, onBack, onReviewComplete }) => {
  const [ideaData, setIdeaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [observacion, setObservacion] = useState('');
  const [selectedAction, setSelectedAction] = useState(null);

  useEffect(() => {
    const loadIdea = async () => {
      if (!idIdea) return;
      try {
        setLoading(true);
        const response = await obtenerIdea(idIdea);
        const fetchedIdea = response.data || response;
        setIdeaData(fetchedIdea);
      } catch (error) {
        console.error("Error al cargar la idea:", error);
        toast.error("Error al cargar la información de la idea");
        if (onBack) onBack();
      } finally {
        setLoading(false);
      }
    };
    loadIdea();
  }, [idIdea, onBack]);

  const submitReview = async (accion) => {
    try {
      setSubmitting(true);
      await revisarIdea(idIdea, accion, observacion.trim() || null, currentUserCode);

      let msg = "";
      if (accion === "Aprobar") msg = "Idea aprobada exitosamente";
      if (accion === "Aprobar_Con_Observacion") msg = "Idea aprobada con observaciones. El estudiante debe realizar correcciones";
      if (accion === "Rechazar") msg = "Idea rechazada y movida al banco de ideas";

      toast.success(msg);
      if (onReviewComplete) onReviewComplete();
      else if (onBack) onBack();
    } catch (error) {
      const msg = error.response?.data?.error || "Error al revisar la idea";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    const result = await Swal.fire({
      title: "¿Aprobar esta idea?",
      html: `<p>La idea será aprobada y el estudiante podrá continuar con el proyecto.</p>`,
      icon: "success",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Sí, aprobar"
    });
    if (result.isConfirmed) await submitReview("Aprobar");
  };

  const handleApproveWithObservations = async () => {
    if (!observacion.trim()) return toast.warning("Debes escribir las observaciones que el estudiante debe corregir");
    const result = await Swal.fire({
      title: "¿Aprobar con observaciones?",
      html: `<p>La idea será aprobada condicionalmente. El estudiante deberá corregir lo indicado.</p>`,
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
      title: "¿Rechazar esta idea?",
      html: `<p>La idea será rechazada y movida al banco de ideas. Esta acción no se puede deshacer.</p>`,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Sí, rechazar"
    });
    if (result.isConfirmed) await submitReview("Rechazar");
  };

  if (loading || !ideaData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-red-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p className="text-gray-500">Cargando información de la idea...</p>
        </div>
      </div>
    );
  }

  const objetivosArray = ideaData.objetivos_especificos
    ? (typeof ideaData.objetivos_especificos === 'string'
        ? ideaData.objetivos_especificos.split('\n').filter(obj => obj.trim())
        : ideaData.objetivos_especificos)
    : [];

  return (
    <div className="space-y-8">
      {/* === HEADER === */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Revisar Idea de Proyecto</h2>
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
            <span><strong>Estudiante:</strong> {ideaData.Usuario?.nombre || 'No disponible'}</span>
          </div>
          {ideaData.equipo && (
            <div className="flex items-center gap-2">
              <span><strong>Equipo:</strong> {ideaData.equipo.Integrante_Equipos?.length || 0} integrantes</span>
            </div>
          )}
        </div>
      </div>

      {/* === CONTENIDO === */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Columna izquierda */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Título</label>
            <div className={`${fieldBase} text-gray-900 font-medium`}>{ideaData.titulo}</div>
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">Problemática</label>
            <div className={`${fieldBase} min-h-[280px] text-gray-700 leading-relaxed whitespace-pre-wrap`}>
              {ideaData.problema}
            </div>
          </div>

          {ideaData.equipo?.Integrante_Equipos?.length > 0 && (
            <div>
              <label className="block text-gray-800 font-semibold mb-2">
                Integrantes ({ideaData.equipo.Integrante_Equipos.length})
              </label>
              <div className="bg-gray-50 rounded-xl border border-gray-300 p-4 space-y-2">
                {ideaData.equipo.Integrante_Equipos.map((i, idx) => (
                  <div key={idx} className="flex items-center gap-2 py-1">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    <span className="text-gray-700 flex-1">{i.Usuario?.nombre || 'Sin nombre'}</span>
                    {i.es_lider && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                        Líder
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha */}
        <div className="lg:col-span-3 space-y-8">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Justificación</label>
            <div className={`${fieldBase} min-h-[140px] text-gray-700 leading-relaxed whitespace-pre-wrap`}>
              {ideaData.justificacion}
            </div>
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">Objetivo General</label>
            <div className={`${fieldBase} text-gray-700 leading-relaxed whitespace-pre-wrap`}>
              {ideaData.objetivo_general}
            </div>
          </div>

          {objetivosArray.length > 0 && (
            <div>
              <label className="block text-gray-800 font-semibold mb-2">Objetivos Específicos</label>
              <div className="space-y-3">
                {objetivosArray.map((obj, idx) => (
                  <div key={idx} className={`${fieldBase} text-gray-700`}>
                    <span className="text-gray-500 font-medium mr-2">{idx + 1}.</span> {obj}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Observaciones {selectedAction === 'Aprobar_Con_Observacion' && <span className="text-red-600">*</span>}
            </label>
            <textarea
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Escribe observaciones sobre la idea..."
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>
      </div>

      {/* === BOTONES === */}
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
          <svg className="animate-spin h-5 w-5 text-red-600 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          Procesando revisión...
        </div>
      )}
    </div>
  );
};

export default ReviewIdea;
