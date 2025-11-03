import React, { useState } from 'react';
import { 
  FileText, Video, Music, Image as ImageIcon, Code, 
  Upload, Loader2, Link as LinkIcon, CheckCircle, ExternalLink, Download, Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  crearEntregable,
  deshabilitarEntregable
} from '../../../services/EntregableService';

const TIPO_CONFIG = {
  DOCUMENTO: {
    icon: FileText,
    label: 'Documento',
    accept: '.pdf,.doc,.docx',
    color: 'blue',
    esArchivo: true 
  },
  VIDEO: {
    icon: Video,
    label: 'Video',
    accept: 'video/*',
    color: 'purple',
    esArchivo: false,
    placeholder: 'https://youtube.com/watch?v=...'
  },
  AUDIO: {
    icon: Music,
    label: 'Audio',
    accept: 'audio/*',
    color: 'green',
    esArchivo: false,
    placeholder: 'https://soundcloud.com/...'
  },
  IMAGEN: {
    icon: ImageIcon,
    label: 'Imagen',
    accept: 'image/*',
    color: 'pink',
    esArchivo: false,
    placeholder: 'https://example.com/image.jpg'
  },
  REPOSITORIO: {
    icon: Code,
    label: 'Repositorio Git',
    color: 'gray',
    accept: '.zip',
    esArchivo: false, 
    placeholder: 'https://github.com/usuario/repositorio.git'
  }
};

const EntregablesDesarrollo = ({
  proyecto,
  actividad,
  equipo,
  esquemaInfo,
  entregables,
  currentUserCode,
  onEntregableCreado
}) => {
  // ✅ Estado local para manejar entregables con key única
  const [entregablesLocales, setEntregablesLocales] = useState(entregables);
  const [ultimoAgregado, setUltimoAgregado] = useState(null);
  
  // ✅ Actualizar SOLO cuando viene nueva data del servidor (no cuando agregamos local)
  React.useEffect(() => {
    // Si el nuevo entregable ya está en la lista del servidor, no sobrescribir
    if (ultimoAgregado && entregables.some(e => e.id_entregable === ultimoAgregado.id_entregable)) {
      setEntregablesLocales(entregables);
      setUltimoAgregado(null);
    } else if (!ultimoAgregado) {
      // Primera carga o cambio de actividad
      setEntregablesLocales(entregables);
    }
  }, [entregables, ultimoAgregado]);

  const tiposRequeridos = actividad?.Actividad_items?.map(ai => ai.Item.nombre.toUpperCase()) || [];

  // ✅ Handler mejorado para agregar entregable local
  const handleNuevoEntregable = (nuevoEntregable) => {
    // Agregar inmediatamente a la UI
    setEntregablesLocales(prev => {
      // Evitar duplicados
      const existe = prev.some(e => e.id_entregable === nuevoEntregable.id_entregable);
      if (existe) return prev;
      return [...prev, nuevoEntregable];
    });
    
    setUltimoAgregado(nuevoEntregable);
    
    // Notificar al padre (para refetch opcional)
    if (onEntregableCreado) {
      onEntregableCreado(nuevoEntregable);
    }
  };

  // ✅ Handler para eliminar entregable
  const handleEliminarEntregable = (id_entregable) => {
    setEntregablesLocales(prev => prev.filter(e => e.id_entregable !== id_entregable));
  };

  return (
    <div className="space-y-4">
      {tiposRequeridos.map(tipo => {
        const entregablesDeTipo = entregablesLocales.filter(e => e.tipo === tipo);
        
        return (
          <EntregableCard
            key={tipo}
            tipo={tipo}
            proyecto={proyecto}
            equipo={equipo}
            actividad={actividad}
            entregablesExistentes={entregablesDeTipo}
            currentUserCode={currentUserCode}
            onEntregableCreado={handleNuevoEntregable}
            onEntregableEliminado={handleEliminarEntregable}
          />
        );
      })}
    </div>
  );
};

