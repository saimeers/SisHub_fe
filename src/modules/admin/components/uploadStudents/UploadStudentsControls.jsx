import React from "react";

const QuantitySelector = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="itemsPerPage" className="text-sm text-gray-700 whitespace-nowrap">
        Mostrar:
      </label>
      <select
        id="itemsPerPage"
        value={value}
        onChange={onChange}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
    </div>
  );
};

const UploadStudentsControls = ({ 
  itemsPerPage, 
  onItemsPerPageChange, 
  startIndex, 
  endIndex, 
  totalStudents 
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 bg-white p-4 rounded-lg shadow-sm">
      <QuantitySelector
        value={itemsPerPage}
        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
      />
      <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-right">
        Mostrando {startIndex + 1}-{Math.min(endIndex, totalStudents)} de {totalStudents} estudiantes
      </p>
    </div>
  );
};

export default UploadStudentsControls;