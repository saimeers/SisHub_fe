import React from "react";
import QuantitySelector from "./QuantitySelector";

const UploadSubjectsControlsForm = ({ 
  itemsPerPage, 
  onItemsPerPageChange, 
  startIndex, 
  endIndex, 
  totalSubjects 
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Mostrar:</span>
        <QuantitySelector
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        />
        <span className="text-sm text-gray-600">registros</span>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-right">
        Mostrando {startIndex + 1}-{Math.min(endIndex, totalSubjects)} de {totalSubjects} materias
      </p>
    </div>
  );
};

export default UploadSubjectsControlsForm;

