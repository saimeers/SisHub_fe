import React, { useState } from "react";

const RowItem = ({ columns, status, onStatusChange, editable = true, showStatus = true, onClick }) => {
  const [currentStatus, setCurrentStatus] = useState(status);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setCurrentStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  const handleClick = (e) => {
    console.log("RowItem clicked", { onClick, editable, showStatus });
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center bg-gray-100 p-3 sm:p-4 rounded-md mb-2 gap-3 sm:gap-4 cursor-pointer hover:bg-gray-200 transition-colors" onClick={handleClick}>
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

      {/* Selector/indicador de estado (opcional) */}
      {showStatus && (
        <div className="flex justify-end sm:justify-start">
          {editable ? (
            <div className="relative inline-block w-full sm:w-auto">
              <select
                value={currentStatus}
                onChange={handleStatusChange}
                onClick={(e) => e.stopPropagation()}
                className={`appearance-none pr-9 pl-3 sm:pl-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border-2 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-opacity-50 w-full sm:w-auto sm:min-w-[140px] shadow-sm ${
                  currentStatus === "Habilitado"
                    ? "bg-green-100 text-green-800 border-green-300 focus:ring-green-400 hover:bg-green-200"
                    : "bg-red-100 text-red-800 border-red-300 focus:ring-red-400 hover:bg-red-200"
                }`}
              >
                <option value="Habilitado" className="bg-green-50 text-green-800">
                  Habilitado
                </option>
                <option value="Deshabilitado" className="bg-red-50 text-red-800">
                  Deshabilitado
                </option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2 sm:right-3 flex items-center text-gray-600">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          ) : (
            <span
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold w-full sm:w-auto sm:min-w-[140px] text-center ${
                currentStatus === "Habilitado"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {currentStatus}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default RowItem;
