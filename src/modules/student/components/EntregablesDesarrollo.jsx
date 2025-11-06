import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Video, Music, Image, Code, 
  Upload, Loader2, Link, CheckCircle, ExternalLink, 
  Download, Trash2, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  crearEntregable,
  deshabilitarEntregable
} from '../../../services/EntregableService';
import Swal from 'sweetalert2';

const TIPO_CONFIG = {
  DOCUMENTO: {
    icon: FileText,
    label: 'Documento',
    accept: '.doc,.docx',
    color: 'blue',
    esArchivo: true 
  },
  VIDEO: {
    icon: Video,
    label: 'Video',
    accept: 'video/*',
    color: 'purple',
    esArchivo: false,
    placeholder: 'https://youtube.com/watch?v=... o https://youtu.be/...'
  },
  AUDIO: {
    icon: Music,
    label: 'Audio',
    accept: 'audio/*',
    color: 'green',
    esArchivo: false,
    placeholder: 'https://soundcloud.com/... o archivo MP3'
  },
  IMAGEN: {
    icon: Image,
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
    placeholder: 'https://github.com/usuario/repositorio'
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
  const [entregablesLocales, setEntregablesLocales] = useState(entregables);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!isUpdatingRef.current) {
      setEntregablesLocales(entregables);
    }
  }, [entregables]);

  const tiposRequeridos = actividad?.Actividad_items?.map(ai => ai.Item.nombre.toUpperCase()) || [];

  const handleNuevoEntregable = (nuevoEntregable) => {
    isUpdatingRef.current = true;
    
    setEntregablesLocales(prev => {
      const existe = prev.some(e => e.id_entregable === nuevoEntregable.id_entregable);
      if (existe) return prev;
      return [...prev, nuevoEntregable];
    });
    
    if (onEntregableCreado) {
      onEntregableCreado(nuevoEntregable);
    }

    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 500);
  };

  const handleEliminarEntregable = (id_entregable) => {
    isUpdatingRef.current = true;
    
    setEntregablesLocales(prev => prev.filter(e => e.id_entregable !== id_entregable));
    
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 500);
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

  const [modoUrl, setModoUrl] = useState(!config.esArchivo && tipo !== 'DOCUMENTO');
  const [url, setUrl] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const [previewing, setPreviewing] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validación especial para documentos - solo Word
    if (tipo === 'DOCUMENTO') {
      const allowedTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error('Solo se permiten archivos Word (.doc, .docx)');
        e.target.value = '';
        return;
      }
    }

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

  const formatearFecha = (fechaString) => {
    if (!fechaString) return 'Fecha no disponible';
    
    try {
      if (typeof fechaString === 'string' && !fechaString.includes('T') && !fechaString.includes('-')) {
        return fechaString;
      }
      
      const fecha = new Date(fechaString);
      
      if (isNaN(fecha.getTime())) {
        return 'Fecha no disponible';
      }
      
      return fecha.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha no disponible';
    }
  };

  const handleSubir = async () => {
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
      const nuevoEntregable = response.data || response;
      
      if (nuevoEntregable.fecha_subida) {
        nuevoEntregable.fecha_subida_formateada = formatearFecha(nuevoEntregable.fecha_subida);
      }
      
      onEntregableCreado(nuevoEntregable);
      toast.success(`${config.label} cargado exitosamente`);
      
      setUrl('');
      setArchivo(null);
      
      const fileInput = document.getElementById(`file-${tipo}`);
      if (fileInput) fileInput.value = '';
      
      if (!config.esArchivo && tipo !== 'DOCUMENTO') {
        setModoUrl(true);
      }
    } catch (error) {
      console.error('Error al subir:', error);
      toast.error(error.message || `Error al subir ${config.label.toLowerCase()}`);
    } finally {
      setSubiendo(false);
    }
  };

  const handleEliminar = async (id_entregable, nombreArchivo) => {
    const result = await Swal.fire({
      title: '¿Eliminar entregable?',
      html: `
        <div style="text-align: center;">
          <p style="margin-bottom: 15px;">
            Estás a punto de eliminar: <strong>${nombreArchivo}</strong>
          </p>
          <div style="background-color: #fef2f2; border-left: 3px solid #dc2626; padding: 12px; border-radius: 4px; margin-top: 15px;">
            <p style="color: #dc2626; font-weight: 600; margin: 0; font-size: 0.9em;">
              ⚠️ Esta acción no se puede deshacer
            </p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      setEliminando(id_entregable);
      await deshabilitarEntregable(id_entregable, currentUserCode);
      toast.success('Entregable eliminado exitosamente');
      
      if (onEntregableEliminado) {
        onEntregableEliminado(id_entregable);
      }
    } catch (error) {
      toast.error(error.message || 'Error al eliminar el entregable');
    } finally {
      setEliminando(null);
    }
  };

  const togglePreview = (id_entregable) => {
    setPreviewing(prev => prev === id_entregable ? null : id_entregable);
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

      {entregablesExistentes.length > 0 && (
        <div className="mb-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Archivos cargados:</p>
          {entregablesExistentes.map((entregable) => (
            <EntregablePreviewCard
              key={entregable.id_entregable}
              entregable={entregable}
              tipo={tipo}
              isPreviewing={previewing === entregable.id_entregable}
              onTogglePreview={() => togglePreview(entregable.id_entregable)}
              onEliminar={handleEliminar}
              eliminando={eliminando === entregable.id_entregable}
              formatearFecha={formatearFecha}
            />
          ))}
        </div>
      )}

      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          {entregablesExistentes.length > 0 ? 'Agregar otro' : 'Subir nuevo'}
        </p>

        {!config.esArchivo && (
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setModoUrl(true)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                modoUrl ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Link className="w-4 h-4 inline mr-2" />
              URL
            </button>
            <button
              type="button"
              onClick={() => setModoUrl(false)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !modoUrl ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              {tipo === 'REPOSITORIO' ? 'ZIP' : 'Archivo'}
            </button>
          </div>
        )}

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
                {archivo 
                  ? archivo.name 
                  : `Seleccionar ${tipo === 'DOCUMENTO' ? 'Word (.doc/.docx)' : tipo === 'REPOSITORIO' ? 'archivo ZIP' : config.label.toLowerCase()}`
                }
              </span>
            </label>
          </div>
        )}

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

const EntregablePreviewCard = ({ 
  entregable, 
  tipo, 
  isPreviewing, 
  onTogglePreview, 
  onEliminar, 
  eliminando,
  formatearFecha 
}) => {
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?]+)/,
      /youtube\.com\/embed\/([^&\?]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    return null;
  };

  const getGitHubEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('github.com')) {
      return url;
    }
    return null;
  };

  const getExtension = (filename) => {
    return filename?.split('.').pop()?.toLowerCase() || '';
  };

  const canPreview = () => {
    if (entregable.url_video) return true;
    if (entregable.url_audio) return true;
    if (entregable.url_imagen) return true;
    if (entregable.url_repositorio) return true;
    
    if (entregable.url_archivo) {
      const ext = getExtension(entregable.nombre_archivo);
      return ['doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mp3', 'wav'].includes(ext);
    }
    
    return false;
  };

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = entregable.url_archivo || entregable.url_repositorio;
    if (!url) return;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = entregable.nombre_archivo || 'archivo';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info('Descargando archivo...');
  };

  const renderPreview = () => {
    if (entregable.url_video) {
      const embedUrl = getYouTubeEmbedUrl(entregable.url_video);
      if (embedUrl) {
        return (
          <iframe
            src={embedUrl}
            title="Video de YouTube"
            className="w-full h-[400px] rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }
      return <p className="text-sm text-gray-600">URL de video no válida</p>;
    }

    if (entregable.url_audio) {
      return (
        <audio controls className="w-full">
          <source src={entregable.url_audio} />
          Tu navegador no soporta el elemento de audio.
        </audio>
      );
    }

    if (entregable.url_imagen) {
      return (
        <img
          src={entregable.url_imagen}
          alt={entregable.nombre_archivo || 'Imagen'}
          className="max-w-full max-h-[500px] rounded-lg mx-auto"
        />
      );
    }

    if (entregable.url_repositorio) {
      const githubUrl = getGitHubEmbedUrl(entregable.url_repositorio);
      if (githubUrl) {
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-5 h-5 text-gray-600" />
              <p className="text-sm font-medium text-gray-900">Repositorio de GitHub</p>
            </div>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm break-all"
            >
              {githubUrl}
            </a>
            <p className="text-xs text-gray-500 mt-2">
              Haz clic en el enlace para ver el repositorio completo
            </p>
          </div>
        );
      }
      
      return (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Archivo comprimido (.zip). Descárgalo para ver su contenido.
          </p>
        </div>
      );
    }

    if (entregable.url_archivo) {
      const ext = getExtension(entregable.nombre_archivo);

      if (ext === 'doc' || ext === 'docx') {
        return (
          <div className="relative">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(entregable.url_archivo)}`}
              title="Vista previa Word"
              className="w-full h-[600px] rounded-lg border"
              onError={(e) => {
                console.error('Error al cargar Word:', e);
              }}
            />
            <div className="mt-2 text-center">
              <a
                href={entregable.url_archivo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir en nueva pestaña
              </a>
            </div>
          </div>
        );
      }

      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return (
          <img
            src={entregable.url_archivo}
            alt={entregable.nombre_archivo}
            className="max-w-full max-h-[500px] rounded-lg mx-auto"
          />
        );
      }

      if (['mp4', 'webm'].includes(ext)) {
        return (
          <video controls className="w-full max-h-[500px] rounded-lg bg-black">
            <source src={entregable.url_archivo} />
            Tu navegador no soporta el elemento de video.
          </video>
        );
      }

      if (['mp3', 'wav'].includes(ext)) {
        return (
          <audio controls className="w-full">
            <source src={entregable.url_archivo} />
            Tu navegador no soporta el elemento de audio.
          </audio>
        );
      }
    }

    return <p className="text-sm text-gray-600">No hay vista previa disponible</p>;
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200">
      <div className="p-3 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 font-medium truncate">
            {entregable.nombre_archivo || 'Sin nombre'}
          </p>
          <p className="text-xs text-gray-500">
            {entregable.fecha_subida_formateada || formatearFecha(entregable.fecha_subida)}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {canPreview() && (
            <button
              onClick={onTogglePreview}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded text-sm font-medium transition-colors"
              title={isPreviewing ? 'Ocultar vista previa' : 'Ver vista previa'}
            >
              {isPreviewing ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Ocultar
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Ver
                </>
              )}
            </button>
          )}
          
          {(entregable.url_archivo || entregable.url_repositorio) && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
              title="Descargar"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => onEliminar(entregable.id_entregable, entregable.nombre_archivo)}
            disabled={eliminando}
            className="inline-flex items-center justify-center p-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded transition-colors"
            title="Eliminar entregable"
          >
            {eliminando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {isPreviewing && (
        <div className="p-4 border-t border-gray-200 bg-white">
          {renderPreview()}
        </div>
      )}
    </div>
  );
};

export default EntregablesDesarrollo;