import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import FieldText from "../../components/ui/FieldText";
import SelectField from "../../components/ui/SelectField";
import Button from "../../components/ui/Button";
import { listarAreas } from "../../services/areaServices";
import { createSubject } from "../../services/materiaServices";
import { useToast } from "../../hooks/useToast";
import { useNavigate } from "react-router-dom";

const initialForm = {
  codigo: "",
  nombre: "",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadAreas = async () => {
      setIsLoadingAreas(true);
      
      try {
        const list = await listarAreas();
        const areasList = Array.isArray(list) ? list : [];
        
        // Establecer las áreas y el estado de carga al mismo tiempo
        setAreas(areasList);
        setIsLoadingAreas(false);
        
      } catch (err) {
        error(err?.message || "Error al cargar áreas");
        setIsLoadingAreas(false);
      }
    };
    
    loadAreas();
  }, []); // Dependencias vacías para que solo se ejecute una vez

  const areaOptions = useMemo(() => {
    return areas.map((a) => ({
      value: a.id_area,
      label: a.nombre,
    }));
  }, [areas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación especial para créditos
    if (name === 'creditos') {
      const numericValue = parseFloat(value);
      if (value === '' || (numericValue >= 0 && !isNaN(numericValue))) {
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

  const validate = () => {
    if (!form.codigo || !form.nombre || !form.tipo) return "Complete los campos requeridos";
    const creditosNum = Number(form.creditos);
    if (!Number.isFinite(creditosNum) || creditosNum <= 0) return "Créditos debe ser numérico y mayor a 0";
    if (!form.id_area) return "Seleccione un área";
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
        creditos: Number(form.creditos),
        prerrequisitos: form.prerrequisitos ? String(form.prerrequisitos).trim() : "Ninguno",
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primera fila: Código y Créditos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="codigo" className="block text-sm font-medium text-black mb-2">
                Código
              </label>
              <FieldText id="codigo" name="codigo" value={form.codigo} onChange={handleChange} placeholder="Ingrese el código" />
            </div>

            <div>
              <label htmlFor="creditos" className="block text-sm font-medium text-black mb-2">
                Créditos
              </label>
              <FieldText 
                id="creditos" 
                name="creditos" 
                value={form.creditos} 
                onChange={handleChange} 
                placeholder="0" 
                type="number"
                min="0"
                style={{ 
                  appearance: 'textfield',
                  MozAppearance: 'textfield'
                }}
                onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => {
                  // Prevenir teclas de incremento/decremento
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          </div>

          {/* Segunda fila: Nombre y Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-black mb-2">
                Nombre
              </label>
              <FieldText id="nombre" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ingrese el nombre" />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Tipo</label>
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

          {/* Tercera fila: Prerrequisito (ancho completo) */}
          <div>
            <label htmlFor="prerrequisitos" className="block text-sm font-medium text-black mb-2">
              Prerrequisito
            </label>
            <FieldText
              id="prerrequisitos"
              name="prerrequisitos"
              value={form.prerrequisitos}
              onChange={handleChange}
              placeholder="Ej: 1155101, 1155102 o 'Ninguno'"
            />
          </div>

          {/* Cuarta fila: Área del conocimiento (ancho completo) */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">Área del conocimiento</label>
            <SelectField
              id="id_area"
              name="id_area"
              value={areaOptions.find((o) => String(o.value) === String(form.id_area)) || null}
              onChange={handleSelectArea}
              options={areaOptions}
              placeholder={isLoadingAreas ? "Cargando áreas..." : areaOptions.length === 0 ? "No hay áreas disponibles" : "Seleccione un área"}
              isClearable={true}
              disabled={isLoadingAreas}
            />
            {isLoadingAreas && <div className="text-sm text-gray-500 mt-1">Cargando áreas...</div>}
            {!isLoadingAreas && areaOptions.length === 0 && <div className="text-sm text-red-500 mt-1">No se pudieron cargar las áreas</div>}
          </div>

          {/* Botones */}
          <div className="flex gap-4 justify-center pt-4">
            <Button type="submit" text={isSubmitting ? "Registrando..." : "Registrar"} disabled={isSubmitting} />
            <Button type="button" variant="secondary" text="Cancelar" onClick={() => navigate("/admin/subjects")} />
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default FormCreateSubject;


