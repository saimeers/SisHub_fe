import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("firebaseToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const message = error.response.data?.error || error.response.data?.message || "Error en el servidor";
      console.error("Error de respuesta:", message);
      console.error("Error completo del servidor:", error.response);
      
      if (error.response.status === 401 || error.response.status === 403) {
        localStorage.removeItem("firebaseToken");
        window.location.href = "/login";
      }
      
      return Promise.reject(new Error(message));
    } else if (error.request) {
      console.error("No hay respuesta del servidor");
      return Promise.reject(new Error("No se pudo conectar con el servidor"));
    } else {
      console.error("Error:", error.message);
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;