import React, { useEffect, useMemo, useState } from "react";
import SelectField from "./SelectField";
import Button from "./Button";
import { listarParticipantesGrupo } from "../../services/groupUserServices";

const fieldBase = "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600/60";

const IdeaForm = ({
  groupParams, // { codigo_materia, nombre, periodo, anio }
  initialData = { titulo: "", problematica: "", justificacion: "", objetivos: "" },
  readOnly = false,
  defaultSelectedMembers = [], // array de { value, label }
  onSubmit,
}) => {
  const [form, setForm] = useState(initialData);
  const [membersOptions, setMembersOptions] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState(defaultSelectedMembers);
  const isReadOnly = readOnly;

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  useEffect(() => {
    const loadParticipants = async () => {
      if (!groupParams) return;
      const { codigo_materia, nombre, periodo, anio } = groupParams;
      try {
        const data = await listarParticipantesGrupo(codigo_materia, nombre, periodo, anio);
        const options = (Array.isArray(data) ? data : []).map((p) => ({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupParams?.codigo_materia, groupParams?.nombre, groupParams?.periodo, groupParams?.anio]);

  const handleChange = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit = useMemo(() => {
    return (
      !isReadOnly &&
      form.titulo.trim() &&
      form.problematica.trim() &&
      form.justificacion.trim() &&
      form.objetivos.trim() &&
      selectedMembers.length > 0
    );
  }, [form, selectedMembers, isReadOnly]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onSubmit) return;
    const payload = {
      ...form,
      integrantes: selectedMembers.map((m) => ({ codigo: m.value, nombre: m.label })),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Título</label>
            <input
              className={fieldBase}
              placeholder="Escribe el título del proyecto"
              value={form.titulo}
              onChange={handleChange("titulo")}
              disabled={isReadOnly}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">Problemática</label>
            <textarea
              className={`${fieldBase} min-h-[355px] resize-none`}
              placeholder="¿Cuál es el problema que buscas resolver?"
              value={form.problematica}
              onChange={handleChange("problematica")}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Columna derecha: Justificación y Objetivos (3 de 5 partes) */}
        <div className="lg:col-span-3 space-y-8">
          {/* Justificación (cambié el nombre según mockup: "Planteamiento de solución") */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Planteamiento de solución</label>
            <textarea
              className={`${fieldBase} min-h-[200px] resize-none`}
              placeholder="Describe brevemente la solución propuesta"
              value={form.justificacion}
              onChange={handleChange("justificacion")}
              disabled={isReadOnly}
            />
          </div>

          {/* Objetivos */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Objetivos</label>
            <textarea
              className={`${fieldBase} min-h-[200px] resize-none`}
              placeholder="Enumera los objetivos principales"
              value={form.objetivos}
              onChange={handleChange("objetivos")}
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>

      {/* Integrantes y botón */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
        <div>
          <label className="block text-gray-800 font-semibold mb-2">Integrantes</label>
          <SelectField
            isMulti
            value={selectedMembers}
            onChange={(val) => setSelectedMembers(val || [])}
            options={membersOptions}
            placeholder="Elige integrantes de tu equipo"
            disabled={isReadOnly}
          />
        </div>
        <div className="flex md:justify-end">
          {!isReadOnly && (
            <Button 
              type="submit" 
              text="Enviar a Revisión" 
              disabled={!canSubmit}
            />
          )}
        </div>
      </div>
    </form>
  );
};

export default IdeaForm;