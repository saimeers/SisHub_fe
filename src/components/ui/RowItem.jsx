import React, { useState } from "react";

const RowItem = ({ columns, status, onStatusChange, editable = true }) => {
  const [currentStatus, setCurrentStatus] = useState(status);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setCurrentStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center bg-gray-100 p-3 sm:p-4 rounded-md mb-2 gap-3 sm:gap-4">
      {/* Contenido de las columnas */}
      <div className="flex flex-col sm:flex-row sm:items-center flex-1 gap-2 sm:gap-4">
        {columns.map((col, index) => (
          <span 
            key={index} 
            className="text-gray-700 font-medium text-sm sm:text-base flex-1 break-words"
          >
            {col}
          </span>
        ))}
      </div>

      {/* Selector de estado */}
      <div className="flex justify-end sm:justify-start">
        {editable ? (
          <select
            value={currentStatus}
            onChange={handleStatusChange}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border-2 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-opacity-50 w-full sm:w-auto sm:min-w-[120px] ${
              currentStatus === "Habilitado"
                ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 focus:ring-green-400"
                : "bg-red-100 text-red-800 border-red-300 hover:bg-red-200 focus:ring-red-400"
            }`}
          >
            <option value="Habilitado" className="bg-green-50 text-green-800">
              Habilitado
            </option>
            <option value="Inhabilitado" className="bg-red-50 text-red-800">
              Inhabilitado
            </option>
          </select>
        ) : (
          <span
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold w-full sm:w-auto sm:min-w-[120px] text-center ${
              currentStatus === "Habilitado"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {currentStatus}
          </span>
        )}
      </div>
    </div>
  );
};

export default RowItem;
