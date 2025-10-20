import React from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";

const UploadUsersMobile = ({
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
    <div className="md:hidden space-y-3">
      {/* Add New User Card */}
      <div className="bg-white rounded-lg shadow p-4 space-y-3 border-2 border-cyan-200">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir Docente
        </h3>
        <input
          type="text"
          name="codigo"
          value={newUser.codigo}
          onChange={onInputChange}
          placeholder="Código"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <input
          type="text"
          name="nombre"
          value={newUser.nombre}
          onChange={onInputChange}
          placeholder="Nombre completo"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <input
          type="text"
          name="documento"
          value={newUser.documento}
          onChange={onInputChange}
          placeholder="Documento"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <input
          type="email"
          name="correo"
          value={newUser.correo}
          onChange={onInputChange}
          placeholder="correo@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <input
          type="text"
          name="telefono"
          value={newUser.telefono}
          onChange={onInputChange}
          placeholder="Teléfono"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <button
          onClick={onAddUser}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir Docente
        </button>
      </div>

      {/* Existing Users */}
      {users.map((user, index) => (
        <div key={user.id} className="bg-white rounded-lg shadow p-4 space-y-3">
          {editingIndex === index ? (
            <>
              <h3 className="font-semibold text-gray-900 mb-3">Editar Docente</h3>
              <input
                type="text"
                value={editingUser.codigo}
                onChange={(e) => onEditInputChange(e, 'codigo')}
                placeholder="Código"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <input
                type="text"
                value={editingUser.nombre}
                onChange={(e) => onEditInputChange(e, 'nombre')}
                placeholder="Nombre"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <input
                type="text"
                value={editingUser.documento}
                onChange={(e) => onEditInputChange(e, 'documento')}
                placeholder="Documento"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <input
                type="email"
                value={editingUser.correo}
                onChange={(e) => onEditInputChange(e, 'correo')}
                placeholder="correo@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <input
                type="text"
                value={editingUser.telefono}
                onChange={(e) => onEditInputChange(e, 'telefono')}
                placeholder="Teléfono"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => onSaveEdit(index)}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium inline-flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={onCancelEdit}
                  className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors text-sm font-medium inline-flex items-center justify-center gap-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{user.nombre}</h3>
                  <p className="text-xs text-gray-500 truncate">{user.correo}</p>
                </div>
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium whitespace-nowrap">
                  {user.codigo}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">Documento:</span>
                  <p className="font-medium text-gray-900">{user.documento}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Teléfono:</span>
                  <p className="font-medium text-gray-900">{user.telefono || "N/A"}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => onStartEdit(index)}
                  className="flex-1 px-3 py-2 bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors text-sm font-medium inline-flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteUser(index)}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium inline-flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {users.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No hay docentes agregados
        </div>
      )}
    </div>
  );
};

export default UploadUsersMobile;