import React from "react";

const UploadSubjectsHeader = ({ onFileUpload, isSubmitting }) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div>
          <p className="text-gray-600">Añade materias manualmente o importa desde un archivo CSV</p>
        </div>
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".csv"
            onChange={onFileUpload}
            className="hidden"
            disabled={isSubmitting}
          />
          <div className={`bg-[#B70000] hover:bg-red-800 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Importar CSV
          </div>
        </label>
      </div>
      <p className="text-sm text-gray-500">Formato CSV: codigo,nombre,semestre,creditos,prerrequisitos,tipo,id_area</p>
      <p className="text-xs text-red-700 mt-1">* Los tipos válidos son: Obligatoria, Electiva</p>
    </div>
  );
};

export default UploadSubjectsHeader;
