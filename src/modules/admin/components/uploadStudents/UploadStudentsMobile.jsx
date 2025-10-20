import React from "react";
import { Users, BookOpen, Edit2, Trash2, Check, X, Loader2 } from "lucide-react";

const UploadStudentsMobile = ({
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
    <div className="md:hidden space-y-3">
      {/* Add New Student Card */}
      <div className="bg-white rounded-lg shadow p-4 space-y-3 border-2 border-cyan-200">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-600" />
          Añadir Estudiante
        </h3>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">Grupo</label>
          <select
            value={getGroupIdentifier(newStudent)}
            onChange={(e) => handleGroupChange(e, false)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Código</label>
          <div className="relative">
            <input
              type="text"
              name="codigo"
              value={newStudent.codigo}
              onChange={onInputChange}
              onBlur={(e) => onStudentCodeBlur(e.target.value, false)}
              placeholder="1552220"
              disabled={loadingStudent}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
            />
            {loadingStudent && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
              </div>
            )}
          </div>
        </div>

        <input
          type="text"
          name="nombre"
          value={newStudent.nombre}
          onChange={onInputChange}
          placeholder="Nombre completo"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <input
          type="text"
          name="documento"
          value={newStudent.documento}
          onChange={onInputChange}
          placeholder="Documento: 1092396996"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <input
          type="email"
          name="correo"
          value={newStudent.correo}
          onChange={onInputChange}
          placeholder="correo@ufps.edu.co"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <input
          type="text"
          name="telefono"
          value={newStudent.telefono}
          onChange={onInputChange}
          placeholder="Teléfono: 3001234567"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <button
          onClick={onAddStudent}
          disabled={loadingStudent}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir Estudiante
        </button>
      </div>

      {/* Existing Students */}
      {students.map((student, index) => (
        <div key={student.id} className="bg-white rounded-lg shadow p-4 space-y-3">
          {editingIndex === index ? (
            <>
              <h3 className="font-semibold text-gray-900 mb-3">Editar Estudiante</h3>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Grupo</label>
                <select
                  value={getGroupIdentifier(editingStudent)}
                  onChange={(e) => handleGroupChange(e, true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Código</label>
                <div className="relative">
                  <input
                    type="text"
                    value={editingStudent.codigo}
                    onChange={(e) => onEditInputChange(e, 'codigo')}
                    onBlur={(e) => onStudentCodeBlur(e.target.value, true)}
                    placeholder="Código"
                    disabled={loadingStudent}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  {loadingStudent && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                    </div>
                  )}
                </div>
              </div>

              <input
                type="text"
                value={editingStudent.nombre}
                onChange={(e) => onEditInputChange(e, 'nombre')}
                placeholder="Nombre"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <input
                type="text"
                value={editingStudent.documento}
                onChange={(e) => onEditInputChange(e, 'documento')}
                placeholder="Documento"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <input
                type="email"
                value={editingStudent.correo}
                onChange={(e) => onEditInputChange(e, 'correo')}
                placeholder="correo@ufps.edu.co"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <input
                type="text"
                value={editingStudent.telefono}
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
                  Guardar
                </button>
                <button
                  onClick={onCancelEdit}
                  className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors text-sm font-medium inline-flex items-center justify-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{student.nombre}</h3>
                  <p className="text-xs text-gray-500 truncate">{student.correo}</p>
                </div>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium whitespace-nowrap">
                  {student.codigo}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs bg-purple-50 p-2 rounded-md">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-700">
                  {student.codigo_materia}-{student.nombre_grupo}-{student.periodo}-{student.anio}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">Documento:</span>
                  <p className="font-medium text-gray-900">{student.documento}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Teléfono:</span>
                  <p className="font-medium text-gray-900">{student.telefono || "N/A"}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => onStartEdit(index)}
                  className="flex-1 px-3 py-2 bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors text-sm font-medium inline-flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => onDeleteStudent(index)}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium inline-flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {students.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p className="text-sm">No hay estudiantes agregados</p>
        </div>
      )}
    </div>
  );
};

export default UploadStudentsMobile;