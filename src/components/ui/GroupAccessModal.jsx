import { X } from "lucide-react";

const GroupAccessModal = ({ isOpen, onClose, group, qrData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 relative">
        {/* Botón para cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={22} />
        </button>

        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 text-center">
          {group ? `${group.codigo_materia}-${group.nombre_grupo}-${group.periodo_grupo || group.periodo}-${group.anio_grupo || group.anio}` : "Grupo"}
        </h2>

        {!qrData ? (
          <p className="text-center text-gray-500">Cargando información...</p>
        ) : (
          <>
            {/* Clave de acceso */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <p className="text-gray-600 text-sm font-medium">
                Clave de acceso:
              </p>
              <span className="text-base font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded-md">
                {qrData.clave_acceso || "No disponible"}
              </span>
            </div>

            {/* Código QR */}
            {qrData.qr_url && (
              <div className="flex justify-center my-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                    qrData.qr_url
                  )}&size=200x200`}
                  alt="Código QR"
                  className="w-48 h-48 border rounded-lg shadow-md"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GroupAccessModal;
