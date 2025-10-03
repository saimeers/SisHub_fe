import { useState } from "react";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import FieldText from "../../components/FieldText";
import SelectField from "../../components/SelectField";
import Button from "../../components/Button";

const FormCreateGroup = () => {
  const [formData, setFormData] = useState({
    name: "",
    docente: null,
    groupName: "",
    accessKey: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const docenteOptions = [
    { value: "docente1", label: "Docente 1" },
    { value: "docente2", label: "Docente 2" },
    { value: "docente3", label: "Docente 3" },
  ];

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

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Form data:", formData);
    } catch (error) {
      console.error("Error al registrar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="Crear Grupo">
      <div className="w-full max-w-4xl mx-auto py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* label con input de Nombre */}
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
            />
          </div>

          {/*label con select de Docente */}
          <div>
            <label
              htmlFor="docente"
              className="block text-sm font-medium text-black mb-2"
            >
              Docente
            </label>
            <FieldText
              type="text"
              id="docente"
              name="docente"
              value={formData.docente ? formData.docente.label : ""}
              onChange={handleInputChange}
              placeholder="Docente"
              disabled={true}
            />
          </div>

          {/* label e input de nombre del Grupo */}
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

          {/* label e input de clave de acceso */}
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
