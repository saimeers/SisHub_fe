import React from "react";
import { Users, Edit2, Trash2, Check, X, Loader2 } from "lucide-react";

const UploadStudentsTable = ({ 
  students, 
  newStudent, 
  editingIndex, 
  editingStudent,
  onInputChange,
  onEditInputChange,
  onAddStudent,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDeleteStudent,
  onStudentCodeBlur,
  availableGroups,
  loadingStudent
}) => {
  // Manejar cambio de grupo (multiselect)
  const handleGroupChange = (e, isEditing = false) => {
    const selectedGroup = availableGroups.find(g => 
      `${g.codigo_materia}-${g.nombre_grupo}-${g.periodo}-${g.anio}` === e.target.value
    );

    if (selectedGroup) {
      const groupData = {
        codigo_materia: selectedGroup.codigo_materia,
        nombre_grupo: selectedGroup.nombre_grupo,
        periodo: selectedGroup.periodo,
        anio: selectedGroup.anio.toString(),
      };

      if (isEditing) {
        onEditInputChange({ target: { value: groupData } }, 'groupData');
      } else {
        // Actualizar múltiples campos a la vez para newStudent
        Object.keys(groupData).forEach(key => {
          onInputChange({ target: { name: key, value: groupData[key] } });
        });
      }
    }
  };

  // Generar identificador de grupo para el select
  const getGroupIdentifier = (student) => {
    return `${student.codigo_materia}-${student.nombre_grupo}-${student.periodo}-${student.anio}`;
  };

  return (
    <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200 text-xs">
          <tr>
            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase">Grupo</th>
            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase">Código</th>
            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase">Nombre</th>
            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase">Documento</th>
            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase">Correo</th>
            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase">Teléfono</th>
            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {/* Add New Student Row */}
          <tr className="bg-blue-50/50">
            <td className="px-3 py-3">
              <select
                value={getGroupIdentifier(newStudent)}
                onChange={(e) => handleGroupChange(e, false)}
                className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Seleccionar grupo</option>
                {availableGroups.map((group) => {
                  const identifier = `${group.codigo_materia}-${group.nombre_grupo}-${group.periodo}-${group.anio}`;
                  return (
                    <option key={identifier} value={identifier}>
                      {group.nombre_materia} - Grupo {group.nombre_grupo} ({group.periodo}/{group.anio})
                    </option>
                  );
                })}
              </select>
            </td>
            <td className="px-3 py-3">
              <div className="relative">
                <input
                  type="text"
                  name="codigo"
                  value={newStudent.codigo}
                  onChange={onInputChange}
                  onBlur={(e) => onStudentCodeBlur(e.target.value, false)}
                  placeholder="1552220"
                  disabled={loadingStudent}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
                />
                {loadingStudent && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                  </div>
                )}
              </div>
            </td>
            <td className="px-3 py-3">
              <input
                type="text"
                name="nombre"
                value={newStudent.nombre}
                onChange={onInputChange}
                placeholder="Nombre completo"
                className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </td>
            <td className="px-3 py-3">
              <input
                type="text"
                name="documento"
                value={newStudent.documento}
                onChange={onInputChange}
                placeholder="1092396996"
                className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </td>
            <td className="px-3 py-3">
              <input
                type="email"
                name="correo"
                value={newStudent.correo}
                onChange={onInputChange}
                placeholder="correo@ufps.edu.co"
                className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </td>
            <td className="px-3 py-3">
              <input
                type="text"
                name="telefono"
                value={newStudent.telefono}
                onChange={onInputChange}
                placeholder="3001234567"
                className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </td>
            <td className="px-3 py-3">
              <button
                onClick={onAddStudent}
                disabled={loadingStudent}
                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Añadir
              </button>
            </td>
          </tr>

          {/* Existing Students */}
          {students.map((student, index) => (
            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
              {editingIndex === index ? (
                <>
                  <td className="px-3 py-3">
                    <select
                      value={getGroupIdentifier(editingStudent)}
                      onChange={(e) => handleGroupChange(e, true)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar grupo</option>
                      {availableGroups.map((group) => {
                        const identifier = `${group.codigo_materia}-${group.nombre_grupo}-${group.periodo}-${group.anio}`;
                        return (
                          <option key={identifier} value={identifier}>
                            {group.nombre_materia} - Grupo {group.nombre_grupo} ({group.periodo}/{group.anio})
                          </option>
                        );
                      })}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={editingStudent.codigo}
                        onChange={(e) => onEditInputChange(e, 'codigo')}
                        onBlur={(e) => onStudentCodeBlur(e.target.value, true)}
                        disabled={loadingStudent}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
                      />
                      {loadingStudent && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={editingStudent.nombre}
                      onChange={(e) => onEditInputChange(e, 'nombre')}
                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={editingStudent.documento}
                      onChange={(e) => onEditInputChange(e, 'documento')}
                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="email"
                      value={editingStudent.correo}
                      onChange={(e) => onEditInputChange(e, 'correo')}
                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={editingStudent.telefono}
                      onChange={(e) => onEditInputChange(e, 'telefono')}
                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-3 py-3 space-x-2">
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
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {student.codigo_materia}-{student.nombre_grupo}-{student.periodo}-{student.anio}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-gray-900 font-medium">{student.codigo}</td>
                  <td className="px-3 py-3 text-gray-700">{student.nombre}</td>
                  <td className="px-3 py-3 text-gray-700">{student.documento}</td>
                  <td className="px-3 py-3 text-gray-700 text-xs">{student.correo}</td>
                  <td className="px-3 py-3 text-gray-700">{student.telefono || "N/A"}</td>
                  <td className="px-3 py-3 space-x-2">
                    <button
                      onClick={() => onStartEdit(index)}
                      className="px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors text-xs font-medium inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteStudent(index)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs font-medium inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}

          {students.length === 0 && (
            <tr>
              <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm">No hay estudiantes agregados</p>
                <p className="text-xs mt-1">Añade uno manualmente o importa desde CSV</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UploadStudentsTable;