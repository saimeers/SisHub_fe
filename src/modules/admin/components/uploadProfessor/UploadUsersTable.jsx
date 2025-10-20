import React from "react";
import { Users, Edit2, Trash2, Check, X } from "lucide-react";

const UploadUsersTable = ({ 
  users, 
  newUser, 
  editingIndex, 
  editingUser,
  onInputChange,
  onEditInputChange,
  onAddUser,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDeleteUser
}) => {
  return (
    <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200 text-xs">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Código</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Documento</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Correo</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {/* Add New User Row */}
          <tr className="bg-blue-50/50">
            <td className="px-4 py-3">
              <input
                type="text"
                name="codigo"
                value={newUser.codigo}
                onChange={onInputChange}
                placeholder="Código"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </td>
            <td className="px-4 py-3">
              <input
                type="text"
                name="nombre"
                value={newUser.nombre}
                onChange={onInputChange}
                placeholder="Nombre completo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </td>
            <td className="px-4 py-3">
              <input
                type="text"
                name="documento"
                value={newUser.documento}
                onChange={onInputChange}
                placeholder="Documento"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </td>
            <td className="px-4 py-3">
              <input
                type="email"
                name="correo"
                value={newUser.correo}
                onChange={onInputChange}
                placeholder="correo@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </td>
            <td className="px-4 py-3">
              <input
                type="text"
                name="telefono"
                value={newUser.telefono}
                onChange={onInputChange}
                placeholder="Teléfono"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </td>
            <td className="px-4 py-3">
              <button
                onClick={onAddUser}
                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Añadir
              </button>
            </td>
          </tr>

          {/* Existing Users */}
          {users.map((user, index) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              {editingIndex === index ? (
                <>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editingUser.codigo}
                      onChange={(e) => onEditInputChange(e, 'codigo')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editingUser.nombre}
                      onChange={(e) => onEditInputChange(e, 'nombre')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editingUser.documento}
                      onChange={(e) => onEditInputChange(e, 'documento')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="email"
                      value={editingUser.correo}
                      onChange={(e) => onEditInputChange(e, 'correo')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editingUser.telefono}
                      onChange={(e) => onEditInputChange(e, 'telefono')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => onSaveEdit(index)}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-xs font-medium inline-flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={onCancelEdit}
                      className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors text-xs font-medium inline-flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-4 py-3 text-gray-900">{user.codigo}</td>
                  <td className="px-4 py-3 text-gray-700">{user.nombre}</td>
                  <td className="px-4 py-3 text-gray-700">{user.documento}</td>
                  <td className="px-4 py-3 text-gray-700">{user.correo}</td>
                  <td className="px-4 py-3 text-gray-700">{user.telefono || "N/A"}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => onStartEdit(index)}
                      className="px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors text-xs font-medium inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteUser(index)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs font-medium inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No hay docentes agregados.</p>
                <p>Añade uno manualmente o importa desde CSV</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UploadUsersTable;