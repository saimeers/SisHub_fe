import React from "react";

const StatusBadge = ({ status }) => {
  // Mapeo de estados de la DB a configuración visual
  const statusConfig = {
    HABILITADO: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      label: "Habilitado",
    },
    INHABILITADO: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-200",
      label: "Inhabilitado",
    },
    STAND_BY: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-200",
      label: "En Espera",
    },
    RECHAZADO: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
      label: "Rechazado",
    },
    LIBRE: {
      bg: "bg-cyan-100",
      text: "text-cyan-800",
      border: "border-cyan-200",
      label: "Libre",
    },
    APROBADO: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      label: "Aprobado",
    },
    REVISION: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
      label: "En Revisión",
    },
    RESUELTO: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-200",
      label: "Resuelto",
    },
    CALIFICADO: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      border: "border-purple-200",
      label: "Calificado",
    },
    EN_CURSO: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
      label: "En Curso",
    },
    SELECCIONADO: {
      bg: "bg-indigo-100",
      text: "text-indigo-800",
      border: "border-indigo-200",
      label: "Seleccionado",
    },
  };

  const config = statusConfig[status] || statusConfig.EN_CURSO;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} ${config.border} border`}
    >
      {config.label}
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
  status = "EN_CURSO",
  progress = 0,
  tipoAlcance,
  onDocumentsClick,
  onCodeClick,
  onVersionsClick,
  onClick,
  hideTags = false,
  hideActions = false,
  hideProgress = false,
  hideAlcance = false,
}) => {
  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row p-6 gap-6">
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

        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900 truncate pr-2">
                {title}
              </h3>
              <div className="flex items-center gap-2">
                {!hideAlcance && <AlcanceBadge text={tipoAlcance} />}
                <StatusBadge status={status} />
                {!hideProgress && <ProgressBadge value={progress} />}
              </div>
            </div>

            {!hideTags && tags && tags.length > 0 && (
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

            <p className="text-gray-600 text-[15px] leading-relaxed line-clamp-2 mb-4">
              {description || "Sin descripción disponible."}
            </p>
          </div>

          {!hideActions &&
            (() => {
              const tipoNormalizado = tipoAlcance?.toLowerCase() || "";
              const esInvestigativo = tipoNormalizado.includes("investigativo");
              const esDesarrollo = tipoNormalizado.includes("desarrollo");
              const esAmbos = esInvestigativo && esDesarrollo;

              return (
                <div className="flex gap-3">
                  {/* Botón Documentación: visible en Investigativo o Ambos */}
                  {(esInvestigativo || esAmbos) && (
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
                  )}

                  {/* Botón Desarrollo: visible en Desarrollo o Ambos */}
                  {(esDesarrollo || esAmbos) && (
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
                  )}

                  {/* Botón Versiones: siempre visible */}
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
              );
            })()}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
