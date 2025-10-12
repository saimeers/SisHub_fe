import React from "react";
import GroupCard from "./GroupCard";

const GroupGrid = ({ groups, onQRCode, showQRButton = true, role = "admin" }) => {
  if (!groups || groups.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No se encontraron grupos
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
      {groups.map((group, index) => (
        <GroupCard
          key={`${group.codigo_materia}-${group.nombre_grupo}-${group.periodo}-${group.anio}-${index}`}
          group={group}
          index={index}
          onQRCode={onQRCode}
          showQRButton={showQRButton}
          role={role}
        />
      ))}
    </div>
  );
};

export default GroupGrid;
