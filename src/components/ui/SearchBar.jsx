import React, { useState, useEffect } from "react";

const SearchBar = ({ onSearch, placeholder = "Buscar por nombre o código", initialValue = "" }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  // Debounce para evitar búsquedas excesivas
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300); // Esperar 300ms después del último cambio

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  // Actualizar el valor interno cuando cambie el valor inicial
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm("");
  };

  return (
    <div className="relative flex-1 min-w-[240px]">
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 pr-10"
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          type="button"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
