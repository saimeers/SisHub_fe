import axiosInstance from "../config/axios";

export const getProgress = async (progressId) => {
  try {
    const response = await axiosInstance.get(`/progress/${progressId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener progreso:", error);
    throw error;
  }
};

export const pollProgress = (progressId, onUpdate, onComplete, onError, interval = 1000) => {
  let intervalId;
  let attempts = 0;
  const maxAttempts = 300;

  const checkProgress = async () => {
    try {
      attempts++;
      
      if (attempts > maxAttempts) {
        clearInterval(intervalId);
        onError(new Error("Tiempo de espera excedido"));
        return;
      }

      const progress = await getProgress(progressId);
      onUpdate(progress);

      if (progress.status === 'completed') {
        clearInterval(intervalId);
        onComplete(progress);
      } else if (progress.status === 'failed') {
        clearInterval(intervalId);
        onError(new Error(progress.message));
      }
    } catch (error) {
      clearInterval(intervalId);
      onError(error);
    }
  };

  intervalId = setInterval(checkProgress, interval);
  checkProgress(); 

  return () => clearInterval(intervalId); 
};