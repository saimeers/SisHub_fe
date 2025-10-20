import Swal from "sweetalert2";
import { pollProgress } from "../../../../services/progressService";
import { cargarDocentesMasivamente } from "../../../../services/userServices";
import { formatErrorMessage } from "../../utils/csvParser";

export const useUserSubmit = ({ 
  users, 
  setUsers, 
  setIsSubmitting, 
  validateUser, 
  toast, 
  navigate,
  setShowProgressModal,
  setProgressData 
}) => {

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
          <ul style="margin-top: 10px; font-size: 0.9em; color: #374151; text-align: left; list-style: none; padding-left: 20px;">
            <li>✓ Podrán establecer su contraseña al ingresar</li>
            <li>✓ Recibirán acceso inmediato como docentes</li>
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
    setShowProgressModal(true);

    try {
      const docentesParaEnviar = users.map(({ id, ...user }) => user);
      
      console.log("🚀 Enviando payload:", { docentes: docentesParaEnviar });

      const response = await cargarDocentesMasivamente(docentesParaEnviar);

      console.log("✅ Respuesta del servidor:", response);

      if (!response.progressId) {
        throw new Error("El servidor no retornó un progressId");
      }

      const { progressId } = response;
      console.log("🔑 Progress ID obtenido:", progressId);

      const cleanup = pollProgress(
        progressId,
        (progress) => {
          console.log("📊 Progreso actualizado:", progress);
          setProgressData(progress);
        },
        (finalProgress) => {
          console.log("✅ Proceso completado:", finalProgress);
          setProgressData(finalProgress);
          setIsSubmitting(false);

          toast.success(
            `¡Carga completada! ${finalProgress.success?.length || 0} docentes cargados`
          );
        },
        (error) => {
          console.error("❌ Error en progreso:", error);
          setIsSubmitting(false);
          setShowProgressModal(false);

          Swal.fire({
            title: "Error en el proceso",
            text: error.message || "Error al procesar la carga",
            icon: "error",
            confirmButtonColor: "#dc2626",
          });
        },
        1000 
      );

      return cleanup;

    } catch (error) {
      console.error("❌ Error al iniciar carga:", error);
      
      setIsSubmitting(false);
      setShowProgressModal(false);

      const errorMessage = error.response?.data?.error || error.error || error.message || "Error desconocido";
      const errorDetalle = error.response?.data?.detalle || error.detalle || "";
      
      Swal.fire({
        title: "Error al iniciar la carga",
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
    }
  };

  return { handleSubmit };
};