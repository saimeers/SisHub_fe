import React, { useEffect, useState, useMemo } from "react";
import AdminLayout from "../layouts/AdminLayout";
import FieldText from "../../../components/ui/FieldText";
import SelectField from "../../../components/ui/SelectField";
import Button from "../../../components/ui/Button";
import { listarAreas } from "../../../services/areaServices";
import {
  fetchSubjects,
  updateSubjectByCode,
  getSubjectCodes,
} from "../../../services/materiaServices";
import { useToast } from "../../../hooks/useToast";
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
  const [existingCodes, setExistingCodes] = useState([]);
  const [selectedPrerequisites, setSelectedPrerequisites] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCodes, setIsLoadingCodes] = useState(true);
  const { success, error } = useToast();
  const navigate = useNavigate();
  const { codigo } = useParams(); // código de la materia (pero usaremos ID)

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log("🔹 Solicitando listado de materias para encontrar:", codigo);
        
        // Cargar todas las materias para encontrar la que tiene el código
        const allSubjects = await fetchSubjects();
        const subjectsList = Array.isArray(allSubjects) ? allSubjects : [];
        const subjectData = subjectsList.find(subject => subject.codigo === codigo);
        
        if (!subjectData) {
          error("No se encontró la materia con el código especificado");
          navigate("/admin/subjects");
          return;
        }
        
        console.log("✅ Materia encontrada:", subjectData);

        console.log("🔹 Solicitando listado de áreas...");
        const list = await listarAreas();
        console.log("✅ Áreas recibidas:", list);

        const areasList = Array.isArray(list) ? list : [];
        setAreas(areasList);

        // Cargar códigos existentes para prerrequisitos
        setIsLoadingCodes(true);
        let codesList = [];
        try {
          const codes = await getSubjectCodes();
          codesList = Array.isArray(codes) ? codes : [];
          setExistingCodes(codesList);
          setIsLoadingCodes(false);
        } catch (err) {
          console.warn("No se pudieron cargar los códigos:", err);
          setExistingCodes([]);
          setIsLoadingCodes(false);
        }

        setForm({
          codigo: subjectData.codigo || "",
          nombre: subjectData.nombre || "",
          semestre: subjectData.semestre || "",
          creditos: subjectData.creditos || "",
          prerrequisitos: subjectData.prerrequisitos || "",
          tipo: subjectData.tipo || "Obligatoria",
          id_area: subjectData.id_area || null,
        });

        // Configurar prerrequisitos seleccionados
        if (subjectData.prerrequisitos && subjectData.prerrequisitos !== "Ninguno") {
          const prereqCodes = subjectData.prerrequisitos.split(',').map(code => code.trim());
          const selectedPrereqs = prereqCodes.map(code => {
            const existingCode = codesList.find(c => c.codigo === code);
            return existingCode ? { value: code, label: `${code} - ${existingCode.nombre}` } : { value: code, label: code };
          });
          setSelectedPrerequisites(selectedPrereqs);
        } else {
          setSelectedPrerequisites([{ value: "ninguno", label: "Ninguno" }]);
        }
      } catch (err) {
        console.error("❌ Error al cargar materia:", err);
        error("No se pudo cargar la información de la materia");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [codigo]); // ← solo depende del código

  const areaOptions = useMemo(
    () => areas.map((a) => ({ value: a.id_area, label: a.nombre })),
    [areas]
  );

  const prerequisiteOptions = useMemo(() => {
    const options = existingCodes.map((code) => ({
      value: code.codigo,
      label: `${code.codigo} - ${code.nombre}`,
    }));
    
    // Agregar opción "Ninguno" al inicio
    return [
      { value: "ninguno", label: "Ninguno" },
      ...options
    ];
  }, [existingCodes]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validación especial para créditos - solo números enteros positivos
    if (name === "creditos") {
      const intValue = parseInt(value);
      if (value === "" || (Number.isInteger(intValue) && intValue > 0)) {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
    }
    // Validación especial para semestre - solo números positivos (no cero)
    else if (name === "semestre") {
      if (value === "" || (/^\d+$/.test(value) && parseInt(value) > 0)) {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectType = (opt) => {
    setForm((prev) => ({ ...prev, tipo: opt ? opt.value : "" }));
  };

  const handleSelectArea = (opt) => {
    setForm((prev) => ({ ...prev, id_area: opt ? opt.value : null }));
  };

  const handlePrerequisitesChange = (selectedOptions) => {
    const options = selectedOptions || [];
    setSelectedPrerequisites(options);
    
    // Si se selecciona "ninguno", limpiar otras selecciones
    if (options.some && options.some(opt => opt.value === "ninguno")) {
      setSelectedPrerequisites([{ value: "ninguno", label: "Ninguno" }]);
      setForm((prev) => ({ ...prev, prerrequisitos: "Ninguno" }));
    } else {
      // Filtrar "ninguno" si está seleccionado junto con otros
      const filteredOptions = options.filter ? options.filter(opt => opt.value !== "ninguno") : [];
      setSelectedPrerequisites(filteredOptions);
      
      if (filteredOptions.length === 0) {
        setForm((prev) => ({ ...prev, prerrequisitos: "" }));
      } else {
        const codes = filteredOptions.map(opt => opt.value).join(", ");
        setForm((prev) => ({ ...prev, prerrequisitos: codes }));
      }
    }
  };

  const validate = () => {
    if (!form.codigo || !form.nombre || !form.semestre || !form.tipo)
      return "Complete los campos requeridos.";
    
    // Validar que semestre sea un número entero positivo (mayor que cero)
    const semestreNum = parseInt(form.semestre);
    if (!Number.isInteger(semestreNum) || semestreNum <= 0) {
      return "El semestre debe ser un número entero mayor que cero";
    }
    
    // Validar que créditos sea un número entero positivo
    const creditosNum = parseInt(form.creditos);
    if (!Number.isInteger(creditosNum) || creditosNum <= 0) {
      return "Los créditos deben ser un número entero positivo";
    }
    
    if (!form.id_area) return "Seleccione un área del conocimiento.";
    
    // Validar prerrequisitos - si no se seleccionó "ninguno", debe tener al menos uno
    if (selectedPrerequisites.length === 0) {
      return "Seleccione al menos un prerrequisito o 'Ninguno'";
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) return error(msg);

    setIsSubmitting(true);
    try {
      // Crear payload solo con los campos que se quieren modificar
      const payload = {};
      
      if (form.nombre) payload.nombre = String(form.nombre).trim();
      if (form.semestre) payload.semestre = String(form.semestre).trim();
      if (form.creditos) payload.creditos = parseInt(form.creditos);
      if (form.prerrequisitos) payload.prerrequisitos = String(form.prerrequisitos).trim();
      if (form.tipo) payload.tipo = form.tipo;
      if (form.id_area) payload.id_area = Number(form.id_area);

      await updateSubjectByCode(codigo, payload);
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
                value={form.creditos}
                onChange={handleChange}
                placeholder="Ej: 3"
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength="2"
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
                value={subjectTypes.find((t) => t.value === form.tipo) || null}
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
              placeholder="Ej: 3 o 10"
              maxLength="2"
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
            />
          </div>

          {/* Prerrequisitos */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Prerrequisitos
            </label>
            <SelectField
              id="prerrequisitos"
              name="prerrequisitos"
              value={selectedPrerequisites}
              onChange={handlePrerequisitesChange}
              options={prerequisiteOptions}
              placeholder={
                isLoadingCodes
                  ? "Cargando materias..."
                  : prerequisiteOptions.length === 0
                  ? "No hay materias disponibles"
                  : "Seleccione los prerrequisitos"
              }
              isMulti={true}
              isClearable={true}
              disabled={isLoadingCodes}
            />
            {isLoadingCodes && (
              <div className="text-sm text-gray-500 mt-1">
                Cargando materias disponibles...
              </div>
            )}
            {!isLoadingCodes && prerequisiteOptions.length === 0 && (
              <div className="text-sm text-red-500 mt-1">
                No se pudieron cargar las materias
              </div>
            )}
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
