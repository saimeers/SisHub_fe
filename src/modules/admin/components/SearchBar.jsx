import React from "react";

const SearchBar = ({ value, onChange, placeholder = "Busca por nombre" }) => {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="p-2.5 md:p-3 pl-9 md:pl-10 rounded-md bg-gray-100 w-full focus:outline-none focus:ring-2 focus:ring-[#C03030] text-sm"
      />
      <svg
        className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
};

export default SearchBar;
