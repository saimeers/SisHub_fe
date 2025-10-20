import React from "react";
import { Upload } from "lucide-react";

const UploadStudentsHeader = ({ onFileUpload, isSubmitting }) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div>
          <p className="text-gray-600">Añade estudiantes manualmente o importa desde un archivo CSV</p>
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
            <Upload className="w-5 h-5" />
            Importar CSV
          </div>
        </label>
      </div>
      <p className="text-sm text-gray-500">Formato CSV: codigo_materia,nombre_grupo,periodo,anio,codigo,nombre,documento,correo,telefono</p>
      <p className="text-xs text-red-700 mt-1">* Los correos deben ser @ufps.edu.co</p>
      <p className="text-xs text-blue-700 mt-1">* Grupo formato: 1154306-B-02-2025</p>
    </div>
  );
};

export default UploadStudentsHeader;