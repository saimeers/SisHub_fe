import React from "react";
import QuantitySelector from "../QuantitySelector";

const UploadUsersControls = ({ 
  itemsPerPage, 
  onItemsPerPageChange, 
  startIndex, 
  endIndex, 
  totalUsers 
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
      <QuantitySelector
        value={itemsPerPage}
        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
      />
      <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-right">
        Mostrando {startIndex + 1}-{Math.min(endIndex, totalUsers)} de {totalUsers} docentes
      </p>
    </div>
  );
};

export default UploadUsersControls;