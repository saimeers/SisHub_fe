import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import SearchBar from "../../modules/admin/components/SearchBar";
import RolFilter from "../../modules/admin/components/RolFilter";
import EstadoFilter from "../../modules/admin/components/EstadoFilter";
import QuantitySelector from "../../modules/admin/components/QuantitySelector";
import UserTable from "../../modules/admin/components/UserTable";
import PendingApplications from "../../modules/admin/components/PendingApplications";
import LoadingScreen from "../../components/ui/LoadingScreen";

import {
  obtenerTodosLosUsuarios,
  obtenerUsuariosStandBy,
  habilitarUsuario,
  deshabilitarUsuario,
  aprobarPostulacion,
  rechazarPostulacion,
} from "../../services/userServices";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRol, setSelectedRol] = useState("Todos");
  const [selectedEstado, setSelectedEstado] = useState("Todos");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pendingItemsPerPage, setPendingItemsPerPage] = useState(10);
  const [users, setUsers] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [usuariosResponse, standByResponse] = await Promise.all([
        obtenerTodosLosUsuarios(),
        obtenerUsuariosStandBy(),
      ]);

      const usuariosFormateados = usuariosResponse.usuarios.map((user) => ({
        id: user.id_usuario,
        nombre: user.nombre,
        documento: user.documento,
        correo: user.correo,
        telefono: user.telefono,
        rol: user.Rol?.descripcion || "N/A",
        estado: user.Estado?.descripcion || "N/A",
        uid_firebase: user.uid_firebase,
      }));

      const postulacionesFormateadas = standByResponse.usuarios.map((user) => ({
        id: user.id_usuario,
        nombre: user.nombre,
        documento: user.documento,
        correo: user.correo,
        telefono: user.telefono,
        rol: user.Rol?.descripcion || "DOCENTE",
        uid_firebase: user.uid_firebase,
      }));

      setUsers(usuariosFormateados);
      setPendingApplications(postulacionesFormateadas);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar la información de usuarios");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.nombre.includes(searchTerm) || user.correo.includes(searchTerm);
    const matchesRol = selectedRol === "Todos" || user.rol === selectedRol;
    const matchesEstado =
      selectedEstado === "Todos" || user.estado === selectedEstado;
    return matchesSearch && matchesRol && matchesEstado;
  });

  const filteredPendingApplications = pendingApplications.filter((app) => {
    const matchesSearch = app.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRol = selectedRol === "Todos" || app.rol === selectedRol;
    return matchesSearch && matchesRol;
  });

  const handleViewUser = (user) => {
    // Determinar si es una postulación pendiente (no tiene estado)
    const esPostulacion = !user.estado;
    
    Swal.fire({
      title: user.nombre,
      html: `
        <div class="text-left space-y-2">
          <p><strong>Correo:</strong> ${user.correo}</p>
          <p><strong>Documento:</strong> ${user.documento}</p>
          <p><strong>Teléfono:</strong> ${user.telefono || "N/A"}</p>
          <p><strong>Rol:</strong> ${user.rol}</p>
          ${!esPostulacion ? `<p><strong>Estado:</strong> ${user.estado}</p>` : `<p><strong>Estado:</strong> <span style="color: #f59e0b;">En espera de aprobación</span></p>`}
        </div>
      `,
      icon: "info",
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#0891b2",
    });
  };

  const handleToggleEstado = async (user) => {
    const esHabilitado = user.estado === "HABILITADO";
    const accion = esHabilitado ? "deshabilitar" : "habilitar";

    const result = await Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
      html: `¿Estás seguro de ${accion} a <strong>${user.nombre}</strong>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: esHabilitado ? "#dc2626" : "#16a34a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      if (esHabilitado) {
        await deshabilitarUsuario(user.id);
      } else {
        await habilitarUsuario(user.id);
      }

      await Swal.fire({
        title: "¡Éxito!",
        text: `Usuario ${user.nombre} ${esHabilitado ? "deshabilitado" : "habilitado"} correctamente`,
        icon: "success",
        confirmButtonColor: "#0891b2",
        timer: 2000,
        timerProgressBar: true,
      });

      await cargarDatos();
    } catch (error) {
      console.error(`Error al ${accion} usuario:`, error);
      Swal.fire({
        title: "Error",
        text: `No se pudo ${accion} el usuario`,
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const handleAccept = async (application) => {
    const result = await Swal.fire({
      title: "Aprobar postulación",
      html: `¿Aprobar la postulación de <strong>${application.nombre}</strong> como <strong>DOCENTE</strong>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, aprobar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await aprobarPostulacion(application.id);

      await Swal.fire({
        title: "¡Aprobada!",
        text: `Postulación de ${application.nombre} aprobada correctamente`,
        icon: "success",
        confirmButtonColor: "#0891b2",
        timer: 2000,
        timerProgressBar: true,
      });

      await cargarDatos();
    } catch (error) {
      console.error("Error al aprobar postulación:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo aprobar la postulación",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const handleReject = async (application) => {
    const result = await Swal.fire({
      title: "Rechazar postulación",
      html: `¿Estás seguro de rechazar la postulación de <strong>${application.nombre}</strong>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, rechazar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await rechazarPostulacion(application.id);

      await Swal.fire({
        title: "Rechazada",
        text: `Postulación de ${application.nombre} rechazada`,
        icon: "success",
        confirmButtonColor: "#0891b2",
        timer: 2000,
        timerProgressBar: true,
      });

      await cargarDatos();
    } catch (error) {
      console.error("Error al rechazar postulación:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo rechazar la postulación",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AdminLayout title="Inicio">
      <div className="space-y-4 md:space-y-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
          Consulta la información de usuarios
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Busca por nombre"
          />
          <EstadoFilter
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
          />
          <RolFilter
            value={selectedRol}
            onChange={(e) => setSelectedRol(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          <QuantitySelector
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          />
          <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-right">
            Mostrando {Math.min(filteredUsers.length, itemsPerPage)} de {filteredUsers.length} usuarios
          </p>
        </div>

        <UserTable
          users={filteredUsers.slice(0, itemsPerPage)}
          onView={handleViewUser}
          onToggleEstado={handleToggleEstado}
        />

        {pendingApplications.length > 0 && (
          <>
            <div className="border-t border-gray-300 my-6 md:my-8"></div>
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
              Postulaciones Pendientes
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
              <QuantitySelector
                value={pendingItemsPerPage}
                onChange={(e) => setPendingItemsPerPage(Number(e.target.value))}
              />
              <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-right">
                Mostrando {Math.min(filteredPendingApplications.length, pendingItemsPerPage)} de {filteredPendingApplications.length} postulaciones
              </p>
            </div>
          </>
        )}

        <PendingApplications
          applications={filteredPendingApplications.slice(0, pendingItemsPerPage)}
          onAccept={handleAccept}
          onReject={handleReject}
          onView={handleViewUser}
        />
      </div>
    </AdminLayout>
  );
};

export default Dashboard;