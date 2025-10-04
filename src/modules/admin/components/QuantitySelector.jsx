import React from "react";

const QuantitySelector = ({ value, onChange }) => {
  return (
    <div className="flex items-center space-x-1.5 md:space-x-2">
      <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">Mostrar:</span>
      <select
        value={value}
        onChange={onChange}
        className="p-1.5 md:p-2 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#C03030] cursor-pointer text-xs md:text-sm"
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
      <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">registros</span>
    </div>
  );
};

export default QuantitySelector;