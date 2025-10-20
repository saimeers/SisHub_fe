import Swal from "sweetalert2";
import { cargarDocentesMasivamente } from "../../../../services/userServices";
import { formatErrorMessage } from "../../utils/csvParser";

export const useUserSubmit = ({ users, setUsers, setIsSubmitting, validateUser, toast, navigate }) => {

  const handleSubmit = async () => {
    if (users.length === 0) {
      toast.warning("No hay docentes para cargar");
      return;
    }

    const invalidUsers = [];
    users.forEach((user) => {
      const errors = validateUser(user);
      if (errors.length > 0) {
        invalidUsers.push(`${user.nombre}: ${errors.join(', ')}`);
      }
    });

    if (invalidUsers.length > 0) {
      toast.error(`No se puede guardar. Hay ${invalidUsers.length} usuario(s) con errores:\n${formatErrorMessage(invalidUsers, 2)}`);
      return;
    }

    const result = await Swal.fire({
      title: "¿Confirmar carga de docentes?",
      html: `
        <div style="text-align: center;">
          <p>Se cargarán <strong>${users.length} docente(s)</strong> al sistema.</p>
          <ul style="margin-top: 10px; font-size: 0.9em; color: #374151;">
            <li>Podrán establecer su contraseña al ingresar</li>
          </ul>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#B70000",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cargar docentes",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);

    try {
      const docentesParaEnviar = users.map(({ id, ...user }) => user);
      const response = await cargarDocentesMasivamente(docentesParaEnviar);

      if (response.totalErrores === 0) {
        await Swal.fire({
          title: "¡Éxito!",
          html: `
            <div style="text-align: left;">
              <p style="color: #059669; font-weight: 600; margin-bottom: 10px;">
                Se cargaron <strong>${response.totalExitosos} docente(s)</strong> correctamente.
              </p>
              <p style="margin-top: 15px; font-size: 0.85em; color: #6b7280; padding: 10px; background-color: #f3f4f6; border-radius: 6px;">
                Los docentes están <strong>HABILITADOS</strong> y pueden acceder al sistema.
              </p>
            </div>
          `,
          icon: "success",
          confirmButtonColor: "#B70000",
          confirmButtonText: "Ir a lista de usuarios"
        });
        navigate("/admin/dashboard");
        
      } else if (response.totalExitosos === 0) {
        const erroresHTML = response.errores
          .slice(0, 8)
          .map(e => `<li style="margin-bottom: 8px;"><strong>${e.docente.nombre}:</strong> <span style="color: #dc2626;">${e.error}</span></li>`)
          .join('');
        
        await Swal.fire({
          title: "Error en la carga",
          html: `
            <div style="text-align: left;">
              <p style="color: #dc2626; font-weight: 600; margin-bottom: 10px;">
                No se pudo cargar ningún docente.
              </p>
              <ul style="font-size: 0.85em; max-height: 300px; overflow-y: auto; color: #374151;">
                ${erroresHTML}
                ${response.errores.length > 8 ? `<li style="color: #6b7280; font-style: italic;">... y ${response.errores.length - 8} más</li>` : ''}
              </ul>
            </div>
          `,
          icon: "error",
          confirmButtonColor: "#B70000",
        });
        
      } else {
        const exitososHTML = response.exitosos
          .slice(0, 5)
          .map(e => `<li style="color: #059669;">${e.nombre} (${e.codigo})</li>`)
          .join('');
        
        const erroresHTML = response.errores
          .slice(0, 5)
          .map(e => `<li style="margin-bottom: 6px;"><strong>${e.docente.nombre}:</strong> <span style="color: #dc2626; font-size: 0.9em;">${e.error}</span></li>`)
          .join('');

        const confirmResult = await Swal.fire({
          title: "Carga parcial completada",
          html: `
            <div style="text-align: left;">
              <p style="color: #059669; font-weight: 600; margin-bottom: 8px;">
                ${response.totalExitosos} exitoso(s):
              </p>
              <ul style="font-size: 0.85em; max-height: 140px; overflow-y: auto; margin-bottom: 15px;">
                ${exitososHTML}
                ${response.exitosos.length > 5 ? `<li style="color: #6b7280; font-style: italic;">... y ${response.exitosos.length - 5} más</li>` : ''}
              </ul>
              
              <p style="color: #dc2626; font-weight: 600; margin-bottom: 8px;">
                ${response.totalErrores} error(es):
              </p>
              <ul style="font-size: 0.85em; max-height: 140px; overflow-y: auto;">
                ${erroresHTML}
                ${response.errores.length > 5 ? `<li style="color: #6b7280; font-style: italic;">... y ${response.errores.length - 5} más</li>` : ''}
              </ul>
            </div>
          `,
          icon: "warning",
          confirmButtonColor: "#B70000",
          showCancelButton: true,
          confirmButtonText: "Ver usuarios cargados",
          cancelButtonText: "Quedarme aquí"
        });

        if (confirmResult.isConfirmed) {
          navigate("/admin/dashboard");
        } else {
          const exitososCodigos = new Set(response.exitosos.map(e => e.codigo));
          setUsers(users.filter(u => !exitososCodigos.has(u.codigo)));
          toast.info(`Quedan ${users.length - response.totalExitosos} usuario(s) pendientes`);
        }
      }

    } catch (error) {
      console.error("Error al cargar docentes:", error);
      
      const errorMessage = error.response?.data?.error || error.error || error.message || "Error desconocido";
      const errorDetalle = error.response?.data?.detalle || error.detalle || "";
      
      Swal.fire({
        title: "Error del servidor",
        html: `
          <div style="text-align: left;">
            <p style="color: #dc2626; font-weight: 600; margin-bottom: 10px;">
              ${errorMessage}
            </p>
            ${errorDetalle ? `
              <p style="font-size: 0.85em; color: #6b7280; padding: 10px; background-color: #fef2f2; border-left: 3px solid #dc2626; border-radius: 4px;">
                ${errorDetalle}
              </p>
            ` : ''}
            <p style="font-size: 0.85em; color: #6b7280; margin-top: 15px;">
              Por favor intenta de nuevo o contacta al soporte técnico.
            </p>
          </div>
        `,
        icon: "error",
        confirmButtonColor: "#B70000",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit };
};