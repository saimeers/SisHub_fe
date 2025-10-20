import Swal from "sweetalert2";
import { matricularEstudiantesMasivamente } from "../../../../services/userServices";
import { formatErrorMessage } from "../../utils/csvStudentParser";

export const useStudentSubmit = ({ students, setStudents, setIsSubmitting, validateStudent, toast, navigate }) => {

  const handleSubmit = async () => {
    if (students.length === 0) {
      toast.warning("No hay estudiantes para matricular");
      return;
    }

    const invalidStudents = [];
    students.forEach((student) => {
      const errors = validateStudent(student);
      if (errors.length > 0) {
        invalidStudents.push(`${student.nombre}: ${errors.join(', ')}`);
      }
    });

    if (invalidStudents.length > 0) {
      toast.error(`No se puede guardar. Hay ${invalidStudents.length} estudiante(s) con errores:\n${formatErrorMessage(invalidStudents, 2)}`);
      return;
    }

    // Agrupar estudiantes por grupo
    const matriculasPorGrupo = {};
    
    students.forEach(student => {
      const key = `${student.codigo_materia}-${student.nombre_grupo}-${student.periodo}-${student.anio}`;
      
      if (!matriculasPorGrupo[key]) {
        matriculasPorGrupo[key] = {
          codigo_materia: student.codigo_materia,
          nombre_grupo: student.nombre_grupo,
          periodo: student.periodo,
          anio: parseInt(student.anio),
          estudiantes: []
        };
      }

      matriculasPorGrupo[key].estudiantes.push({
        codigo: student.codigo,
        nombre: student.nombre,
        documento: student.documento,
        correo: student.correo,
        telefono: student.telefono
      });
    });

    const matriculas = Object.values(matriculasPorGrupo);

    const result = await Swal.fire({
      title: "¿Confirmar matriculación de estudiantes?",
      html: `
        <div style="text-align: center;">
          <p>Se matricularán <strong>${students.length} estudiante(s)</strong> en <strong>${matriculas.length} grupo(s)</strong>.</p>
          <ul style="margin-top: 10px; font-size: 0.9em; color: #374151;">
            <li>Los estudiantes serán agregados a sus respectivos grupos</li>
            <li>Recibirán acceso inmediato al sistema</li>
          </ul>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#B70000",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, matricular estudiantes",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);

    try {
      const response = await matricularEstudiantesMasivamente(matriculas);

      if (response.totalErrores === 0) {
        await Swal.fire({
          title: "¡Éxito!",
          html: `
            <div style="text-align: left;">
              <p style="color: #059669; font-weight: 600; margin-bottom: 10px;">
                Se matricularon <strong>${response.totalExitosos} estudiante(s)</strong> correctamente.
              </p>
              <p style="margin-top: 15px; font-size: 0.85em; color: #6b7280; padding: 10px; background-color: #f3f4f6; border-radius: 6px;">
                Los estudiantes ya tienen acceso a sus grupos asignados.
              </p>
            </div>
          `,
          icon: "success",
          confirmButtonColor: "#B70000",
          confirmButtonText: "Ver grupos"
        });
        navigate("/admin/all-groups");
        
      } else if (response.totalExitosos === 0) {
        const erroresHTML = response.errores
          .slice(0, 8)
          .map(e => `<li style="margin-bottom: 8px;"><strong>${e.estudiante.nombre}:</strong> <span style="color: #dc2626;">${e.error}</span></li>`)
          .join('');
        
        await Swal.fire({
          title: "Error en la matriculación",
          html: `
            <div style="text-align: left;">
              <p style="color: #dc2626; font-weight: 600; margin-bottom: 10px;">
                No se pudo matricular ningún estudiante.
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
          .map(e => `<li style="margin-bottom: 6px;"><strong>${e.estudiante.nombre}:</strong> <span style="color: #dc2626; font-size: 0.9em;">${e.error}</span></li>`)
          .join('');

        const confirmResult = await Swal.fire({
          title: "Matriculación parcial completada",
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
          confirmButtonText: "Ver grupos",
          cancelButtonText: "Quedarme aquí"
        });

        if (confirmResult.isConfirmed) {
          navigate("/admin/all-groups");
        } else {
          const exitososCodigos = new Set(response.exitosos.map(e => `${e.codigo}-${e.grupo}`));
          setStudents(students.filter(s => !exitososCodigos.has(`${s.codigo}-${s.grupo_identificador}`)));
          toast.info(`Quedan ${students.length - response.totalExitosos} estudiante(s) pendientes`);
        }
      }

    } catch (error) {
      console.error("Error al matricular estudiantes:", error);
      
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