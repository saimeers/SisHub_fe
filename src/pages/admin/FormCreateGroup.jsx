import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import FieldText from "../../components/ui/FieldText";
import SelectField from "../../components/ui/SelectField";
import Button from "../../components/ui/Button";
import { listarDocentes } from "../../services/userServices";
import { generarClaveAcceso } from "../../services/groupServices";
import { crearGrupo } from "../../services/groupServices";
import { useToast } from "../../hooks/useToast";

const FormCreateGroup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const materiaState = location?.state?.materia || null;
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: materiaState?.label || "",
    docente: null,
    groupName: "",
    semestre: "",
    accessKey: "",
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
          return { value: d.id_usuario, label: formatted };
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
    // Normalizar campo semestre: solo dígitos y máximo 2 caracteres
    const nextValue = name === "semestre" ? value.replace(/\D/g, "").slice(0, 2) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
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

    try {
      const payload = {
        nombre: formData.groupName,
        clave_acceso: formData.accessKey,
        semestre: formData.semestre,
        id_materia: materiaState?.value,
        id_docente: formData.docente?.value,
      };
      await crearGrupo(payload);
      success("Grupo creado correctamente");
      // limpiar formulario básico antes de navegar
      setFormData({
        name: materiaState?.label || "",
        docente: null,
        groupName: "",
        semestre: "",
        accessKey: "",
      });
      navigate("/admin/groups", { state: { materia: materiaState } });
    } catch (error) {
      console.error("Error al registrar:", error);
      toastError("Error al crear el grupo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="Crear Grupo">
      <div className="w-full max-w-4xl mx-auto pt-4 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-black mb-2"
            >
              Nombre
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
              placeholder="Ingrese el nombre del grupo"
            />
          </div>

          <div>
            <label
              htmlFor="semestre"
              className="block text-sm font-medium text-black mb-2"
            >
              Semestre
            </label>
            <FieldText
              type="text"
              id="semestre"
              name="semestre"
              value={formData.semestre}
              onChange={handleInputChange}
              placeholder="Ej: 1 o 2"
              maxLength={2}
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

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-4">
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
