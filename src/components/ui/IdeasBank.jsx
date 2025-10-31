import React from "react";

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-600">
    <path d="M12 5c-7.633 0-11 6.999-11 6.999S4.367 19 12 19s11-6.999 11-6.999S19.633 5 12 5Zm0 12c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5Zm0-8a3 3 0 1 0 .001 6.001A3 3 0 0 0 12 9z" />
  </svg>
);


const IdeasBank = ({ title, items = [], onView }) => {
  const normalize = (item) =>
    typeof item === "string"
      ? { title: item, hasCorrections: false }
      : item || { title: "", hasCorrections: false };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md border border-gray-200">
            No hay elementos para mostrar
          </div>
        ) : (
          items.map((raw, idx) => {
            const item = normalize(raw);
            return (
              <div
                key={idx}
                className="grid grid-cols-[1fr_auto] items-center bg-gray-100 rounded-md px-6 py-3 shadow-sm hover:bg-gray-200 transition"
              >
                <div className="flex items-center min-w-0">
                  <div className="text-gray-800 font-medium truncate">{item.title}</div>
                </div>
                <button
                  type="button"
                  className="ml-4 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-300 hover:bg-gray-50"
                  onClick={() => onView && onView(item)}
                  aria-label="Ver"
                >
                  <EyeIcon />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default IdeasBank;
