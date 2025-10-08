import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import FieldText from "../../components/ui/FieldText";
import Button from "../../components/ui/Button";
import { generarClaveAcceso, crearGrupo } from "../../services/groupServices";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../contexts/AuthContext";

const FormCreateGroup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const materiaState = location?.state?.materia || null;
  const { success, error: toastError } = useToast();
  const { userData } = useAuth();

  const [formData, setFormData] = useState({
    name: materiaState?.label || "",
    docenteName: "",
    docenteId: null,
    groupName: "",
    accessKey: "",
  });

  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (userData) {
      const nombreCompleto =
        `${userData.nombre || ""} ${userData.apellido || ""}`.trim() ||
        userData.correo ||
        "";
      setFormData((prev) => ({
        ...prev,
        docenteName: nombreCompleto,
        docenteId: userData.id_usuario,
      }));
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        nombre: formData.groupName,
        clave_acceso: formData.accessKey,
        id_materia: materiaState?.value,
        id_docente: formData.docenteId,
      };

      await crearGrupo(payload);
      success("Grupo creado correctamente");

      const nombreCompleto = userData.nombre?.trim() || userData.correo || "";
      setFormData({
        name: materiaState?.label || "",
        docenteName: nombreCompleto,
        docenteId: userData.id_usuario,
        groupName: "",
        accessKey: "",
      });

      navigate("/professor/groups", { state: { materia: materiaState } });
    } catch (error) {
      // Captura el mensaje que devuelve el backend
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Error desconocido";

      // Muestra el mensaje completo
      toastError(`No se puede crear el grupo: ${backendMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="Crear Grupo">
      <div className="w-full max-w-4xl mx-auto py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre de la materia */}
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
              placeholder="Ingrese el nombre de la materia"
              disabled={!!materiaState}
            />
          </div>

          {/* Docente */}
          <div>
            <label
              htmlFor="docenteName"
              className="block text-sm font-medium text-black mb-2"
            >
              Docente
            </label>
            <FieldText
              type="text"
              id="docenteName"
              name="docenteName"
              value={formData.docenteName}
              disabled
            />
          </div>

          {/* Nombre del Grupo */}
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

          {/* Clave de acceso */}
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
