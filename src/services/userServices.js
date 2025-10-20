
import axiosInstance from "../config/axios";

export const registrarUsuario = async (userData) => {
  try {
    const response = await axiosInstance.post("/usuarios/register", userData);
    return response.data;
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error;
  }
};

export const obtenerTodosLosEstudiantes = async () => {
  try {
    const response = await axiosInstance.get("/usuarios/estudiantes");
    return response.data;
  } catch (error) {
    console.error("Error al obtener estudiantes:", error);
    throw error;
  }
};

export const obtenerUsuario = async () => {
  try {
    const response = await axiosInstance.get("/usuarios/me");
    const { usuario } = response.data;

    localStorage.setItem("usuario", JSON.stringify({
      documento: usuario.documento,
      correo: usuario.correo,
      telefono: usuario.telefono,
      rol: usuario.Rol?.descripcion,
      estado: usuario.Estado?.descripcion
    }));

    return usuario;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    throw error;
  }
};

export const obtenerTodosLosUsuarios = async () => {
  try {
    const response = await axiosInstance.get("/usuarios/todos");
    return response.data;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
};

export const obtenerUsuariosStandBy = async () => {
  try {
    const response = await axiosInstance.get("/usuarios/stand-by");
    return response.data;
  } catch (error) {
    console.error("Error al obtener usuarios en STAND_BY:", error);
    throw error;
  }
};

export const listarDocentes = async () => {
  try {
    const response = await axiosInstance.get("/usuarios/docentes");
    return response.data;
  } catch (error) {
    console.error("Error al listar docentes:", error);
    throw error;
  }
};

export const habilitarUsuario = async (codigo) => {
  try {
    const response = await axiosInstance.patch(`/usuarios/${codigo}/estado`, {
      habilitar: true
    });
    return response.data;
  } catch (error) {
    console.error("Error al habilitar usuario:", error);
    throw error;
  }
};

export const deshabilitarUsuario = async (codigo) => {
  try {
    const response = await axiosInstance.patch(`/usuarios/${codigo}/estado`, {
      habilitar: false
    });
    return response.data;
  } catch (error) {
    console.error("Error al deshabilitar usuario:", error);
    throw error;
  }
};

export const aprobarPostulacion = async (codigo) => {
  try {
    const response = await axiosInstance.patch(`/usuarios/${codigo}/aprobar`);
    return response.data;
  } catch (error) {
    console.error("Error al aprobar postulación:", error);
    throw error;
  }
};

export const rechazarPostulacion = async (codigo) => {
  try {
    const response = await axiosInstance.patch(`/usuarios/${codigo}/rechazar`);
    return response.data;
  } catch (error) {
    console.error("Error al rechazar postulación:", error);
    throw error;
  }
};

export const cargarDocentesMasivamente = async (docentes) => {
  try {
    console.log("🚀 Enviando petición a:", axiosInstance.defaults.baseURL);
    console.log("📦 Docentes a cargar:", docentes.length);
    
    const response = await axiosInstance.post(
      "/usuarios/cargar-docentes",
      { docentes },
      { timeout: 60000 }
    );
    
    console.log("✅ Respuesta recibida:", response.status);
    return response.data;
  } catch (error) {
    console.error("❌ Error completo:", {
      message: error.message,
      code: error.code,
      hasResponse: !!error.response,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

export const matricularEstudiantesMasivamente = async (matriculas) => {
  try {
    console.log("🚀 Servicio - Enviando petición con:", { matriculas });
    console.log("📦 URL:", axiosInstance.defaults.baseURL + "/grupos-usuarios/matricular-masivamente");
    
    const response = await axiosInstance.post(
      "/grupos-usuarios/matricular-masivamente",
      { matriculas }, // Enviar con la clave "matriculas"
      { 
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log("✅ Servicio - Respuesta recibida:", response.status, response.data);
    
    // El backend retorna { progressId, totalEstudiantes, totalGrupos, ... }
    return response.data;
  } catch (error) {
    console.error("❌ Servicio - Error completo:", {
      message: error.message,
      code: error.code,
      hasResponse: !!error.response,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

export const buscarEstudiantePorCodigo = async (codigo) => {
  try {
    if (!codigo) {
      throw new Error("Debe proporcionar un código de estudiante válido");
    }

    const response = await axiosInstance.get(`/usuarios/estudiantes/${codigo}`);
    return response.data;
  } catch (error) {
    console.error("Error al buscar estudiante por código:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

