import React from "react";

const GroupParticipants = ({ participants, isLoading, onParticipantClick }) => {
  if (isLoading) {
    return (
      <div className="text-center py-4 text-gray-500">
        Cargando participantes...
      </div>
    );
  }

  if (!participants || participants.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No hay participantes en este grupo.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {participants.map((p, index) => {
        const codigo = String(p.codigo);
        const isTeacher = codigo.length < 7;
        const canClick = !isTeacher && onParticipantClick;

        return (
          <div
            key={index}
            onClick={() => canClick && onParticipantClick(p)}
            className={`grid grid-cols-[1fr_3fr_auto] items-center bg-gray-100 rounded-md px-6 py-3 shadow-sm transition ${canClick ? "cursor-pointer hover:bg-gray-200" : "cursor-default"
              }`}
          >
            {/* Código */}
            <div className="text-sm font-medium text-gray-700">{p.codigo}</div>

            {/* Nombre */}
            <div className="text-gray-800 font-semibold">{p.nombre}</div>

            {/* Imagen */}
            <div className="flex justify-end">
              <img
                src={
                  p.foto ||
                  p.photoURL ||
                  p.imagen ||
                  p.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt={`Foto de ${p.nombre}`}
                className="w-10 h-10 rounded-full object-cover border border-gray-300"
                onError={(e) => {
                  e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                }}

              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GroupParticipants;
