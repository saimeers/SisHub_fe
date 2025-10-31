import React, { useEffect, useMemo, useState } from "react";
import SelectField from "../../../components/ui/SelectField";
import Button from "../../../components/ui/Button";
import { listarParticipantesGrupo } from "../../../services/groupUserServices";

const fieldBase =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600/60";

const IdeaForm = ({
  groupParams, // { codigo_materia, nombre, periodo, anio }
  initialData = {
    titulo: "",
    problematica: "",
    justificacion: "",
    objetivos: "",
    observaciones: "",
  },
  readOnly = false,
  defaultSelectedMembers = [], // array de { value, label }
  onSubmit,
}) => {
  const [form, setForm] = useState(initialData);
  const [membersOptions, setMembersOptions] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState(
    defaultSelectedMembers
  );
  const isReadOnly = readOnly;

  useEffect(() => {
    setForm(initialData);
    // Dependemos de campos primitivos para no disparar en cada render por nueva referencia
  }, [
    initialData?.titulo,
    initialData?.problematica,
    initialData?.justificacion,
    initialData?.objetivos,
    initialData?.observaciones,
  ]);

  useEffect(() => {
    const loadParticipants = async () => {
      if (!groupParams) return;
      const { codigo_materia, nombre, periodo, anio } = groupParams;
      try {
        const data = await listarParticipantesGrupo(
          codigo_materia,
          nombre,
          periodo,
          anio
        );
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
  }, [
    groupParams?.codigo_materia,
    groupParams?.nombre,
    groupParams?.periodo,
    groupParams?.anio,
  ]);

  const handleChange = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const [membersText, setMembersText] = useState("");

  const canSubmit = useMemo(() => {
    return (
      !isReadOnly &&
      form.titulo.trim() &&
      form.problematica.trim() &&
      form.justificacion.trim() &&
      form.objetivos.trim() &&
      membersText.trim().length > 0
    );
  }, [form, membersText, isReadOnly]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onSubmit) return;
    const integrantes = membersText
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((nombre) => ({ nombre }));
    const payload = {
      ...form,
      observaciones: form.observaciones || "",
      integrantes,
    };
    onSubmit(payload);
  };

  const handleAction = (decision) => {
    if (!onSubmit) return;
    const integrantes = membersText
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((nombre) => ({ nombre }));
    const payload = {
      ...form,
      observaciones: form.observaciones || "",
      integrantes,
      decision,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Título
            </label>
            <input
              className={fieldBase}
              placeholder="Escribe el título del proyecto"
              value={form.titulo}
              onChange={handleChange("titulo")}
              disabled={isReadOnly}
            />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Problemática
            </label>
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
            <label className="block text-gray-800 font-semibold mb-2">
              Planteamiento de solución
            </label>
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
            <label className="block text-gray-800 font-semibold mb-2">
              Objetivos
            </label>
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
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-2">
          <label className="block text-gray-800 font-semibold mb-2">Integrantes</label>
          <textarea
            className={`${fieldBase} min-h-[140px] resize-none`}
            placeholder="Escribe los integrantes, uno por línea o separados por coma"
            value={membersText}
            onChange={(e) => setMembersText(e.target.value)}
            disabled={isReadOnly}
          />
        </div>
        <div className="lg:col-span-3">
          <label className="block text-gray-800 font-semibold mb-2">Observaciones</label>
          <textarea
            className={`${fieldBase} min-h-[120px] resize-none`}
            placeholder="Escribe tus observaciones (opcional)"
            value={form.observaciones}
            onChange={handleChange("observaciones")}
            disabled={isReadOnly}
          />
        </div>
        <div className="lg:col-span-5 flex justify-center gap-3 flex-wrap">
          {!isReadOnly && (
            <>
              <Button
                type="button"
                text="Aceptar sin observaciones"
                disabled={Boolean(String(form.observaciones || "").trim())}
                onClick={() => handleAction("aceptar_sin_observaciones")}
              />
              <Button
                type="button"
                text="Aceptar con observaciones"
                disabled={!String(form.observaciones || "").trim()}
                onClick={() => handleAction("aceptar_con_observaciones")}
              />
              <Button
                type="button"
                text="Rechazar"
                disabled={false}
                onClick={() => handleAction("rechazar")}
              />
            </>
          )}
        </div>
      </div>
    </form>
  );
};

export default IdeaForm;
