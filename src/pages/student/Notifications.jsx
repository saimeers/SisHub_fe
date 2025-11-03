import React, { useEffect, useState } from "react";
import StudentLayout from "../../modules/student/layouts/StudentLayout";
import { obtenerNotificacionesUsuario } from "../../services/notificationService";

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso ?? "";
  }
};

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resolveCodigo = () => {
    try {
      const usuarioStr = localStorage.getItem("usuario");
      const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
      return (
        usuario?.documento ||
        localStorage.getItem("codigo") ||
        "1007" // fallback para pruebas
      );
    } catch {
      return "1007";
    }
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const codigo = resolveCodigo();
      const list = await obtenerNotificacionesUsuario(codigo);
      setItems(list);
    } catch (e) {
      setError(e?.message || "No se pudieron cargar las notificaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <StudentLayout title="Notificaciones">
      <div className="flex flex-col gap-4">
        {loading && <div className="text-gray-600">Cargando...</div>}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-gray-600">No tienes notificaciones.</div>
        )}

        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id_notificacion}
              className={`border rounded-lg p-4 bg-white shadow-sm ${
                n.leida ? "opacity-80" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  {n?.Mensaje?.titulo || "Notificación"}
                </h3>
                <span className="text-xs text-gray-500">
                  {formatDate(n?.Mensaje?.fecha_envio)}
                </span>
              </div>
              <p className="text-gray-700 mt-2">
                {n?.Mensaje?.mensaje || "Sin contenido"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
};

export default Notifications;


