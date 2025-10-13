import { X, Edit2, Check, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

const GroupAccessModal = ({
  isOpen,
  onClose,
  group,
  qrData,
  onUpdateAccessKey,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newAccessKey, setNewAccessKey] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);

  if (!isOpen) return null;

  const handleStartEdit = () => {
    setNewAccessKey(qrData?.clave_acceso || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewAccessKey("");
  };

  const handleSaveEdit = async () => {
    if (!newAccessKey.trim() || newAccessKey === qrData?.clave_acceso) {
      handleCancelEdit();
      return;
    }

    setIsUpdating(true);
    try {
      // Llamar a la función del padre para actualizar
      if (onUpdateAccessKey) {
        await onUpdateAccessKey(group, newAccessKey.trim());
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar clave:", error);
      alert("No se pudo actualizar la clave de acceso");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGenerateNew = async () => {
    setIsGeneratingNew(true);
    try {
      // Generar nueva clave aleatoria
      const randomKey = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();
      setNewAccessKey(randomKey);
    } catch (error) {
      console.error("Error al generar clave:", error);
    } finally {
      setIsGeneratingNew(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 relative">
        {/* Botón para cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
          disabled={isUpdating}
        >
          <X size={22} />
        </button>

        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">
          {group
            ? `${group.codigo_materia}-${group.nombre_grupo}-${
                group.periodo_grupo || group.periodo
              }-${group.anio_grupo || group.anio}`
            : "Grupo"}
        </h2>

        {!qrData ? (
          <p className="text-center text-gray-500">Cargando información...</p>
        ) : (
          <>
            {/* Clave de acceso con edición */}
            <div className="mb-6">
              {!isEditing ? (
                <div className="flex items-center justify-center gap-3">
                  <p className="text-gray-600 text-sm font-medium">
                    Clave de acceso:
                  </p>
                  <span className="text-lg font-bold text-gray-800 bg-gray-100 px-4 py-2 rounded-md tracking-wider">
                    {qrData.clave_acceso || "No disponible"}
                  </span>
                  <button
                    onClick={handleStartEdit}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Editar clave"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newAccessKey}
                      onChange={(e) =>
                        setNewAccessKey(e.target.value.toUpperCase())
                      }
                      className="flex-1 px-4 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-500 font-semibold text-center tracking-wider"
                      placeholder="Nueva clave"
                      maxLength={20}
                      disabled={isUpdating}
                    />
                    <button
                      onClick={handleGenerateNew}
                      disabled={isGeneratingNew || isUpdating}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Generar nueva clave"
                    >
                      {isGeneratingNew ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <RefreshCw size={18} />
                      )}
                    </button>
                  </div>

                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={handleSaveEdit}
                      disabled={isUpdating || !newAccessKey.trim()}
                      className="px-5 py-2 bg-[#B70000] text-white rounded-lg hover:bg-red-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          Guardar
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Código QR */}
            {qrData.qr_url && !isEditing && (
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

            {isEditing && (
              <div className="text-center text-sm text-gray-500 italic">
                El código QR se actualizará después de guardar la nueva clave
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GroupAccessModal;
