import React from "react";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    "en revisión": {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
    },
    corregido: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
    },
    aprobado: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
    },
    rechazado: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
    },
  };

  const config =
    statusConfig[status?.toLowerCase()] || statusConfig["en revisión"];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} ${config.border} border`}
    >
      {status || "En revisión"}
    </span>
  );
};

const ProgressBadge = ({ value }) => {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
      {pct}% ejecución
    </span>
  );
};

const AlcanceBadge = ({ text }) => {
  if (!text) return null;
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
      {text}
    </span>
  );
};

const ProjectCard = ({
  title = "Proyecto",
  description = "",
  tags = [],
  logo = null,
  status = "en revisión",
  progress = 0,
  tipoAlcance,
  onDocumentsClick,
  onCodeClick,
  onVersionsClick,
  onClick,
}) => {
  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row p-6 gap-6">
        {/* Logo/Icono a la izquierda */}
        <div className="flex-shrink-0">
          {logo ? (
            <img
              src={logo}
              alt={title}
              className="w-56 h-36 rounded-2xl object-cover ring-1 ring-gray-200 shadow-sm"
            />
          ) : (
            <div className="w-56 h-36 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center ring-1 ring-gray-200 shadow-sm">
              <span className="text-5xl font-bold text-white">
                {title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
        </div>

        {/* Contenido a la derecha */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900 truncate pr-2">
                {title}
              </h3>
              <div className="flex items-center gap-2">
                <AlcanceBadge text={tipoAlcance} />
                <StatusBadge status={status} />
                <ProgressBadge value={progress} />
              </div>
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Descripción */}
            <p className="text-gray-600 text-[15px] leading-relaxed line-clamp-2 mb-4">
              {description || "Sin descripción disponible."}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDocumentsClick?.();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:translate-y-px transition-all text-sm font-medium shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Documentacion
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCodeClick?.();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:translate-y-px transition-all text-sm font-medium shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              Desarrollo
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onVersionsClick?.();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:translate-y-px transition-all text-sm font-medium shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9" />
                <polyline points="3 3 3 8 8 8" />
                <polyline points="12 7 12 12 15 15" />
              </svg>
              Versiones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
