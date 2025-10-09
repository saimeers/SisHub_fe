import React from "react";

const GroupDetailBase = ({ groupInfo, participants, isLoading, activeTab, setActiveTab, role }) => {
  const tabs = [
    { id: "proyecto", label: "Proyecto" },
    { id: "equipo", label: "Equipo" },
    { id: "participantes", label: "Participantes" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-6 bg-white rounded-2xl shadow-sm">
      {/* Tabs centradas */}
      <div className="flex justify-center mb-8">
        <div className="flex justify-center space-x-2 bg-gray-100 p-1 rounded-full w-fit mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido de pestañas */}
      <div className="rounded-xl">
        {activeTab === "participantes" && (
          <div className="mt-8">
            <div className="mb-4 grid grid-cols-2 text-sm font-semibold text-gray-600 px-4">
              <span>Código</span>
              <span>Nombre</span>
            </div>

            <div className="flex flex-col gap-3">
              {isLoading ? (
                <p className="text-gray-500 text-center py-6">
                  Cargando participantes...
                </p>
              ) : participants && participants.length > 0 ? (
                participants.map((p, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_3fr_auto] items-center bg-gray-100 rounded-md px-6 py-3 shadow-sm hover:bg-gray-200 transition"
                  >
                    {/* Código */}
                    <div className="text-sm font-medium text-gray-700">
                      {p.codigo}
                    </div>

                    {/* Nombre */}
                    <div className="text-gray-800 font-semibold">{p.nombre}</div>

                    {/* Imagen */}
                    <div className="flex justify-end">
                      <img
                        src={
                          p.foto ||
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        alt={`Foto de ${p.nombre}`}
                        className="w-10 h-10 rounded-full object-cover border border-gray-300"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-6">
                  No hay participantes registrados
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "proyecto" && (
          <div className="text-center py-12 text-gray-500">
            <p>Contenido del proyecto próximamente...</p>
          </div>
        )}

        {activeTab === "equipo" && (
          <div className="text-center py-12 text-gray-500">
            <p>Información del equipo próximamente...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetailBase;
