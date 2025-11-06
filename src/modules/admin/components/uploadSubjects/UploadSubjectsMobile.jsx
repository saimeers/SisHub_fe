import React from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";

const UploadSubjectsMobile = ({ 
  subjects, 
  newSubject, 
  editingIndex, 
  editingSubject,
  onInputChange,
  onEditInputChange,
  onAddSubject,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDeleteSubject
}) => {
  return (
    <div className="md:hidden space-y-4">
      {/* Add New Subject Card */}
      <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-3">Agregar nueva materia</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Código</label>
            <input
              type="text"
              name="codigo"
              value={newSubject.codigo}
              onChange={onInputChange}
              placeholder="Código"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={newSubject.nombre}
              onChange={onInputChange}
              placeholder="Nombre"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Semestre</label>
              <input
                type="text"
                name="semestre"
                value={newSubject.semestre}
                onChange={onInputChange}
                placeholder="Semestre"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Créditos</label>
              <input
                type="text"
                name="creditos"
                value={newSubject.creditos}
                onChange={onInputChange}
                placeholder="Créditos"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
              <select
                name="tipo"
                value={newSubject.tipo}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="Obligatoria">Obligatoria</option>
                <option value="Electiva">Electiva</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ID Área</label>
              <input
                type="text"
                name="id_area"
                value={newSubject.id_area}
                onChange={onInputChange}
                placeholder="ID Área"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={onAddSubject}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Añadir Materia
          </button>
        </div>
      </div>

      {/* Existing Subjects */}
      {subjects.map((subject, index) => (
        <div key={subject.id} className="bg-white border border-gray-200 rounded-lg p-4">
          {editingIndex === index ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Código</label>
                <input
                  type="text"
                  value={editingSubject.codigo}
                  onChange={(e) => onEditInputChange(e, 'codigo')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={editingSubject.nombre}
                  onChange={(e) => onEditInputChange(e, 'nombre')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Semestre</label>
                  <input
                    type="text"
                    value={editingSubject.semestre}
                    onChange={(e) => onEditInputChange(e, 'semestre')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Créditos</label>
                  <input
                    type="text"
                    value={editingSubject.creditos}
                    onChange={(e) => onEditInputChange(e, 'creditos')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={editingSubject.tipo}
                    onChange={(e) => onEditInputChange(e, 'tipo')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="Obligatoria">Obligatoria</option>
                    <option value="Electiva">Electiva</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ID Área</label>
                  <input
                    type="text"
                    value={editingSubject.id_area}
                    onChange={(e) => onEditInputChange(e, 'id_area')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => onSaveEdit(index)}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Guardar
                </button>
                <button
                  onClick={onCancelEdit}
                  className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{subject.nombre}</h3>
                  <p className="text-sm text-gray-600">Código: {subject.codigo}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onStartEdit(index)}
                    className="p-2 bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteSubject(index)}
                    className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Semestre:</span>
                  <span className="ml-1 text-gray-900">{subject.semestre}</span>
                </div>
                <div>
                  <span className="text-gray-500">Créditos:</span>
                  <span className="ml-1 text-gray-900">{subject.creditos}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tipo:</span>
                  <span className="ml-1 text-gray-900">{subject.tipo}</span>
                </div>
                <div>
                  <span className="text-gray-500">ID Área:</span>
                  <span className="ml-1 text-gray-900">{subject.id_area}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {subjects.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No hay materias agregadas. Añade una manualmente o importa desde CSV
        </div>
      )}
    </div>
  );
};

export default UploadSubjectsMobile;


