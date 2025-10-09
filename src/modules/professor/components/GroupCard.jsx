import React, { useState } from "react";
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

const GroupCard = ({
  group,
  index = 0,
  onQRCode,
  onEstadoChange,
  showQRButton = true,
  role = "admin",
  requestConfirmEstado,
}) => {
  const navigate = useNavigate();
  const gradient = gradientClasses[index % gradientClasses.length];
  const [estado, setEstado] = useState(
    group?.estado === 1 || group?.estado === "Habilitado"
      ? "Habilitado"
      : "Deshabilitado"
  );

  const handleQRCode = (e) => {
    e.stopPropagation();
    if (onQRCode) onQRCode(group);
  };

  // Evita redirección al cambiar estado
  const handleClick = (e) => {
    if (e.target.tagName.toLowerCase() === "select") return; // no redirigir si se clickea el select
    const basePath =
      role === "admin"
        ? "/admin"
        : role === "professor"
        ? "/professor"
        : "/student";
    navigate(`${basePath}/groups/${group.id_grupo}`);
  };

  const handleEstadoChange = async (e) => {
    const nuevoEstadoTexto = e.target.value;
    const estadoAnterior = estado;
    // Confirmación para cualquier cambio de estado
    if (
      estado !== nuevoEstadoTexto &&
      typeof requestConfirmEstado === "function"
    ) {
      const accion =
        nuevoEstadoTexto === "Habilitado" ? "Habilitar" : "Deshabilitar";
      const confirmed = await requestConfirmEstado({
        title: `${accion} grupo`,
        message:
          nuevoEstadoTexto === "Habilitado"
            ? "¿Estás seguro de habilitar este grupo? Los estudiantes podrán unirse."
            : "¿Estás seguro de deshabilitar este grupo? Los estudiantes no podrán unirse mientras esté deshabilitado.",
        confirmText: accion,
      });
      if (!confirmed) {
        setEstado(estadoAnterior);
        return;
      }
    }

    const nuevoEstado = nuevoEstadoTexto === "Habilitado" ? 1 : 0;
    setEstado(nuevoEstadoTexto);
    try {
      if (onEstadoChange) {
        await onEstadoChange(group.id_grupo, nuevoEstado);
      }
    } catch (error) {
      setEstado(estadoAnterior);
      alert("No se pudo actualizar el estado");
    }
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
            {group?.nombre_grupo || group?.nombre}
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
              {group?.codigo_materia || group?.codigo}
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
          {group?.area_conocimiento && (
            <p className="text-sm">
              <span className="text-gray-500">Área Conocimiento:</span>{" "}
              {group.area_conocimiento}
            </p>
          )}

          {/* Select de estado */}
          <div className="text-sm flex items-center justify-between mt-3">
            <span className="text-gray-500">Estado:</span>
            <select
              value={estado}
              onChange={handleEstadoChange}
              onClick={(e) => e.stopPropagation()} // evita redirección al clickear select
              className={`border rounded-lg px-2 py-1 text-sm ${
                estado === "Habilitado"
                  ? "border-green-400 text-green-700"
                  : "border-red-400 text-red-700"
              } focus:outline-none focus:ring-2 focus:ring-indigo-400`}
            >
              <option value="Habilitado">Habilitado</option>
              <option value="Deshabilitado">Deshabilitado</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
