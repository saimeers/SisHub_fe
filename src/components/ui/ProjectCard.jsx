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

const ApprovedProjectCard = ({
  title = "Proyecto",
  description = "",
  tags = [],
  logo = null,
  status = "en revisión",
  progress = 0,
  onDocumentsClick,
  onCodeClick,
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
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Desarrollo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovedProjectCard;
