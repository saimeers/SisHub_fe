import React from "react";
import Button from "./Button";

function ConfirmModal({
  isOpen,
  title = "Confirmar",
  message = "¿Estás seguro?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 relative">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 text-center">
          {title}
        </h2>
        <p className="text-sm text-gray-700 mb-6 text-center">{message}</p>
        <div className="flex justify-center gap-3">
          <Button
            variant="secondary"
            text={cancelText}
            onClick={onCancel}
            disabled={loading}
          />
          <Button
            text={loading ? "Procesando..." : confirmText}
            onClick={onConfirm}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;


