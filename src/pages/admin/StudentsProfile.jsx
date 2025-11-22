import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import { obtenerInformacionPerfil } from "../../services/userServices";
import ProjectDetailsView from "../../components/ui/ProjectDetailsView";
import { 
  FaArrowLeft,
  FaClipboardList
} from "react-icons/fa";
import { MdEmail, MdDescription } from "react-icons/md";

// Gradientes para las líneas de investigación (coherentes con la app)
const gradientesLineas = [
  "from-purple-500 to-indigo-500",
  "from-teal-400 to-cyan-500",
  "from-sky-500 to-blue-600",
  "from-yellow-400 to-orange-400",
  "from-pink-500 to-rose-500",
  "from-emerald-400 to-teal-500",
];

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [datos, setDatos] = useState(null);
  const [currentView, setCurrentView] = useState("profile");
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const info = await obtenerInformacionPerfil(id);
        setDatos(info);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [id]);

  if (!datos) {
    return (
      <AdminLayout title="Perfil del Estudiante">
        <div className="w-full max-w-6xl mx-auto mt-6 py-16 bg-white rounded-2xl shadow-md text-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Cargando información...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const {
    nombre,
    correo,
    codigo,
    documento,
    cantidadProyectos,
    cantidadVecesLider,
    tecnologias = [],
    lineasInvestigacion = [],
    proyectosPeriodo = [],
    resumenPerfil,
    fotoPerfil,
  } = datos;

  // Si estamos en la vista de detalles del proyecto, mostrar ProjectDetailsView
  if (currentView === "details" && selectedProjectId) {
    return (
      <AdminLayout title="Detalles del Proyecto">
        <ProjectDetailsView
          projectId={selectedProjectId}
          onBack={() => {
            setCurrentView("profile");
            setSelectedProjectId(null);
          }}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Perfil del Estudiante">
      <div className="w-full max-w-6xl mx-auto mt-10">
        {/* Botón Volver */}
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => navigate("/admin/students")}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium shadow-sm flex items-center gap-2"
          >
            <FaArrowLeft className="text-sm" />
            Volver
          </button>
        </div>

        <div className="bg-white px-10 py-10 rounded-2xl shadow-sm">
          {/* HEADER */}
          <div className="flex gap-8 items-center bg-gray-100 p-6 rounded-xl">
            <img
              src={
                fotoPerfil
                  ? fotoPerfil.replace("=s96-c", "=s400-c")
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              className="w-40 h-40 rounded-full object-cover"
              alt="Foto perfil"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png";
              }}
            />

            <div className="flex-1">
              <h1 className="text-2xl font-bold">{nombre}</h1>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MdEmail className="text-base" />
                <p>{correo}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <p>
                  <strong>Código:</strong> {codigo}
                </p>
                <p>
                  <strong>Documento:</strong> {documento}
                </p>
                <p>
                  <strong>Total de proyectos realizados:</strong>{" "}
                  <span className="text-[#B70000] font-bold">{cantidadProyectos ?? "0"}</span>
                </p>
                <p>
                  <strong>Número de veces siendo líder:</strong>{" "}
                  <span className="text-[#B70000] font-bold">{cantidadVecesLider ?? "0"}</span>
                </p>
              </div>
            </div>
          </div>

          {/* 2 COLUMNAS */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COLUMNA 1 – Tecnologías y Líneas de Investigación */}
          <div className="flex flex-col gap-6">
            {/* Tarjeta de Tecnologías */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-5">
                Tecnologías usadas
              </h2>

              {tecnologias.length > 0 ? (
                <div className="flex flex-col gap-5 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {tecnologias.map((tec, index) => {
                    const porcentaje =
                      cantidadProyectos > 0
                        ? Math.min(
                          (tec.cantidad / cantidadProyectos) * 100,
                          100
                        )
                        : 0;
                    
                    // Colores variados y atractivos (sin rojos)
                    const gradients = [
                      "from-purple-500 via-purple-600 to-indigo-600",
                      "from-blue-500 via-blue-600 to-cyan-500",
                      "from-teal-400 via-teal-500 to-cyan-500",
                      "from-emerald-500 via-green-500 to-teal-500",
                      "from-indigo-500 via-blue-600 to-purple-600",
                      "from-cyan-400 via-blue-500 to-indigo-500",
                      "from-sky-500 via-blue-500 to-cyan-500",
                      "from-violet-500 via-purple-500 to-indigo-500",
                    ];
                    const gradient = gradients[index % gradients.length];
                    
                    return (
                      <div key={index} className="group">
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-sm font-semibold text-gray-800 group-hover:text-[#B70000] transition-colors duration-200">
                            {tec.tecnologia}
                          </span>
                          <span className="text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                            {tec.cantidad}{" "}
                            {tec.cantidad === 1 ? "proyecto" : "proyectos"}
                          </span>
                        </div>
                        <div className="relative w-full bg-gray-100 h-6 rounded-full overflow-hidden shadow-inner border border-gray-200">
                          <div
                            className={`h-full bg-gradient-to-r ${gradient} rounded-full shadow-sm transition-all duration-1000 ease-out relative group-hover:shadow-md`}
                            style={{ width: `${porcentaje}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 italic text-sm">
                  No tiene tecnologías registradas.
                </p>
              )}
            </div>

            {/* Tarjeta de Líneas de Investigación */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-5">
                Líneas de investigación
              </h2>
              {lineasInvestigacion.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {lineasInvestigacion.map((linea, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r ${gradientesLineas[index % gradientesLineas.length]} text-white shadow-sm`}
                    >
                      {linea}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic text-sm">
                  No tiene líneas de investigación registradas.
                </p>
              )}
            </div>
          </div>

          {/* COLUMNA 2 – Proyectos por semestre */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-5">
              Proyectos por semestre
            </h2>

            {proyectosPeriodo.length > 0 ? (
              <div className="flex flex-col gap-5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {proyectosPeriodo.map((periodo, i) => (
                  <div key={i}>
                    <p className="font-semibold text-gray-600 mb-3 text-sm">
                      {periodo.anio}-{periodo.periodo}
                    </p>

                    {periodo.proyectos.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {periodo.proyectos.map((p) => (
                          <button
                            key={p.id_proyecto}
                            onClick={() => {
                              setSelectedProjectId(p.id_proyecto);
                              setCurrentView("details");
                            }}
                            className="w-full text-left px-4 py-2.5 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 text-sm hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer"
                          >
                            {p.titulo}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm italic pl-4">
                        No tiene proyectos en este periodo.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">
                No tiene proyectos registrados.
              </p>
            )}
          </div>

          {/* Resumen - Ocupa todo el ancho */}
          <div className="mt-8 bg-gray-50 p-6 rounded-xl col-span-1 lg:col-span-2 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-sm">
                <MdDescription className="text-white text-xl" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Resumen</h2>
            </div>
            {resumenPerfil ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {resumenPerfil}
              </p>
            ) : (
              <p className="text-gray-400 italic">
                El estudiante no tiene un resumen registrado.
              </p>
            )}
          </div>
        </div>
      </div>

          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f3f4f6;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #9ca3af;
              border-radius: 10px;
              border: 2px solid #f3f4f6;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #6b7280;
            }
            @keyframes shimmer {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(100%);
              }
            }
            .animate-shimmer {
              animation: shimmer 2s infinite;
            }
          `}</style>
      </div>
    </AdminLayout>
  );
};

export default StudentProfile;