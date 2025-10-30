import React, { useState } from 'react';
import { MessageSquare, Send, Edit3 } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const SuggestionReview = () => {
    const [observation] = useState(
        "El planteamiento del problema necesita ser más específico y detallado. Debes definir claramente qué problema vas a resolver, por qué es importante en el contexto actual, y cuáles serían los beneficiarios directos de tu solución. Además, la metodología propuesta requiere mayor profundidad en cuanto a las técnicas de recolección de datos que utilizarás. Considera agregar un cronograma de actividades más detallado y revisa las referencias bibliográficas para que cumplan correctamente con el formato APA. También sería recomendable incluir antecedentes más recientes sobre investigaciones similares en el área."
    );

    const handleCorrectObservations = async () => {
        const result = await Swal.fire({
            title: "¿Corregir proyecto?",
            html: `
                <div style="text-align: center;">
                    <p style="margin-bottom: 15px;">Podrás realizar las correcciones solicitadas por el docente y volver a enviar tu proyecto.</p>
                    <p style="font-size: 0.9em; color: #6b7280;">
                        Las observaciones permanecerán visibles mientras realizas los ajustes.
                    </p>
                </div>
            `,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Sí, iniciar correcciones",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                // Aquí iría tu servicio para marcar como en corrección
                // await iniciarCorreccion(projectId);
                
                toast.success("Puedes comenzar a corregir tu proyecto");
                
                // Opcional: redireccionar a la vista de edición
                // navigate('/student/edit-project');
            } catch (error) {
                const errorMessage = error.response?.data?.error || error.message || "Error al iniciar correcciones";
                
                Swal.fire({
                    title: "Error al iniciar correcciones",
                    html: `
                        <div style="text-align: left;">
                            <p style="color: #dc2626; font-weight: 600; margin-bottom: 10px;">
                                ${errorMessage}
                            </p>
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

    const handleSendToIdeaBank = async () => {
        const result = await Swal.fire({
            title: "¿Liberar proyecto al Banco de Ideas?",
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
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#eab308",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Sí, liberar proyecto",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                // Aquí iría tu servicio para liberar al banco de ideas
                // await liberarAlBancoDeIdeas(projectId);
                
                toast.success("Proyecto liberado al banco de ideas correctamente");
                
                // Opcional: redireccionar
                // navigate('/student/projects');
            } catch (error) {
                const errorMessage = error.response?.data?.error || error.message || "Error al liberar proyecto";
                const errorDetalle = error.response?.data?.detalle || "";
                
                Swal.fire({
                    title: "Error al liberar proyecto",
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
        <div className="w-full h-full">
            {/* Observations Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">
                        Observaciones
                    </h2>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 flex-1 overflow-y-auto mb-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {observation}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
                    <button
                        onClick={handleCorrectObservations}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
                    >
                        <Edit3 className="w-5 h-5" />
                        Corregir observaciones
                    </button>
                    
                    <button
                        onClick={handleSendToIdeaBank}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
                    >
                        <Send className="w-5 h-5" />
                        Enviar al banco de ideas
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuggestionReview;