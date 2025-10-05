import React from "react";
import SubjectCard from "./SubjectCard";

const SubjectGrid = ({ subjects = [], onDetails, showSettings = true }) => {
  if (!subjects.length) {
    return (
      <div className="text-center text-gray-500 py-16">
        No hay materias registradas.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {subjects.map((subject, idx) => (
        <SubjectCard
          key={subject.id_materia ?? idx}
          subject={subject}
          index={idx}
          onDetails={onDetails}
          showSettings={showSettings}
        />
      ))}
    </div>
  );
};

export default SubjectGrid;


