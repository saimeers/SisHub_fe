import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import FieldText from "../../../components/ui/FieldText";
import SelectField from "../../../components/ui/SelectField";
import Button from "../../../components/ui/Button";
import { listarAreas } from "../../../services/areaServices";
import { createSubject, getSubjectCodes, uploadSubjectsCSV } from "../../../services/materiaServices";
import { useToast } from "../../../hooks/useToast";
import { useNavigate } from "react-router-dom";

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

const FormCreateSubject = () => {
  const [form, setForm] = useState(initialForm);
  const [areas, setAreas] = useState([]);
  const [existingCodes, setExistingCodes] = useState([]);
  const [selectedPrerequisites, setSelectedPrerequisites] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const [isLoadingCodes, setIsLoadingCodes] = useState(true);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      // Cargar áreas
      setIsLoadingAreas(true);
      try {
        const list = await listarAreas();
        const areasList = Array.isArray(list) ? list : [];
        setAreas(areasList);
        setIsLoadingAreas(false);
      } catch (err) {
        console.warn("No se pudieron cargar las áreas:", err);
        // Usar datos mock para áreas mientras se resuelve el endpoint
        const mockAreas = [
          { id_area: 1, nombre: "Ciencias Básicas" },
          { id_area: 2, nombre: "Ingeniería Aplicada" },
          { id_area: 3, nombre: "Formación Complementaria" },
          { id_area: 4, nombre: "Ciencias Básicas en Ingeniería" },
        ];
        setAreas(mockAreas);
        setIsLoadingAreas(false);
      }

      // Cargar códigos existentes
      setIsLoadingCodes(true);
      try {
        const codes = await getSubjectCodes();
        const codesList = Array.isArray(codes) ? codes : [];
        setExistingCodes(codesList);
        setIsLoadingCodes(false);
      } catch (err) {
        console.warn("No se pudieron cargar los códigos:", err);
        setExistingCodes([]);
        setIsLoadingCodes(false);
      }
    };

    loadData();
  }, []); // Dependencias vacías para que solo se ejecute una vez

  const areaOptions = useMemo(() => {
    return areas.map((a) => ({
      value: a.id_area,
      label: a.nombre,
    }));
  }, [areas]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validación especial para créditos - solo números enteros positivos
    if (name === "creditos") {
      const intValue = parseInt(value);
      if (value === "" || (Number.isInteger(intValue) && intValue > 0)) {
        setForm((f) => ({ ...f, [name]: value }));
      }
    }
    // Validación especial para código - solo números
    else if (name === "codigo") {
      if (value === "" || /^\d+$/.test(value)) {
        setForm((f) => ({ ...f, [name]: value }));
      }
    }
    // Validación especial para semestre - solo números positivos (no cero)
    else if (name === "semestre") {
      if (value === "" || (/^\d+$/.test(value) && parseInt(value) > 0)) {
        setForm((f) => ({ ...f, [name]: value }));
      }
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSelectArea = (opt) => {
    setForm((f) => ({ ...f, id_area: opt ? opt.value : null }));
  };

  const handleSelectType = (opt) => {
    setForm((f) => ({ ...f, tipo: opt ? opt.value : "" }));
  };

  const handlePrerequisitesChange = (selectedOptions) => {
    const options = selectedOptions || [];
    setSelectedPrerequisites(options);
    
    // Si se selecciona "ninguno", limpiar otras selecciones
    if (options.some && options.some(opt => opt.value === "ninguno")) {
      setSelectedPrerequisites([{ value: "ninguno", label: "Ninguno" }]);
      setForm((f) => ({ ...f, prerrequisitos: "Ninguno" }));
    } else {
      // Filtrar "ninguno" si está seleccionado junto con otros
      const filteredOptions = options.filter ? options.filter(opt => opt.value !== "ninguno") : [];
      setSelectedPrerequisites(filteredOptions);
      
      if (filteredOptions.length === 0) {
        setForm((f) => ({ ...f, prerrequisitos: "" }));
      } else {
        const codes = filteredOptions.map(opt => opt.value).join(", ");
        setForm((f) => ({ ...f, prerrequisitos: codes }));
      }
    }
  };

  const validate = () => {
    if (!form.codigo || !form.nombre || !form.semestre || !form.tipo)
      return "Complete los campos requeridos";
    
    // Validar que el código no exista
    const codeExists = existingCodes.some(code => code.codigo === form.codigo);
    if (codeExists) {
      return "El código de la materia ya existe";
    }
    
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
    
    if (!form.id_area) return "Seleccione un área";
    
    // Validar prerrequisitos - si no se seleccionó "ninguno", debe tener al menos uno
    if (selectedPrerequisites.length === 0) {
      return "Seleccione al menos un prerrequisito o 'Ninguno'";
    }
    
    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name !== "materias.csv") {
        error("El archivo debe llamarse 'materias.csv'");
        setSelectedFile(null);
        return;
      }
      if (!file.name.endsWith('.csv')) {
        error("El archivo debe ser de tipo CSV");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleCSVUpload = async () => {
    if (!selectedFile) {
      error("Seleccione un archivo CSV");
      return;
    }

    setIsUploadingCSV(true);
    try {
      await uploadSubjectsCSV(selectedFile);
      success("Materias creadas con éxito");
      
      // Limpiar el input de archivo
      setSelectedFile(null);
      const fileInput = document.getElementById('csvFile');
      if (fileInput) fileInput.value = '';
      
      // Redirigir a la vista de materias después de un breve delay
      setTimeout(() => {
        navigate("/admin/subjects", { replace: true });
      }, 2000); // 2 segundos para que el usuario vea el mensaje
      
    } catch (err) {
      error(err?.message || "Error al cargar el archivo CSV");
    } finally {
      setIsUploadingCSV(false);
    }
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
        creditos: parseInt(form.creditos),
        prerrequisitos: form.prerrequisitos || "Ninguno",
        tipo: form.tipo,
        id_area: Number(form.id_area),
      };
      const created = await createSubject(payload);
      success("Materia registrada correctamente");
      navigate("/admin/subjects", { replace: true, state: { created } });
    } catch (err) {
      error(err?.message || "No se pudo registrar la materia");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Crear materia">
      <div className="w-full max-w-5xl mx-auto py-8">
        {/* Sección de carga de CSV */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Cargar materias desde archivo CSV
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1">
              <label
                htmlFor="csvFile"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Seleccionar archivo materias.csv
              </label>
              <input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                disabled={isUploadingCSV}
              />
              <p className="text-xs text-gray-500 mt-1">
                El archivo debe llamarse "materias.csv" y tener la estructura: codigo,nombre,semestre,creditos,prerrequisitos,tipo,id_area
              </p>
            </div>
            <Button
              type="button"
              text={isUploadingCSV ? "Cargando..." : "Cargar CSV"}
              onClick={handleCSVUpload}
              disabled={!selectedFile || isUploadingCSV}
              variant="secondary"
            />
          </div>
          {selectedFile && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                Archivo seleccionado: <span className="font-medium">{selectedFile.name}</span>
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primera fila: Código y Créditos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="codigo"
                className="block text-sm font-medium text-black mb-2"
              >
                Código
              </label>
              <FieldText
                id="codigo"
                name="codigo"
                value={form.codigo}
                onChange={handleChange}
                placeholder="Ej: 1155101"
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
              />
              {form.codigo && existingCodes.some(code => code.codigo === form.codigo) && (
                <div className="text-sm text-red-500 mt-1">
                  Este código ya existe
                </div>
              )}
              {isLoadingCodes && (
                <div className="text-sm text-gray-500 mt-1">
                  Verificando códigos existentes...
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="creditos"
                className="block text-sm font-medium text-black mb-2"
              >
                Créditos
              </label>
              <FieldText
                id="creditos"
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

          {/* Segunda fila: Nombre y Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-black mb-2"
              >
                Nombre
              </label>
              <FieldText
                id="nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ingrese el nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Tipo
              </label>
              <SelectField
                id="tipo"
                name="tipo"
                value={subjectTypes.find((t) => t.value === form.tipo) || null}
                onChange={handleSelectType}
                options={subjectTypes}
                placeholder="Seleccione el tipo"
              />
            </div>
          </div>

          {/* Tercera fila: Semestre (ancho completo) */}
          <div>
            <label
              htmlFor="semestre"
              className="block text-sm font-medium text-black mb-2"
            >
              Semestre
            </label>
            <FieldText
              id="semestre"
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

          {/* Cuarta fila: Prerrequisitos (ancho completo) */}
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

          {/* Quinta fila: Área del conocimiento (ancho completo) */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Área del conocimiento
            </label>
            <SelectField
              id="id_area"
              name="id_area"
              value={
                areaOptions.find(
                  (o) => String(o.value) === String(form.id_area)
                ) || null
              }
              onChange={handleSelectArea}
              options={areaOptions}
              placeholder={
                isLoadingAreas
                  ? "Cargando áreas..."
                  : areaOptions.length === 0
                  ? "No hay áreas disponibles"
                  : "Seleccione un área"
              }
              isClearable={true}
              disabled={isLoadingAreas}
            />
            {isLoadingAreas && (
              <div className="text-sm text-gray-500 mt-1">
                Cargando áreas...
              </div>
            )}
            {!isLoadingAreas && areaOptions.length === 0 && (
              <div className="text-sm text-red-500 mt-1">
                No se pudieron cargar las áreas
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-4 justify-center pt-4">
            <Button
              type="submit"
              text={isSubmitting ? "Registrando..." : "Registrar"}
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

export default FormCreateSubject;
