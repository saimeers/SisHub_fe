
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

export const habilitarUsuario = async (id_usuario) => {
  try {
    const response = await axiosInstance.patch(`/usuarios/${id_usuario}/estado`, {
      habilitar: true
    });
    return response.data;
  } catch (error) {
    console.error("Error al habilitar usuario:", error);
    throw error;
  }
};

export const deshabilitarUsuario = async (id_usuario) => {
  try {
    const response = await axiosInstance.patch(`/usuarios/${id_usuario}/estado`, {
      habilitar: false
    });
    return response.data;
  } catch (error) {
    console.error("Error al deshabilitar usuario:", error);
    throw error;
  }
};

export const aprobarPostulacion = async (id_usuario) => {
  try {
    const response = await axiosInstance.patch(`/usuarios/${id_usuario}/aprobar`);
    return response.data;
  } catch (error) {
    console.error("Error al aprobar postulación:", error);
    throw error;
  }
};

export const rechazarPostulacion = async (id_usuario) => {
  try {
    const response = await axiosInstance.patch(`/usuarios/${id_usuario}/rechazar`);
    return response.data;
  } catch (error) {
    console.error("Error al rechazar postulación:", error);
    throw error;
  }
};
