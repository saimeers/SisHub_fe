import React from "react";

function ErrorAlert({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="w-full max-w-2xl bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center relative">
      {message}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-700 hover:text-red-900"
          aria-label="Cerrar"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default ErrorAlert;