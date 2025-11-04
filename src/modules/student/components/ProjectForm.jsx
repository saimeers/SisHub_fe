import React, { useState } from 'react';
import { Rocket } from 'lucide-react';
import Button from '../../../components/ui/Button';

const ProjectForm = ({ ideaData, onSubmit, observacion = null, userData }) => {
  const [formData, setFormData] = useState({
    codigo_usuario: userData.codigo,
    linea_investigacion: '',
    tecnologias: '',
    palabras_clave: ''
  });

  const handleSubmitClick = () => {
    if (formData.linea_investigacion.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Completar Información del Proyecto</h2>
      
      {observacion && (
        <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4">
          <p className="text-sm font-semibold text-amber-800 mb-2">Observaciones previas del docente:</p>
          <p className="text-gray-700 text-sm">{observacion}</p>
        </div>
      )}

      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Idea Aprobada: {ideaData.titulo}</h3>
        <p className="text-sm text-gray-600">{ideaData.problema}</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-gray-800 font-semibold mb-2">
            Línea de Investigación <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Ej: Inteligencia Artificial, Desarrollo Web, IoT"
            value={formData.linea_investigacion}
            onChange={(e) => setFormData({ ...formData, linea_investigacion: e.target.value })}
            maxLength={150}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.linea_investigacion.length}/150 caracteres</p>
        </div>

        <div>
          <label className="block text-gray-800 font-semibold mb-2">Tecnologías</label>
          <input
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Ej: React, Node.js, PostgreSQL"
            value={formData.tecnologias}
            onChange={(e) => setFormData({ ...formData, tecnologias: e.target.value })}
            maxLength={150}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.tecnologias.length}/150 caracteres</p>
        </div>

        <div>
          <label className="block text-gray-800 font-semibold mb-2">Palabras Clave</label>
          <input
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Ej: Machine Learning, API REST, Automatización"
            value={formData.palabras_clave}
            onChange={(e) => setFormData({ ...formData, palabras_clave: e.target.value })}
            maxLength={150}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.palabras_clave.length}/150 caracteres</p>
        </div>

        <div className="flex justify-end">
          <Button
            text={
              <>
                <Rocket className="w-5 h-5 inline mr-2" />
                Crear Proyecto
              </>
            }
            onClick={handleSubmitClick}
            disabled={!formData.linea_investigacion.trim()}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;