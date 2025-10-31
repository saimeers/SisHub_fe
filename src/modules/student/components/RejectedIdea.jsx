import React, { useState } from 'react';
import { XCircle, User, Calendar, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const RejectedIdea = () => {
    const [rejectionData] = useState({
        justification: "Después de revisar tu propuesta, he determinado que no cumple con los criterios mínimos establecidos para el proyecto. El planteamiento del problema es demasiado general y no identifica una necesidad específica que pueda ser abordada de manera efectiva. Además, la solución propuesta carece de viabilidad técnica y no presenta un impacto significativo que justifique su desarrollo. Te recomiendo que explores otras ideas más alineadas con los objetivos del curso y que presenten un mayor potencial de innovación. Recuerda que puedes consultar el banco de ideas para inspirarte en proyectos exitosos anteriores.",
        date: "28 de Octubre, 2025",
        professor: "Dr. García Martínez"
    });

    const handleAcceptRejection = async () => {
        const result = await Swal.fire({
            title: "Aceptar",
            html: `
                <div style="text-align: center;">
                    <p style="margin-bottom: 15px;">Al aceptar, esta idea será <strong>deshabilitada permanentemente</strong> y no pasará al banco de ideas.</p>
                    <div style="background-color: #fef2f2; border-left: 3px solid #dc2626; padding: 12px; border-radius: 4px; margin-top: 15px;">
                        <p style="color: #dc2626; font-weight: 600; margin: 0; font-size: 0.9em;">
                            ⚠️ Deberás proponer una nueva idea de proyecto
                        </p>
                    </div>
                </div>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Sí, aceptar rechazo",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                // Aquí iría tu servicio para aceptar el rechazo y deshabilitar la idea
                // await aceptarRechazo(projectId);
                
                toast.success("Rechazo aceptado. Puedes crear una nueva propuesta de proyecto");
                
                // Opcional: redireccionar a la vista de creación de proyecto
                // navigate('/student/new-project');
            } catch (error) {
                const errorMessage = error.response?.data?.error || error.message || "Error al procesar el rechazo";
                const errorDetalle = error.response?.data?.detalle || "";
                
                Swal.fire({
                    title: "Error al aceptar rechazo",
                    html: `
                        <div style="text-align: left;">
                            <p style="color: #dc2626; font-weight: 600; margin-bottom: 10px;">
                                ${errorMessage}
                            </p>
                            ${errorDetalle ? `
                                <p style="font-size: 0.85em; color: #6b7280; padding: 10px; background-color: #fef2f2; border-left: 3px solid #dc2626; border-radius: 4px;">
                                    ${errorDetalle}
                                </p>
                            ` : ''}
                            <p style="font-size: 0.85em; color: #6b7280; margin-top: 15px;">
                                Por favor intenta de nuevo o contacta al soporte técnico.
                            </p>
                        </div>
                    `,
                    icon: "error",
                    confirmButtonColor: "#B70000",
                });
            }
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="p-6 bg-red-50 border-b border-red-200 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                        <XCircle className="w-8 h-8 text-red-600" />
                        <div>
                            <h2 className="text-xl font-bold text-red-900">
                                Rechazado
                            </h2>
                            <p className="text-sm text-red-700 mt-1">
                                Tu idea de proyecto no ha sido aprobada
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span><strong>Docente:</strong> {rejectionData.professor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span><strong>Fecha:</strong> {rejectionData.date}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Justificación
                    </h3>
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {rejectionData.justification}
                        </p>
                    </div>

                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Nota:</strong> Al aceptar este rechazo, tu idea será deshabilitada permanentemente y no pasará al banco de ideas. Deberás proponer una nueva idea de proyecto que cumpla con los requisitos establecidos.
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50">
                    <button
                        onClick={handleAcceptRejection}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        <CheckCircle className="w-5 h-5" />
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RejectedIdea;