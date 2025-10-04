import React from "react";

const UserTable = ({ users, onView, onToggleEstado }) => {
    return (
        <>
            <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                                    No se encontraron usuarios
                                </td>
                            </tr>
                        ) : (
                            users.map((user, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{user.nombre}</div>
                                        <div className="text-gray-500 text-xs">{user.correo}</div>
                                    </td>
                                    <td className="px-4 py-3">{user.documento}</td>
                                    <td className="px-4 py-3">{user.rol}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${user.estado === "HABILITADO"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {user.estado}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 space-x-2">
                                        <button
                                            onClick={() => onView(user)}
                                            className="px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors text-xs font-medium"
                                        >
                                            Ver
                                        </button>
                                        <button
                                            onClick={() => onToggleEstado(user)}
                                            className={`px-3 py-1.5 rounded-md transition-colors text-xs font-medium ${user.estado === "HABILITADO"
                                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                : "bg-green-100 text-green-700 hover:bg-green-200"
                                            }`}
                                        >
                                            {user.estado === "HABILITADO" ? "Deshabilitar" : "Habilitar"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="md:hidden space-y-3">
                {users.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                        No se encontraron usuarios
                    </div>
                ) : (
                    users.map((user, index) => (
                        <div key={index} className="bg-white rounded-lg shadow p-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{user.nombre}</h3>
                                    <p className="text-xs text-gray-500 truncate">{user.correo}</p>
                                </div>
                                <span
                                    className={`ml-2 px-2 py-1 inline-flex text-xs font-semibold rounded-full whitespace-nowrap ${user.estado === "HABILITADO"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    {user.estado}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-500 text-xs">Documento:</span>
                                    <p className="font-medium text-gray-900">{user.documento}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 text-xs">Rol:</span>
                                    <p className="font-medium text-gray-900">{user.rol}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => onView(user)}
                                    className="flex-1 px-3 py-2 bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors text-sm font-medium"
                                >
                                    Ver
                                </button>
                                <button
                                    onClick={() => onToggleEstado(user)}
                                    className={`flex-1 px-3 py-2 rounded-md transition-colors text-sm font-medium ${user.estado === "HABILITADO"
                                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                                        : "bg-green-100 text-green-700 hover:bg-green-200"
                                    }`}
                                >
                                    {user.estado === "HABILITADO" ? "Deshabilitar" : "Habilitar"}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

export default UserTable;