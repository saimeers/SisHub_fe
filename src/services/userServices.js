
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