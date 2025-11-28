import React, { useEffect, useState, useMemo } from "react";
import StudentLayout from "../../modules/student/layouts/StudentLayout";
import NotificationCard from "../../components/ui/NotificationCard";
import { LoadingScreen } from "../../components/ui/LoadingScreen";
import {
  obtenerNotificacionesUsuario,
  cambiarEstadoNotificacion,
} from "../../services/notificationService";

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [changingId, setChangingId] = useState(null);

  const resolveCodigo = () => {
    try {
      // Intentar obtener de localStorage "usuario"
      const usuarioStr = localStorage.getItem("usuario");
      if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        if (usuario?.documento) {
          console.log("✅ Código obtenido de localStorage.usuario:", usuario.documento);
          return usuario.documento.toString();
        }
      }

      // Intentar obtener de localStorage "userData"
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        if (userData?.documento) {
          console.log("✅ Código obtenido de localStorage.userData:", userData.documento);
          return userData.documento.toString();
        }
      }

      // Fallback a código directo
      const codigoDirecto = localStorage.getItem("codigo");
      if (codigoDirecto) {
        console.log("✅ Código obtenido de localStorage.codigo:", codigoDirecto);
        return codigoDirecto.toString();
      }

      // Último fallback para pruebas
      console.log("⚠️ Usando código de prueba: 1007");
      return "1007";
    } catch (err) {
      console.error("❌ Error al resolver código:", err);
      console.log("⚠️ Usando código de prueba: 1007");
      return "1007";
    }
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const codigo = resolveCodigo();
      console.log("📡 Cargando notificaciones para código:", codigo);
      const list = await obtenerNotificacionesUsuario(codigo);
      console.log("✅ Notificaciones cargadas:", list.length);
      setItems(list);
    } catch (e) {
      console.error("❌ Error en load:", e);
      setError(e?.message || "No se pudieron cargar las notificaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRead = async (idNotificacion) => {
    if (changingId === idNotificacion) return;

    setChangingId(idNotificacion);
    try {
      const updated = await cambiarEstadoNotificacion(idNotificacion);
      setItems((prev) =>
        prev.map((item) =>
          item.id_notificacion === idNotificacion
            ? { ...item, leida: updated.leida }
            : item
        )
      );
    } catch (e) {
      console.error("Error al cambiar estado:", e);
      // Recargar en caso de error
      await load();
    } finally {
      setChangingId(null);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Ordenar: no leídas primero
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.leida === b.leida) {
        // Si tienen el mismo estado, ordenar por fecha (más recientes primero)
        const fechaA = new Date(a.Mensaje?.fecha_envio || 0);
        const fechaB = new Date(b.Mensaje?.fecha_envio || 0);
        return fechaB - fechaA;
      }
      return a.leida ? 1 : -1;
    });
  }, [items]);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.leida).length,
    [items]
  );

  if (loading && items.length === 0) {
    return (
      <StudentLayout title="Notificaciones">
        <LoadingScreen />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Notificaciones">
      <div className="flex flex-col gap-4">
        {/* Header con contador */}
        {items.length > 0 && (
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Tus notificaciones
            </h2>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-[#B70000] text-white text-sm font-medium rounded-full">
                {unreadCount} no leída{unreadCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">
              No tienes notificaciones
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Las notificaciones aparecerán aquí cuando las recibas
            </p>
          </div>
        )}

        <div className="space-y-3">
          {sortedItems.map((n) => (
            <NotificationCard
              key={n.id_notificacion}
              notificacion={n}
              onToggleRead={handleToggleRead}
              isChangingState={changingId === n.id_notificacion}
            />
          ))}
        </div>
      </div>
    </StudentLayout>
  );
};

export default Notifications;


