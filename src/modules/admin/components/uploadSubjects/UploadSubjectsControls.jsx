import React from "react";
import QuantitySelector from "../QuantitySelector";

const UploadSubjectsControls = ({ 
  itemsPerPage, 
  onItemsPerPageChange, 
  startIndex, 
  endIndex, 
  totalSubjects 
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
      <QuantitySelector
        value={itemsPerPage}
        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
      />
      <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-right">
        Mostrando {startIndex + 1}-{Math.min(endIndex, totalSubjects)} de {totalSubjects} materias
      </p>
    </div>
  );
};

export default UploadSubjectsControls;


