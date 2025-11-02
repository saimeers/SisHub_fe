import React, { useEffect, useMemo, useState } from "react";
import SelectField from "./SelectField";
import Button from "./Button";
import { listarParticipantesGrupo } from "../../services/groupUserServices";

const fieldBase = "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600/60";

const IdeaForm = ({
  groupParams,
  initialData = { 
    titulo: "", 
    problematica: "", 
    justificacion: "", 
    objetivo_general: "",
    objetivos_especificos: [],
    integrantes: [],
  },
  readOnly = false,
  defaultSelectedMembers = [],
  onSubmit,
  currentUserCode = null,
  showAdoptButton = false,
  onAdopt = null,
}) => {
  const [form, setForm] = useState({
    titulo: initialData.titulo || "",
    problematica: initialData.problematica || "",
    justificacion: initialData.justificacion || "",
    objetivo_general: initialData.objetivo_general || "",
    objetivos_especificos: initialData.objetivos_especificos?.length > 0 
      ? initialData.objetivos_especificos 
      : [""],
    integrantes: initialData.integrantes || [],
  });
  
  const [membersOptions, setMembersOptions] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState(defaultSelectedMembers);

  useEffect(() => {
    setForm({
      titulo: initialData.titulo || "",
      problematica: initialData.problematica || "",
      justificacion: initialData.justificacion || "",
      objetivo_general: initialData.objetivo_general || "",
      objetivos_especificos: initialData.objetivos_especificos?.length > 0 
        ? initialData.objetivos_especificos 
        : [""],
      integrantes: initialData.integrantes || [],
    });
  }, [
    initialData?.titulo,
    initialData?.problematica,
    initialData?.justificacion,
    initialData?.objetivo_general,
    initialData?.objetivos_especificos,
    initialData?.integrantes
  ]);

  useEffect(() => {
    const loadParticipants = async () => {
      if (!groupParams) return;
      const { codigo_materia, nombre, periodo, anio } = groupParams;
      try {
        const data = await listarParticipantesGrupo(codigo_materia, nombre, periodo, anio);
        
        // Filtrar: excluir al usuario actual y profesores (códigos de 4 dígitos)
        const filteredData = (Array.isArray(data) ? data : []).filter((p) => {
          const codigo = String(p.codigo || "");
          
          // Excluir profesores (códigos de 4 dígitos)
          if (codigo.length === 4) return false;
          
          // Excluir al usuario actual (el líder)
          if (currentUserCode && codigo === String(currentUserCode)) return false;
          
          return true;
        });
        
        const options = filteredData.map((p) => ({
          value: p.codigo,
          label: p.nombre,
        }));
        
        setMembersOptions(options);
        if (defaultSelectedMembers.length > 0) {
          setSelectedMembers(defaultSelectedMembers);
        }
      } catch (e) {
        console.error("Error cargando participantes", e);
        setMembersOptions([]);
      }
    };
    loadParticipants();
  }, [groupParams?.codigo_materia, groupParams?.nombre, groupParams?.periodo, groupParams?.anio, currentUserCode, defaultSelectedMembers]);

  const handleChange = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleObjetivoEspecificoChange = (index, value) => {
    setForm((prev) => {
      const newObjetivos = [...prev.objetivos_especificos];
      newObjetivos[index] = value;
      return { ...prev, objetivos_especificos: newObjetivos };
    });
  };

  const agregarObjetivoEspecifico = () => {
    if (form.objetivos_especificos.length < 4) {
      setForm((prev) => ({
        ...prev,
        objetivos_especificos: [...prev.objetivos_especificos, ""]
      }));
    }
  };

  const eliminarObjetivoEspecifico = (index) => {
    if (form.objetivos_especificos.length > 1) {
      setForm((prev) => ({
        ...prev,
        objetivos_especificos: prev.objetivos_especificos.filter((_, i) => i !== index)
      }));
    }
  };

  const canSubmit = useMemo(() => {
    if (readOnly) return false;
    const hasObjetivosEspecificos = form.objetivos_especificos.some(obj => obj.trim());
    return (
      form.titulo.trim() &&
      form.problematica.trim() &&
      form.justificacion.trim() &&
      form.objetivo_general.trim() &&
      hasObjetivosEspecificos &&
      selectedMembers.length > 0
    );
  }, [form, selectedMembers, readOnly]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onSubmit || !canSubmit) return;
    console.log(selectedMembers.map((m) => m.value));
    const payload = {
      titulo: form.titulo,
      problematica: form.problematica,
      justificacion: form.justificacion,
      objetivo_general: form.objetivo_general,
      objetivos_especificos: form.objetivos_especificos.filter(obj => obj.trim()),
      integrantes: selectedMembers.map((m) => m.value),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Columna izquierda: Título, Problemática e Integrantes */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Título</label>
            <input
              className={fieldBase}
              placeholder="Escribe el título del proyecto"
              value={form.titulo}
              onChange={handleChange("titulo")}
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">Problemática</label>
            <textarea
              className={`${fieldBase} min-h-[280px] resize-none`}
              placeholder="¿Cuál es el problema que buscas resolver?"
              value={form.problematica}
              onChange={handleChange("problematica")}
              disabled={readOnly}
            />
          </div>

          {/* Integrantes */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Integrantes</label>
            <SelectField
              isMulti
              value={selectedMembers}
              onChange={(val) => setSelectedMembers(val || [])}
              options={membersOptions}
              placeholder="Elige integrantes de tu equipo"
              disabled={readOnly}
            />
          </div>
        </div>

        {/* Columna derecha: Justificación y Objetivos */}
        <div className="lg:col-span-3 space-y-8">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Justificación</label>
            <textarea
              className={`${fieldBase} min-h-[140px] resize-none`}
              placeholder="Describe brevemente la solución propuesta"
              value={form.justificacion}
              onChange={handleChange("justificacion")}
              disabled={readOnly}
            />
          </div>

          {/* Objetivo General */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Objetivo General</label>
            <textarea
              className={`${fieldBase} min-h-[100px] resize-none`}
              placeholder="Describe el objetivo principal del proyecto"
              value={form.objetivo_general}
              onChange={handleChange("objetivo_general")}
              disabled={readOnly}
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {form.objetivo_general.length}/100 caracteres
            </p>
          </div>

          {/* Objetivos Específicos */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Objetivos Específicos</label>
            <div className="space-y-3">
              {form.objetivos_especificos.map((objetivo, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <textarea
                      className={`${fieldBase} min-h-[80px] resize-none`}
                      placeholder={`Objetivo específico ${index + 1}`}
                      value={objetivo}
                      onChange={(e) => handleObjetivoEspecificoChange(index, e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  {!readOnly && form.objetivos_especificos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarObjetivoEspecifico(index)}
                      className="mt-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar objetivo"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              
              {!readOnly && form.objetivos_especificos.length < 4 && (
                <button
                  type="button"
                  onClick={agregarObjetivoEspecifico}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-red-600 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-medium">Agregar objetivo específico</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3">
        {showAdoptButton && onAdopt && (
          <Button
            type="button"
            text="Adoptar"
            onClick={onAdopt}
          />
        )}
        {!readOnly && (
          <Button 
            type="submit" 
            text="Enviar a Revisión" 
            disabled={!canSubmit}
          />
        )}
      </div>
    </form>
  );
};

export default IdeaForm;