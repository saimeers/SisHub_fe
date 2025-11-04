import React from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";
import SelectField from "../../../../components/ui/SelectField";
import "./UploadSubjectsTableForm.css";

const UploadSubjectsTableForm = ({
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
  onDeleteSubject,
  prerequisiteOptions = [],
  onPrerequisitesChange,
  onEditPrerequisitesChange,
  selectedPrerequisites = [],
  editingPrerequisites = []
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-visible relative z-10">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200 text-xs">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-20">Código</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-48">Nombre</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-20">Semestre</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-20">Créditos</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-80">Prerrequisitos</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-32">Tipo</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-20">ID Área</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-24">Acciones</th>
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
                placeholder="Nombre completo"
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
              <div className="min-w-80">
                <SelectField
                  value={selectedPrerequisites}
                  onChange={onPrerequisitesChange}
                  options={prerequisiteOptions}
                  placeholder="Seleccionar prerrequisitos"
                  isMulti={true}
                  isClearable={true}
                  className="text-sm prerequisite-dropdown"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '60px',
                      maxHeight: '120px',
                      overflow: 'auto'
                    }),
                    valueContainer: (provided) => ({
                      ...provided,
                      maxHeight: '100px',
                      overflow: 'auto',
                      flexWrap: 'nowrap'
                    }),
                    multiValue: (provided) => ({
                      ...provided,
                      margin: '2px',
                      maxWidth: '200px'
                    }),
                    multiValueLabel: (provided) => ({
                      ...provided,
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }),
                    menu: (provided) => ({
                      ...provided,
                      maxHeight: '500px',
                      zIndex: 99999,
                      position: 'fixed',
                      top: 'auto',
                      left: 'auto',
                      right: 'auto',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }),
                    menuList: (provided) => ({
                      ...provided,
                      maxHeight: '480px',
                      padding: '4px',
                      overflowY: 'auto',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#cbd5e0 #f7fafc',
                      '&::-webkit-scrollbar': {
                        width: '8px'
                      },
                      '&::-webkit-scrollbar-track': {
                        background: '#f7fafc',
                        borderRadius: '4px'
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#cbd5e0',
                        borderRadius: '4px'
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: '#a0aec0'
                      }
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      padding: '8px 12px',
                      fontSize: '14px',
                      backgroundColor: state.isSelected
                        ? '#0ea5e9'
                        : state.isFocused
                          ? '#e0f2fe'
                          : 'white',
                      color: state.isSelected ? 'white' : '#374151',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: state.isSelected ? '#0284c7' : '#f0f9ff'
                      }
                    }),
                    noOptionsMessage: (provided) => ({
                      ...provided,
                      padding: '12px',
                      textAlign: 'center',
                      color: '#6b7280',
                      fontSize: '14px'
                    })
                  }}
                />
              </div>
            </td>
            <td className="px-4 py-3">
              <select
                name="tipo"
                value={newSubject.tipo}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Seleccionar tipo</option>
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
            <tr key={subject.id || `subject-${index}`} className="hover:bg-gray-50 transition-colors">
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
                    <div className="min-w-80">
                      <SelectField
                        value={editingPrerequisites}
                        onChange={onEditPrerequisitesChange}
                        options={prerequisiteOptions}
                        placeholder="Seleccionar prerrequisitos"
                        isMulti={true}
                        isClearable={true}
                        className="text-sm prerequisite-dropdown"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            minHeight: '60px',
                            maxHeight: '120px',
                            overflow: 'auto'
                          }),
                          valueContainer: (provided) => ({
                            ...provided,
                            maxHeight: '100px',
                            overflow: 'auto',
                            flexWrap: 'nowrap'
                          }),
                          multiValue: (provided) => ({
                            ...provided,
                            margin: '2px',
                            maxWidth: '200px'
                          }),
                          multiValueLabel: (provided) => ({
                            ...provided,
                            fontSize: '12px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }),
                          menu: (provided) => ({
                            ...provided,
                            maxHeight: '500px',
                            zIndex: 99999,
                            position: 'fixed',
                            top: 'auto',
                            left: 'auto',
                            right: 'auto',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }),
                          menuList: (provided) => ({
                            ...provided,
                            maxHeight: '480px',
                            padding: '4px',
                            overflowY: 'auto',
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#cbd5e0 #f7fafc',
                            '&::-webkit-scrollbar': {
                              width: '8px'
                            },
                            '&::-webkit-scrollbar-track': {
                              background: '#f7fafc',
                              borderRadius: '4px'
                            },
                            '&::-webkit-scrollbar-thumb': {
                              background: '#cbd5e0',
                              borderRadius: '4px'
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                              background: '#a0aec0'
                            }
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            padding: '8px 12px',
                            fontSize: '14px',
                            backgroundColor: state.isSelected
                              ? '#0ea5e9'
                              : state.isFocused
                                ? '#e0f2fe'
                                : 'white',
                            color: state.isSelected ? 'white' : '#374151',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: state.isSelected ? '#0284c7' : '#f0f9ff'
                            }
                          }),
                          noOptionsMessage: (provided) => ({
                            ...provided,
                            padding: '12px',
                            textAlign: 'center',
                            color: '#6b7280',
                            fontSize: '14px'
                          })
                        }}
                      />
                    </div>
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
                  <td className="px-4 py-3 text-gray-700">
                    <div className="max-w-80 break-words">
                      {subject.prerrequisitos ? (
                        <div className="flex flex-wrap gap-1">
                          {subject.prerrequisitos.split(',').map((prereq, index) => (
                            <span
                              key={index}
                              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {prereq.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Ninguno</span>
                      )}
                    </div>
                  </td>
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
              <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                No hay materias agregadas. Añade una manualmente o importa desde CSV
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UploadSubjectsTableForm;
