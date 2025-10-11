import React from "react";
import { FiKey } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const gradientClasses = [
  "from-purple-500 to-indigo-500",
  "from-teal-400 to-cyan-500",
  "from-pink-500 to-rose-500",
  "from-yellow-400 to-orange-400",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-yellow-600",
];

const GroupCard = ({ group, index = 0, onQRCode, showQRButton = true, role = "admin" }) => {
  const navigate = useNavigate();
  const gradient = gradientClasses[index % gradientClasses.length];

  const handleQRCode = (e) => {
    e.stopPropagation(); // evita que al hacer click en el ícono también navegue
    if (onQRCode) {
      onQRCode(group);
    }
  };

  const handleClick = () => {
    const basePath = role === "admin" ? "/admin" : role === "professor" ? "/professor" : "/student";
    navigate(`${basePath}/groups/${group.codigo_materia}/${group.nombre_grupo}/${group.periodo}/${group.anio}`);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden hover:scale-[1.02] transition-all duration-300 ease-in-out"
    >
      <div className={`bg-gradient-to-r ${gradient} px-6 py-6 text-white`}>
        <div className="flex items-start justify-between">
          <h3 className="text-2xl font-extrabold drop-shadow-sm text-center">
            {group?.nombre_materia}
          </h3>
        </div>
      </div>

      <div className="px-6 py-5 text-gray-700">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-800">
            {group?.codigo_materia+group?.nombre_grupo+"-"+group?.anio+"-"+group?.periodo}
          </p>
          {showQRButton && (
            <button
              type="button"
              className="text-gray-600 hover:text-gray-800 transition-colors"
              onClick={handleQRCode}
              title="Generar código QR"
            >
              <FiKey size={16} />
            </button>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm">
            <span className="text-gray-500">Código:</span>{" "}
            <span className="font-semibold">
              {group?.codigo || group?.codigo_materia}
            </span>
          </p>
          <p className="text-sm">
            <span className="text-gray-500">Créditos:</span> {group?.creditos}
          </p>
          {group?.prerrequisitos && (
            <p className="text-sm">
              <span className="text-gray-500">Prerrequisito:</span>{" "}
              {group.prerrequisitos}
            </p>
          )}
          {group?.nombre_area && (
            <p className="text-sm">
              <span className="text-gray-500">Área Conocimiento:</span>{" "}
              {group.nombre_area}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
