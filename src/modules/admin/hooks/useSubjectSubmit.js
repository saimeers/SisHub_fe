import { useNavigate } from "react-router-dom";
import { useToast } from "../../../hooks/useToast";
import { createSubject } from "../../../services/materiaServices";

export const useSubjectSubmit = ({
  subjects,
  setSubjects,
  setIsSubmitting,
  validateSubject,
  toast,
  navigate
}) => {
  const handleSubmit = async () => {
    if (subjects.length === 0) {
      toast.error("No hay materias para guardar");
      return;
    }

    // Validar todas las materias antes de enviar
    const validationErrors = [];
    subjects.forEach((subject, index) => {
      const errors = validateSubject(subject);
      if (errors.length > 0) {
        validationErrors.push(`Materia ${index + 1} (${subject.nombre}): ${errors.join(', ')}`);
      }
    });

    if (validationErrors.length > 0) {
      toast.error(`Errores de validación:\n${validationErrors.slice(0, 3).join('\n')}${validationErrors.length > 3 ? '\n... y más errores' : ''}`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Crear todas las materias una por una para manejar errores específicos
      const results = [];
      const errors = [];
      
      for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i];
        try {
          const result = await createSubject({
            codigo: String(subject.codigo).trim(),
            nombre: String(subject.nombre).trim(),
            semestre: String(subject.semestre).trim(),
            creditos: parseInt(subject.creditos),
            prerrequisitos: subject.prerrequisitos || "Ninguno",
            tipo: subject.tipo,
            id_area: Number(subject.id_area),
          });
          results.push(result);
        } catch (error) {
          // Si es un error de código duplicado, mostrar el código específico
          if (error.message.includes("código ya existe") || error.message.includes("código duplicado")) {
            errors.push(`Materia ${i + 1}: Código duplicado: ${subject.codigo} (${subject.nombre})`);
          } else if (error.message.includes("nombre ya existe") || error.message.includes("nombre duplicado")) {
            errors.push(`Materia ${i + 1}: Nombre duplicado: ${subject.nombre} (${subject.codigo})`);
          } else {
            errors.push(`Materia ${i + 1}: ${error.message}`);
          }
        }
      }
      
      if (errors.length > 0) {
        toast.error(`Errores al crear materias:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n... y más errores' : ''}`);
        return;
      }
      
      toast.success(`${results.length} materia(s) creada(s) correctamente`);
      setSubjects([]);
      navigate("/admin/subjects", { replace: true });
      
    } catch (error) {
      toast.error(error?.message || "Error al crear las materias");
      console.error("Error creating subjects:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit
  };
};
