import React from "react";
import { Bell, Check, CheckCheck } from "lucide-react";

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso ?? "";
  }
};

const NotificationCard = ({ notificacion, onToggleRead, isChangingState }) => {
  const isRead = notificacion.leida;

  return (
    <div
      className={`relative border-l-4 rounded-lg p-4 bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
        isRead
          ? "border-l-gray-300 opacity-75"
          : "border-l-[#B70000] bg-blue-50/30"
      }`}
    >
      {/* Indicador de no leída */}
      {!isRead && (
        <div className="absolute top-4 right-4">
          <div className="w-2 h-2 bg-[#B70000] rounded-full animate-pulse"></div>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icono */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            isRead ? "bg-gray-200" : "bg-[#B70000]/10"
          }`}
        >
          <Bell
            size={20}
            className={isRead ? "text-gray-400" : "text-[#B70000]"}
          />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className={`font-semibold text-gray-800 ${
                !isRead ? "font-bold" : ""
              }`}
            >
              {notificacion?.Mensaje?.titulo || "Notificación"}
            </h3>
            <button
              onClick={() => onToggleRead(notificacion.id_notificacion)}
              disabled={isChangingState}
              className={`flex-shrink-0 p-1.5 rounded-md transition-colors ${
                isRead
                  ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  : "text-[#B70000] hover:text-[#CC4040] hover:bg-red-50"
              }`}
              title={isRead ? "Marcar como no leída" : "Marcar como leída"}
            >
              {isRead ? (
                <CheckCheck size={18} />
              ) : (
                <Check size={18} />
              )}
            </button>
          </div>

          <p
            className={`text-gray-700 mb-2 ${
              !isRead ? "font-medium" : ""
            }`}
          >
            {notificacion?.Mensaje?.mensaje || "Sin contenido"}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatDate(notificacion?.Mensaje?.fecha_envio)}</span>
            {notificacion?.Mensaje?.remitente && (
              <span className="text-gray-400">
                De: {notificacion.Mensaje.remitente}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;

