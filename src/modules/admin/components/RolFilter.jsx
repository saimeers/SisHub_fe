import React from "react";

const RolFilter = ({ value, onChange }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="p-2.5 md:p-3 pr-9 md:pr-10 rounded-md bg-gray-100 w-full focus:outline-none focus:ring-2 focus:ring-[#C03030] appearance-none cursor-pointer text-sm"
      >
        <option value="Todos">Todos los roles</option>
        <option value="ESTUDIANTE">Estudiante</option>
        <option value="DOCENTE">Docente</option>
      </select>
      <svg
        className="absolute right-2.5 md:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-600 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
};

export default RolFilter;