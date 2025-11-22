import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import { obtenerInformacionPerfil } from "../../services/userServices";

const StudentProfile = () => {
  const { id } = useParams();
  const [datos, setDatos] = useState(null);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

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
        <div className="w-full max-w-5xl mx-auto mt-10 py-10 bg-white rounded-2xl shadow-sm text-center">
          <p className="text-gray-500">Cargando información...</p>
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
    fotoPerfil
  } = datos;

  return (
    <AdminLayout title="Perfil del Estudiante">
      <div className="w-full max-w-6xl mx-auto mt-10">

        {/* CARD PRINCIPAL */}
        <div className="bg-white px-10 py-10 rounded-2xl shadow-sm">

          {/* Header */}
          <div className="flex gap-8 items-center">
            <img
              src={
                fotoPerfil ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              className="w-40 h-40 rounded-full object-cover"
              alt="Foto perfil"
            />

            <div className="flex-1">
              <h1 className="text-2xl font-bold">{nombre}</h1>
              <p className="text-gray-600">{correo}</p>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <p><strong>Código:</strong> {codigo}</p>
                <p><strong>Documento:</strong> {documento}</p>
                <p>
                  <strong>Total de proyectos realizados:</strong>{" "}
                  {cantidadProyectos ?? "0"}
                </p>
                <p>
                  <strong>Número de veces siendo líder:</strong>{" "}
                  {cantidadVecesLider ?? "0"}
                </p>
              </div>
            </div>
          </div>

          {/* 2 COLUMNAS */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Columna izquierda */}
            <div>
              {/* Tecnologías */}
              <h2 className="text-lg font-semibold mb-4">Tecnologías usadas</h2>

              {tecnologias.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {tecnologias.map((tec, index) => (
                    <div key={index}>
                      <p className="text-sm font-medium">{tec}</p>
                      <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${80 - index * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No tiene tecnologías registradas.</p>
              )}

              {/* Líneas de investigación */}
              <div className="mt-10">
                <h2 className="text-lg font-semibold mb-3">Líneas de investigación</h2>

                {lineasInvestigacion.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {lineasInvestigacion.map((linea, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full"
                      >
                        {linea}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No tiene líneas de investigación.</p>
                )}
              </div>
            </div>

            {/* Columna derecha */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Proyectos por semestre</h2>

              {proyectosPeriodo.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {proyectosPeriodo.map((periodo, i) => (
                    <div key={i}>
                      <p className="font-medium text-gray-700 mb-2">
                        {periodo.anio}-{periodo.periodo}
                      </p>

                      {periodo.proyectos.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {periodo.proyectos.map((p) => (
                            <button
                              key={p.id_proyecto}
                              onClick={() => setProyectoSeleccionado(p)}
                              className="w-full text-left bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
                            >
                              {p.titulo}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">
                          No tiene proyectos en este periodo.
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Descripción */}
                  <div className="bg-gray-100 rounded-xl p-5 mt-2">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Descripción <span className="text-sm text-gray-500">(obj_general)</span>
                    </h3>

                    {proyectoSeleccionado ? (
                      <p className="text-gray-600">
                        Seleccionaste el proyecto:{" "}
                        <strong>{proyectoSeleccionado.titulo}</strong>
                      </p>
                    ) : (
                      <p className="text-gray-400">
                        Selecciona un proyecto para ver detalles
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No tiene proyectos registrados.</p>
              )}
            </div>
          </div>

          {/* Resumen */}
          <div className="mt-12 bg-gray-50 p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-2">Resumen</h2>
            {resumenPerfil ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {resumenPerfil}
              </p>
            ) : (
              <p className="text-gray-400">El estudiante no tiene un resumen registrado.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StudentProfile;
