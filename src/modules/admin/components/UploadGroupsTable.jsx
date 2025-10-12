import React from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";

const UploadGroupsTable = ({
  groups,
  newGroup,
  editingIndex,
  editingGroup,
  onInputChange,
  onEditInputChange,
  onAddGroup,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDeleteGroup,
}) => {
  return (
    <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
      {/* Contenedor con scroll */}
      <div className="max-h-[400px] overflow-y-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Código Materia
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Nombre Grupo
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Periodo
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Año
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Código Docente
              </th>
              <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Nueva fila para agregar grupo - Sticky con fondo blanco */}
            <tr className="bg-white sticky top-[49px] z-10 border-b-2 border-gray-300">
              <td className="px-4 py-3 bg-white">
                <input
                  type="text"
                  name="codigo_materia"
                  value={newGroup.codigo_materia}
                  onChange={onInputChange}
                  placeholder="Código materia"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </td>
              <td className="px-4 py-3 bg-white">
                <input
                  type="text"
                  name="nombre_grupo"
                  value={newGroup.nombre_grupo}
                  onChange={onInputChange}
                  placeholder="Nombre grupo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </td>
              <td className="px-4 py-3 bg-white">
                <input
                  type="text"
                  name="periodo"
                  value={newGroup.periodo}
                  onChange={onInputChange}
                  placeholder="Periodo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </td>
              <td className="px-4 py-3 bg-white">
                <input
                  type="text"
                  name="anio"
                  value={newGroup.anio}
                  onChange={onInputChange}
                  placeholder="Año"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </td>
              <td className="px-4 py-3 bg-white">
                <input
                  type="text"
                  name="codigo_docente"
                  value={newGroup.codigo_docente}
                  onChange={onInputChange}
                  placeholder="Código docente"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </td>
              <td className="px-4 py-3 bg-white">
                <button
                  onClick={onAddGroup}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium"
                >
                  Añadir
                </button>
              </td>
            </tr>

            {/* Filas existentes */}
            {groups.map((group, index) => (
              <tr
                key={group.id || `group-${index}`}
                className="hover:bg-gray-50 transition-colors"
              >
                {editingIndex === index ? (
                  <>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editingGroup.codigo_materia}
                        onChange={(e) => onEditInputChange(e, "codigo_materia")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editingGroup.nombre_grupo}
                        onChange={(e) => onEditInputChange(e, "nombre_grupo")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editingGroup.periodo}
                        onChange={(e) => onEditInputChange(e, "periodo")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editingGroup.anio}
                        onChange={(e) => onEditInputChange(e, "anio")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editingGroup.codigo_docente}
                        onChange={(e) => onEditInputChange(e, "codigo_docente")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onSaveEdit(index)}
                          className="inline-flex items-center justify-center p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                          title="Guardar cambios"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={onCancelEdit}
                          className="inline-flex items-center justify-center p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {group.codigo_materia}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {group.nombre_grupo}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{group.periodo}</td>
                    <td className="px-4 py-3 text-gray-700">{group.anio}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {group.codigo_docente}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onStartEdit(index)}
                          className="inline-flex items-center justify-center p-2 bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteGroup(index)}
                          className="inline-flex items-center justify-center p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}

            {groups.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <svg
                      className="w-12 h-12 mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="font-medium">No hay grupos agregados</p>
                    <p className="text-sm mt-1">
                      Añade uno manualmente o importa desde CSV
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UploadGroupsTable;
