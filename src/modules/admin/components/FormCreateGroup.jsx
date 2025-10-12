import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import FieldText from "../../../components/ui/FieldText";
import SelectField from "../../../components/ui/SelectField";
import Button from "../../../components/ui/Button";
import { listarDocentes } from "../../../services/userServices";
import {
  generarClaveAcceso,
  crearGrupo,
} from "../../../services/groupServices";
import { useToast } from "../../../hooks/useToast";

const FormCreateGroup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const materiaState = location?.state?.materia || null;
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: materiaState?.label || "",
    groupName: "",
    groupPeriod: "",
    groupAnio: "",
    accessKey: "",
    docente: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [docenteOptions, setDocenteOptions] = useState([]);

  useEffect(() => {
    const loadDocentes = async () => {
      try {
        const data = await listarDocentes();
        const lista = data?.docentes || data?.usuarios || data || [];
        const options = lista.map((d) => {
          const raw = d.nombre || "";
          const formatted = raw
            .split(" ")
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
          return { value: d.codigo, label: formatted };
        });
        setDocenteOptions(options);
      } catch (err) {
        console.error("Error al cargar docentes:", err);
      }
    };
    loadDocentes();
  }, []);

  useEffect(() => {
    const loadAccessKey = async () => {
      try {
        const data = await generarClaveAcceso();
        const generated = data?.clave || data?.clave_acceso || data || "";
        setFormData((prev) => ({ ...prev, accessKey: generated }));
      } catch (err) {
        console.error("Error al generar clave de acceso:", err);
      }
    };
    loadAccessKey();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDocenteChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      docente: selectedOption,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validar campos requeridos
    if (!formData.groupName.trim()) {
      toastError("Falta completar el nombre del grupo");
      setIsLoading(false);
      return;
    }

    if (!formData.groupPeriod.trim()) {
      toastError("Falta completar el periodo");
      setIsLoading(false);
      return;
    }

    if (!formData.groupAnio.trim()) {
      toastError("Falta completar el año");
      setIsLoading(false);
      return;
    }

    if (!formData.docente?.value) {
      toastError("Falta seleccionar un docente");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        codigo_materia: materiaState.value,
        nombre: formData.groupName.trim(),
        periodo: formData.groupPeriod.trim(),
        anio: formData.groupAnio.trim(),
        clave_acceso: formData.accessKey,
        codigo_docente: formData.docente.value,
      };

      console.log("Datos que se envían al backend:", payload);

      await crearGrupo(payload);
      success("Grupo creado correctamente");

      setFormData({
        name: materiaState?.label || "",
        groupName: "",
        groupPeriod: "",
        groupAnio: "",
        accessKey: "",
        docente: null,
      });

      navigate(`/admin/${materiaState.value}/groups`, { state: { materia: materiaState } });
    } catch (error) {
      console.error("Error al registrar:", error);
      
      // Mostrar el mensaje específico del backend si está disponible
      const errorMessage = error?.response?.data?.message || error?.message || "Error al crear el grupo";
      toastError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="Crear Grupo">
      <div className="w-full max-w-4xl mx-auto pt-6 pb-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Materia */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-black mb-2"
            >
              Nombre de la materia
            </label>
            <FieldText
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ingrese el nombre de materia"
              disabled={!!materiaState}
            />
          </div>

          {/* Docente */}
          <div>
            <label
              htmlFor="docente"
              className="block text-sm font-medium text-black mb-2"
            >
              Docente
            </label>
            <SelectField
              id="docente"
              name="docente"
              value={formData.docente}
              onChange={handleDocenteChange}
              options={docenteOptions}
              placeholder="Seleccione un docente"
              isClearable={true}
            />
          </div>

          {/* Grupo + Periodo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label
                htmlFor="groupName"
                className="block text-sm font-medium text-black mb-2"
              >
                Nombre del Grupo
              </label>
              <FieldText
                type="text"
                id="groupName"
                name="groupName"
                value={formData.groupName}
                onChange={handleInputChange}
                placeholder="Ingrese el nombre del grupo (A - B)"
              />
            </div>

            <div>
              <label
                htmlFor="groupPeriod"
                className="block text-sm font-medium text-black mb-2"
              >
                Periodo
              </label>
              <FieldText
                type="text"
                id="groupPeriod"
                name="groupPeriod"
                value={formData.groupPeriod}
                onChange={handleInputChange}
                placeholder="Ingrese el periodo del grupo (01 - 02)"
              />
            </div>
          </div>

          {/* Año + Clave de acceso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label
                htmlFor="groupAnio"
                className="block text-sm font-medium text-black mb-2"
              >
                Año
              </label>
              <FieldText
                type="text"
                id="groupAnio"
                name="groupAnio"
                value={formData.groupAnio}
                onChange={handleInputChange}
                placeholder="Ingrese el año actual"
              />
            </div>

            <div>
              <label
                htmlFor="accessKey"
                className="block text-sm font-medium text-black mb-2"
              >
                Clave de Acceso
              </label>
              <FieldText
                type="text"
                id="accessKey"
                name="accessKey"
                value={formData.accessKey}
                onChange={handleInputChange}
                placeholder="Ingrese la clave de acceso"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="submit"
              text={isLoading ? "Registrando..." : "Registrar"}
              disabled={isLoading}
            />
            <Button
              type="button"
              text="Cancelar"
              variant="secondary"
              onClick={() => window.history.back()}
            />
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default FormCreateGroup;
