import React from "react";

const PendingApplications = ({ applications, onAccept, onReject, onView }) => {
    if (applications.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 md:mt-8">
            <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rol Solicitado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {applications.map((app, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{app.nombre}</div>
                                    <div className="text-xs text-gray-500">{app.correo}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {app.rol}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                    <button
                                        onClick={() => onView && onView(app)}
                                        className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors font-medium"
                                    >
                                        Ver
                                    </button>
                                    <button
                                        onClick={() => onAccept(app)}
                                        className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors font-medium"
                                    >
                                        Aceptar
                                    </button>
                                    <button
                                        onClick={() => onReject(app)}
                                        className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors font-medium"
                                    >
                                        Rechazar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="md:hidden space-y-3">
                {applications.map((app, index) => (
                    <div key={index} className="bg-white rounded-lg shadow p-4 space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">{app.nombre}</h4>
                                <p className="text-xs text-gray-500 truncate">{app.correo}</p>
                            </div>
                        </div>
                        
                        <div>
                            <span className="text-gray-500 text-xs">Rol Solicitado:</span>
                            <p className="font-medium text-gray-900 text-sm">{app.rol}</p>
                        </div>

                        <div className="space-y-2 pt-2">
                            <button
                                onClick={() => onView && onView(app)}
                                className="w-full px-3 py-2 bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors text-sm font-medium"
                            >
                                Ver Detalles
                            </button>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => onAccept(app)}
                                    className="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm font-medium"
                                >
                                    Aceptar
                                </button>
                                <button
                                    onClick={() => onReject(app)}
                                    className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
                                >
                                    Rechazar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PendingApplications;