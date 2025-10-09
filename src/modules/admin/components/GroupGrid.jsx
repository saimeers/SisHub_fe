import React from "react";
import GroupCard from "./GroupCard";

const GroupGrid = ({ groups = [], onQRCode }) => {
  if (!groups.length) {
    return (
      <div className="text-center text-gray-500 py-16">
        No hay grupos registrados.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group, index) => (
        <GroupCard
          key={group.id_grupo ?? index}
          group={group}
          index={index}
          onQRCode={onQRCode} 
        />
      ))}
    </div>
  );
};

export default GroupGrid;
