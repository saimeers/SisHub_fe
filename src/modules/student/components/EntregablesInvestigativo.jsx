import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle, XCircle, Loader2, ExternalLink, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import mammoth from 'mammoth';
import {
  crearEntregable,
  actualizarEntregable,
  analizarDocumentoConIA
} from '../../../services/EntregableService';

const EntregablesInvestigativo = ({
  proyecto,
  equipo,
  actividad,
  esquemaInfo,
  entregables,
  currentUserCode,
  onEntregableCreado,
  onEntregableActualizado
}) => {
  const [archivo, setArchivo] = useState(null);
  const [analizando, setAnalizando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [analisisResultado, setAnalisisResultado] = useState(null);

  // Buscar el entregable de tipo DOCUMENTO
  const entregableDocumento = entregables.find(e => e.tipo === 'DOCUMENTO') || null;

  // Extraer nombres de los items seleccionados
  const itemsActividad = actividad?.Actividad_items?.map(ai => ai.Item.nombre) || [];

  const extraerTexto = async (file) => {
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'docx' || extension === 'doc') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else {
      throw new Error('Formato de archivo no soportado. Solo se permiten archivos Word (.doc, .docx)');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten archivos Word (.doc, .docx)');
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no debe superar los 10MB');
      e.target.value = '';
      return;
    }

    // Limpiar estado anterior
    setArchivo(file);
    setAnalisisResultado(null);

    // Analizar automáticamente
    try {
      setAnalizando(true);
      toast.info('Analizando documento...');

      const texto = await extraerTexto(file);
      const resultado = await analizarDocumentoConIA(texto, itemsActividad);

      setAnalisisResultado(resultado);

      if (resultado.analisis) {
        toast.success('Documento válido. Todos los ítems están presentes');
      } else {
        toast.warning('El documento no cumple con todos los requisitos');
      }
    } catch (error) {
      console.error('Error al analizar:', error);
      toast.error(error.message || 'Error al analizar el documento');
      setAnalisisResultado({ analisis: false, faltantes: [] });
    } finally {
      setAnalizando(false);
    }
  };

  const handleSubir = async () => {
    if (!archivo) {
      toast.error('Debes seleccionar un archivo');
      return;
    }

    if (!analisisResultado || !analisisResultado.analisis) {
      toast.error('El documento debe pasar el análisis antes de subirlo');
      return;
    }

    try {
      setSubiendo(true);

      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('tipo', 'DOCUMENTO');
      formData.append('id_actividad', actividad.id_actividad);
      formData.append('id_equipo', equipo.id_equipo);
      formData.append('id_proyecto', proyecto.id_proyecto);
      console.log(entregableDocumento);
      let response;
      if (entregableDocumento) {
        // Actualizar documento existente
        console.log('Actualizando entregable ID:', entregableDocumento.id_entregable);
        response = await actualizarEntregable(
          entregableDocumento.id_entregable,
          formData,
          currentUserCode
        );
        toast.success('Documento actualizado exitosamente');
        
        if (onEntregableActualizado) {
          onEntregableActualizado(response.data || response);
        }
      } else {
        // Crear nuevo documento
        response = await crearEntregable(formData, currentUserCode);
        toast.success('Documento cargado exitosamente');
        
        if (onEntregableCreado) {
          onEntregableCreado(response.data || response);
        }
      }

      // Limpiar formulario
      setArchivo(null);
      setAnalisisResultado(null);
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error al subir:', error);
      toast.error(error.message || 'Error al subir el documento');
    } finally {
      setSubiendo(false);
    }
  };

  const handleVisualizarDocumento = () => {
    if (!entregableDocumento?.url_archivo) return;

    const extension = entregableDocumento.nombre_archivo?.split('.').pop().toLowerCase();

    if (extension === 'doc' || extension === 'docx') {
      // Intentar abrir con Office Online Viewer
      const encodedUrl = encodeURIComponent(entregableDocumento.url_archivo);
      const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`;
      window.open(officeViewerUrl, '_blank');
    } else {
      // Para otros formatos, abrir directamente
      window.open(entregableDocumento.url_archivo, '_blank');
    }
  };

  const handleDescargarDocumento = () => {
    if (!entregableDocumento?.url_archivo) return;

    const link = document.createElement('a');
    link.href = entregableDocumento.url_archivo;
    link.download = entregableDocumento.nombre_archivo || 'documento.docx';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info('Descargando documento...');
  };

const formatearFecha = (fechaString) => {
  if (!fechaString) return 'Fecha no disponible';

  try {
    // Si ya viene formateada (ej: texto sin formato ISO)
    if (typeof fechaString === 'string' && !fechaString.includes('T') && !fechaString.includes('-')) {
      return fechaString;
    }

    const fecha = new Date(fechaString);
    if (isNaN(fecha.getTime())) return fechaString;

    return fecha.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short', // Ejemplo: "nov."
      day: 'numeric',
      timeZone: 'America/Bogota', // asegura que sea hora local Colombia
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha no disponible';
  }
};


  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      {/* Ítems requeridos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Ítems Requeridos en el Documento
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          {itemsActividad.length > 0 ? (
            itemsActividad.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No hay ítems específicos requeridos</p>
          )}
        </div>
      </div>

      {/* Documento actual - Solo se muestra si existe */}
      {entregableDocumento && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Documento Actual</span>
          </div>
          
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-gray-900">
              {entregableDocumento.nombre_archivo}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleVisualizarDocumento}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ver Documento
            </button>
            <button
              onClick={handleDescargarDocumento}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar
            </button>
          </div>
        </div>
      )}

      {/* Subir/Actualizar documento */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {entregableDocumento ? 'Actualizar Documento' : 'Subir Documento'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Formato permitido: Word (.doc, .docx) - Máximo 10MB
          </p>

          <input
            type="file"
            accept=".doc,.docx"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={analizando || subiendo}
          />
          <label
            htmlFor="file-upload"
            className={`inline-block px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors ${
              analizando || subiendo ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Seleccionar archivo Word
          </label>
        </div>

        {/* Archivo seleccionado */}
        {archivo && (
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{archivo.name}</p>
                  <p className="text-xs text-gray-500">
                    {(archivo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {analizando && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
            </div>

            {/* Resultado del análisis */}
            {analisisResultado && !analizando && (
              <div className={`mt-4 p-3 rounded-lg ${
                analisisResultado.analisis 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  {analisisResultado.analisis ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${
                      analisisResultado.analisis ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {analisisResultado.analisis 
                        ? 'Análisis Aprobado' 
                        : 'Análisis No Aprobado'}
                    </p>
                    {!analisisResultado.analisis && analisisResultado.faltantes?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-red-800 font-medium">Ítems faltantes:</p>
                        <ul className="mt-1 space-y-1">
                          {analisisResultado.faltantes.map((item, idx) => (
                            <li key={idx} className="text-sm text-red-700">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botón subir */}
        {archivo && analisisResultado?.analisis && (
          <button
            onClick={handleSubir}
            disabled={subiendo}
            className="w-full mt-4 flex items-center justify-center gap-3 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all"
          >
            {subiendo ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {entregableDocumento ? 'Actualizando...' : 'Subiendo...'}
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                {entregableDocumento ? 'Actualizar Documento' : 'Cargar Documento'}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default EntregablesInvestigativo;