const EntregableCard = ({
  tipo,
  proyecto,
  equipo,
  actividad,
  entregablesExistentes = [],
  currentUserCode,
  onEntregableCreado,
  onEntregableEliminado
}) => {
  const config = TIPO_CONFIG[tipo] || {};
  const Icon = config.icon || FileText;

  // ✅ Para DOCUMENTO, nunca debe estar en modo URL
  const [modoUrl, setModoUrl] = useState(!config.esArchivo && tipo !== 'DOCUMENTO');
  const [url, setUrl] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [eliminando, setEliminando] = useState(null); // ID del entregable que se está eliminando

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivo(file);
  };

  const validarUrl = (urlString) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  // ✅ Formatear fecha correctamente
  const formatearFecha = (fechaString) => {
    if (!fechaString) return '';
    
    // Si ya viene formateada del backend, retornarla directamente
    if (typeof fechaString === 'string' && !fechaString.includes('T')) {
      return fechaString;
    }
    
    // Si no, formatearla
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSubir = async () => {
    // Validaciones
    if (modoUrl) {
      if (!url.trim()) {
        toast.error('Debes ingresar una URL');
        return;
      }
      if (!validarUrl(url)) {
        toast.error('URL inválida');
        return;
      }
    } else {
      if (!archivo) {
        toast.error('Debes seleccionar un archivo');
        return;
      }
    }

    try {
      setSubiendo(true);

      const formData = new FormData();
      formData.append('tipo', tipo);
      formData.append('id_actividad', actividad.id_actividad);
      formData.append('id_equipo', equipo.id_equipo);
      formData.append('id_proyecto', proyecto.id_proyecto);

      if (modoUrl) {
        formData.append('esUrl', 'true');
        if (tipo === 'VIDEO') formData.append('url_video', url);
        else if (tipo === 'AUDIO') formData.append('url_audio', url);
        else if (tipo === 'IMAGEN') formData.append('url_imagen', url);
        else if (tipo === 'REPOSITORIO') formData.append('url_repositorio', url);
      } else {
        formData.append('archivo', archivo);
        formData.append('esUrl', 'false');
      }

      const response = await crearEntregable(formData, currentUserCode);
      
      // ✅ Actualizar la lista de entregables inmediatamente
      const nuevoEntregable = response.data || response;
      
      // Formatear la fecha del nuevo entregable antes de agregarlo
      if (nuevoEntregable.fecha_subida) {
        const fecha = new Date(nuevoEntregable.fecha_subida);
        nuevoEntregable.fecha_subida = fecha.toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      onEntregableCreado(nuevoEntregable);
      toast.success(`${config.label} cargado exitosamente`);
      
      // ✅ Limpiar formulario
      setUrl('');
      setArchivo(null);
      
      // Limpiar input file
      const fileInput = document.getElementById(`file-${tipo}`);
      if (fileInput) fileInput.value = '';
      
      // ✅ Resetear modo URL si aplica (para siguiente carga)
      if (!config.esArchivo && tipo !== 'DOCUMENTO') {
        setModoUrl(true);
      }
    } catch (error) {
      toast.error(error.message || `Error al subir ${config.label.toLowerCase()}`);
    } finally {
      setSubiendo(false);
    }
  };

  const handleVisualizar = (entregable) => {
    if (!entregable) return;

    // Si tiene URL externa guardada
    if (entregable.url_repositorio) {
      window.open(entregable.url_repositorio, '_blank');
      return;
    }
    if (entregable.url_video) {
      window.open(entregable.url_video, '_blank');
      return;
    }
    if (entregable.url_audio) {
      window.open(entregable.url_audio, '_blank');
      return;
    }
    if (entregable.url_imagen) {
      window.open(entregable.url_imagen, '_blank');
      return;
    }

    // Si es archivo subido
    const extension = entregable.nombre_archivo?.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf' || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      window.open(entregable.url_archivo, '_blank');
    } else {
      // Descargar archivos (ZIP, videos, audios, etc.)
      const link = document.createElement('a');
      link.href = entregable.url_archivo;
      link.download = entregable.nombre_archivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.info('Descargando archivo...');
    }
  };

  // ✅ Manejar eliminación de entregable
  const handleEliminar = async (id_entregable) => {
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar este entregable?');
    if (!confirmar) return;

    try {
      setEliminando(id_entregable);
      console.log(currentUserCode);
      await deshabilitarEntregable(id_entregable, currentUserCode);
      toast.success('Entregable eliminado exitosamente');
      
      // Eliminar del estado local
      if (onEntregableEliminado) {
        onEntregableEliminado(id_entregable);
      }
    } catch (error) {
      toast.error(error.message || 'Error al eliminar el entregable');
    } finally {
      setEliminando(null);
    }
  };

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    pink: 'bg-pink-50 border-pink-200 text-pink-600',
    gray: 'bg-gray-50 border-gray-200 text-gray-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${colorClasses[config.color] || colorClasses.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{config.label}</h3>
            {entregablesExistentes.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                <CheckCircle className="w-3 h-3" />
                <span>{entregablesExistentes.length} cargado(s)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Lista de entregables existentes */}
      {entregablesExistentes.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-sm font-semibold text-gray-700">Archivos cargados:</p>
          {entregablesExistentes.map((entregable) => (
            <div key={entregable.id_entregable} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium truncate">
                  {entregable.nombre_archivo}
                </p>
                <p className="text-xs text-gray-500">
                  {formatearFecha(entregable.fecha_subida)}
                </p>
              </div>
              
              {/* Botones de acción */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVisualizar(entregable)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                  title={tipo === 'REPOSITORIO' && entregable.url_repositorio ? 'Ver repositorio' : 'Ver/Descargar archivo'}
                >
                  {tipo === 'REPOSITORIO' && entregable.url_repositorio ? (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Ver
                    </>
                  ) : tipo === 'REPOSITORIO' ? (
                    <>
                      <Download className="w-4 h-4" />
                      Descargar
                    </>
                  ) : tipo === 'VIDEO' || entregable.url_video ? (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Ver
                    </>
                  ) : tipo === 'AUDIO' || entregable.url_audio ? (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Escuchar
                    </>
                  ) : tipo === 'IMAGEN' || entregable.url_imagen ? (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Ver
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Descargar
                    </>
                  )}
                </button>
                
                {/* Botón eliminar */}
                <button
                  onClick={() => handleEliminar(entregable.id_entregable)}
                  disabled={eliminando === entregable.id_entregable}
                  className="inline-flex items-center justify-center p-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded transition-colors"
                  title="Eliminar entregable"
                >
                  {eliminando === entregable.id_entregable ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario para subir nuevo */}
      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          {entregablesExistentes.length > 0 ? 'Agregar otro' : 'Subir nuevo'}
        </p>

        {/* ✅ Selector URL/Archivo (NO mostrar para DOCUMENTO) */}
        {!config.esArchivo && (
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setModoUrl(true)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                modoUrl
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <LinkIcon className="w-4 h-4 inline mr-2" />
              URL
            </button>
            <button
              type="button"
              onClick={() => setModoUrl(false)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !modoUrl
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              {tipo === 'REPOSITORIO' ? 'ZIP' : 'Archivo'}
            </button>
          </div>
        )}

        {/* ✅ Input según modo - SIEMPRE archivo para DOCUMENTO */}
        {modoUrl && !config.esArchivo ? (
          <div className="mb-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={config.placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              disabled={subiendo}
            />
          </div>
        ) : (
          <div className="mb-4">
            <input
              type="file"
              accept={config.accept}
              onChange={handleFileChange}
              className="hidden"
              id={`file-${tipo}`}
              disabled={subiendo}
            />
            <label
              htmlFor={`file-${tipo}`}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-600 hover:bg-red-50 transition-colors"
            >
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {archivo ? archivo.name : `Seleccionar ${tipo === 'REPOSITORIO' ? 'archivo ZIP' : config.label.toLowerCase()}`}
              </span>
            </label>
          </div>
        )}

        {/* Botón subir */}
        <button
          onClick={handleSubir}
          disabled={subiendo || (!modoUrl && !archivo) || (modoUrl && !url.trim())}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
        >
          {subiendo ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Cargar
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EntregablesDesarrollo;