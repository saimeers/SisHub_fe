import React from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";

const UploadSubjectsTable = ({ 
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
    <div className="hidden md:block bg-white rounded-lg shadow overflow-visible">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200 text-xs">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Código</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Semestre</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Créditos</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">ID Área</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {/* Add New Subject Row */}
          <tr className="bg-blue-50/50">
            <td className="px-4 py-3">
              <input
                type="text"
                name="codigo"
                value={newSubject.codigo}
                onChange={onInputChange}
                placeholder="Código"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </td>
            <td className="px-4 py-3">
              <input
                type="text"
                name="nombre"
                value={newSubject.nombre}
                onChange={onInputChange}
                placeholder="Nombre"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </td>
            <td className="px-4 py-3">
              <input
                type="text"
                name="semestre"
                value={newSubject.semestre}
                onChange={onInputChange}
                placeholder="Semestre"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </td>
            <td className="px-4 py-3">
              <input
                type="text"
                name="creditos"
                value={newSubject.creditos}
                onChange={onInputChange}
                placeholder="Créditos"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </td>
            <td className="px-4 py-3">
              <select
                name="tipo"
                value={newSubject.tipo}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="Obligatoria">Obligatoria</option>
                <option value="Electiva">Electiva</option>
              </select>
            </td>
            <td className="px-4 py-3">
              <input
                type="text"
                name="id_area"
                value={newSubject.id_area}
                onChange={onInputChange}
                placeholder="ID Área"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </td>
            <td className="px-4 py-3">
              <button
                onClick={onAddSubject}
                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Añadir
              </button>
            </td>
          </tr>

          {/* Existing Subjects */}
          {subjects.map((subject, index) => (
            <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
              {editingIndex === index ? (
                <>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editingSubject.codigo}
                      onChange={(e) => onEditInputChange(e, 'codigo')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editingSubject.nombre}
                      onChange={(e) => onEditInputChange(e, 'nombre')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editingSubject.semestre}
                      onChange={(e) => onEditInputChange(e, 'semestre')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editingSubject.creditos}
                      onChange={(e) => onEditInputChange(e, 'creditos')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={editingSubject.tipo}
                      onChange={(e) => onEditInputChange(e, 'tipo')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="Obligatoria">Obligatoria</option>
                      <option value="Electiva">Electiva</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editingSubject.id_area}
                      onChange={(e) => onEditInputChange(e, 'id_area')}
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
                  <td className="px-4 py-3 text-gray-900">{subject.codigo}</td>
                  <td className="px-4 py-3 text-gray-700">{subject.nombre}</td>
                  <td className="px-4 py-3 text-gray-700">{subject.semestre}</td>
                  <td className="px-4 py-3 text-gray-700">{subject.creditos}</td>
                  <td className="px-4 py-3 text-gray-700">{subject.tipo}</td>
                  <td className="px-4 py-3 text-gray-700">{subject.id_area}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => onStartEdit(index)}
                      className="px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors text-xs font-medium inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteSubject(index)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs font-medium inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}

          {subjects.length === 0 && (
            <tr>
              <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                No hay materias agregadas. Añade una manualmente o importa desde CSV
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UploadSubjectsTable;


