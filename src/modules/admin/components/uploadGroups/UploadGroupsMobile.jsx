import React from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";

const UploadGroupsMobile = ({
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
    <div className="md:hidden space-y-3">
      {/* Add New Group Card */}
      <div className="bg-white rounded-lg shadow p-4 space-y-3 border-2 border-cyan-200">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-cyan-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Añadir Grupo
        </h3>
        <input
          type="text"
          name="codigo_materia"
          value={newGroup.codigo_materia}
          onChange={onInputChange}
          placeholder="Código materia"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <input
          type="text"
          name="nombre_grupo"
          value={newGroup.nombre_grupo}
          onChange={onInputChange}
          placeholder="Nombre grupo"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            name="periodo"
            value={newGroup.periodo}
            onChange={onInputChange}
            placeholder="Periodo (01/02)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <input
            type="text"
            name="anio"
            value={newGroup.anio}
            onChange={onInputChange}
            placeholder="Año (2025)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
        <input
          type="text"
          name="codigo_docente"
          value={newGroup.codigo_docente}
          onChange={onInputChange}
          placeholder="Código docente"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <button
          onClick={onAddGroup}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Añadir Grupo
        </button>
      </div>

      {/* Existing Groups */}
      {groups.map((group, index) => (
        <div
          key={group.id}
          className="bg-white rounded-lg shadow p-4 space-y-3"
        >
          {editingIndex === index ? (
            <>
              <h3 className="font-semibold text-gray-900 mb-3">Editar Grupo</h3>
              <input
                type="text"
                value={editingGroup.codigo_materia}
                onChange={(e) => onEditInputChange(e, "codigo_materia")}
                placeholder="Código materia"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <input
                type="text"
                value={editingGroup.nombre_grupo}
                onChange={(e) => onEditInputChange(e, "nombre_grupo")}
                placeholder="Nombre grupo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editingGroup.periodo}
                  onChange={(e) => onEditInputChange(e, "periodo")}
                  placeholder="Periodo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={editingGroup.anio}
                  onChange={(e) => onEditInputChange(e, "anio")}
                  placeholder="Año"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <input
                type="text"
                value={editingGroup.codigo_docente}
                onChange={(e) => onEditInputChange(e, "codigo_docente")}
                placeholder="Código docente"
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
                  <h3 className="font-semibold text-gray-900 truncate">
                    {`${group.codigo_materia}-${group.nombre_grupo}-${group.periodo}-${group.anio}`}
                  </h3>
                  <p className="text-xs text-gray-500">Grupo</p>
                </div>
                <div className="flex gap-1 ml-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium whitespace-nowrap">
                    {group.periodo === "01" ? "I" : "II"} - {group.anio}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2">
                  <span className="text-gray-500 text-xs">Docente:</span>
                  <p className="font-medium text-gray-900">
                    {group.codigo_docente}
                  </p>
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
                  onClick={() => onDeleteGroup(index)}
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

      {groups.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="flex flex-col items-center justify-center text-gray-500">
            <svg
              className="w-16 h-16 mb-3 text-gray-400"
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
            <p className="font-medium text-base">No hay grupos agregados</p>
            <p className="text-sm mt-1">
              Añade uno manualmente o importa desde CSV
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadGroupsMobile;
