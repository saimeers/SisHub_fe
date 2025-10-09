import React, { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import FieldText from "../../components/ui/FieldText";
import SelectField from "../../components/ui/SelectField";
import Button from "../../components/ui/Button";
import { listarAreas } from "../../services/areaServices";
import { getSubjectById, updateSubject } from "../../services/materiaServices";
import { useToast } from "../../hooks/useToast";
import { useNavigate, useParams } from "react-router-dom";

const initialForm = {
  codigo: "",
  nombre: "",
  semestre: "",
  creditos: "",
  prerrequisitos: "",
  tipo: "Obligatoria",
  id_area: null,
};

const subjectTypes = [
  { value: "Obligatoria", label: "Obligatoria" },
  { value: "Electiva", label: "Electiva" },
];

const FormEditSubject = () => {
  const [form, setForm] = useState(initialForm);
  const [areas, setAreas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();
  const navigate = useNavigate();
  const { id } = useParams(); // id_materia

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log("🔹 Solicitando datos de la materia con id:", id);
        const subjectData = await getSubjectById(id);
        console.log("✅ Materia recibida:", subjectData);

        console.log("🔹 Solicitando listado de áreas...");
        const list = await listarAreas();
        console.log("✅ Áreas recibidas:", list);

        const areasList = Array.isArray(list) ? list : [];
        setAreas(areasList);

        if (subjectData) {
          setForm({
            codigo: subjectData.codigo || "",
            nombre: subjectData.nombre || "",
            semestre: subjectData.semestre || "",
            creditos: subjectData.creditos || "",
            prerrequisitos: subjectData.prerrequisitos || "",
            tipo: subjectData.tipo || "Obligatoria",
            id_area: subjectData.id_area || null,
          });
        }
      } catch (err) {
        console.error("❌ Error al cargar materia:", err);
        error("No se pudo cargar la información de la materia");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]); // ← solo depende del id



  const areaOptions = useMemo(
    () => areas.map((a) => ({ value: a.id_area, label: a.nombre })),
    [areas]
  );

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectType = (opt) => {
    setForm((prev) => ({ ...prev, tipo: opt ? opt.value : "" }));
  };

  const handleSelectArea = (opt) => {
    setForm((prev) => ({ ...prev, id_area: opt ? opt.value : null }));
  };


  const validate = () => {
    if (!form.codigo || !form.nombre || !form.semestre || !form.tipo)
      return "Complete los campos requeridos.";
    if (!Number.isFinite(Number(form.creditos)) || Number(form.creditos) <= 0)
      return "El campo Créditos debe ser un número válido.";
    if (!form.id_area) return "Seleccione un área del conocimiento.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) return error(msg);

    setIsSubmitting(true);
    try {
      const payload = {
        codigo: String(form.codigo).trim(),
        nombre: String(form.nombre).trim(),
        semestre: String(form.semestre).trim(),
        creditos: Number(form.creditos),
        prerrequisitos: form.prerrequisitos
          ? String(form.prerrequisitos).trim()
          : "Ninguno",
        tipo: form.tipo,
        id_area: Number(form.id_area),
      };

      await updateSubject(id, payload);
      success("Materia actualizada correctamente");
      navigate("/admin/subjects", { replace: true });
    } catch (err) {
      console.error(err);
      error("No se pudo actualizar la materia");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Editar materia">
        <div className="text-center py-8 text-gray-500">
          Cargando información...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Editar materia">
      <div className="w-full max-w-5xl mx-auto py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Código y Créditos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Código
              </label>
              <FieldText
                name="codigo"
                value={form.codigo}
                onChange={handleChange}
                placeholder="Ej: 1155101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Créditos
              </label>
              <FieldText
                name="creditos"
                type="number"
                value={form.creditos}
                onChange={handleChange}
                placeholder="Ej: 4"
              />
            </div>
          </div>

          {/* Nombre y Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Nombre
              </label>
              <FieldText
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Análisis de Algoritmos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Tipo
              </label>
              <SelectField
                value={
                  subjectTypes.find((t) => t.value === form.tipo) || null
                }
                onChange={handleSelectType}
                options={subjectTypes}
                isClearable={false}
              />
            </div>
          </div>

          {/* Semestre */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Semestre
            </label>
            <FieldText
              name="semestre"
              value={form.semestre}
              onChange={handleChange}
              placeholder="Ej: 6"
            />
          </div>

          {/* Prerrequisitos */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Prerrequisitos
            </label>
            <FieldText
              name="prerrequisitos"
              value={form.prerrequisitos}
              onChange={handleChange}
              placeholder="Ej: 1155101, 1155102 o 'Ninguno'"
            />
          </div>

          {/* Área */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Área del conocimiento
            </label>
            <SelectField
              value={
                areaOptions.find(
                  (a) => String(a.value) === String(form.id_area)
                ) || null
              }
              onChange={handleSelectArea}
              options={areaOptions}
              isClearable={true}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 justify-center pt-4">
            <Button
              type="submit"
              text={isSubmitting ? "Actualizando..." : "Actualizar"}
              disabled={isSubmitting}
            />
            <Button
              type="button"
              variant="secondary"
              text="Cancelar"
              onClick={() => navigate("/admin/subjects")}
            />
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default FormEditSubject;
