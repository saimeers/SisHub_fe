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
    <div className="flex items-center bg-gray-100 p-3 rounded-md mb-2">
      {columns.map((col, index) => (
        <span key={index} className="text-gray-700 font-medium flex-1">
          {col}
        </span>
      ))}

      {editable ? (
        <select
          value={currentStatus}
          onChange={handleStatusChange}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-opacity-50 min-w-[120px] ${
            currentStatus === "Habilitado"
              ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 focus:ring-green-400"
              : "bg-red-100 text-red-800 border-red-300 hover:bg-red-200 focus:ring-red-400"
          }`}
        >
          <option value="Habilitado" className="bg-green-50 text-green-800">Habilitado</option>
          <option value="Inhabilitado" className="bg-red-50 text-red-800">Inhabilitado</option>
        </select>
      ) : (
        <span
          className={`px-4 py-2 rounded-lg text-sm font-semibold min-w-[120px] text-center ${
            currentStatus === "Habilitado"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {currentStatus}
        </span>
      )}
    </div>
  );
};

export default RowItem;
