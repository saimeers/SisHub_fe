import { toast } from "react-toastify";

export const useToast = () => {
  const defaultOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  const success = (message, options = {}) => {
    toast.success(message, { ...defaultOptions, ...options });
  };

  const error = (message, options = {}) => {
    toast.error(message, { 
      ...defaultOptions, 
      autoClose: 4000, 
      ...options 
    });
  };

  const info = (message, options = {}) => {
    toast.info(message, { ...defaultOptions, ...options });
  };

  const warning = (message, options = {}) => {
    toast.warning(message, { 
      ...defaultOptions, 
      autoClose: 3500, 
      ...options 
    });
  };

  const loading = (message, options = {}) => {
    return toast.loading(message, { ...defaultOptions, ...options });
  };

  const update = (toastId, message, type = 'success', options = {}) => {
    const updateOptions = {
      render: message,
      type: type,
      isLoading: false,
      autoClose: 3000,
      ...options,
    };
    toast.update(toastId, updateOptions);
  };

  const dismiss = (toastId) => {
    toast.dismiss(toastId);
  };

  const dismissAll = () => {
    toast.dismiss();
  };

  const promise = (promiseFunction, messages, options = {}) => {
    return toast.promise(
      promiseFunction,
      {
        pending: messages.loading || 'Cargando...',
        success: messages.success || '¡Éxito!',
        error: messages.error || 'Error',
      },
      { ...defaultOptions, ...options }
    );
  };

  return {
    success,
    error,
    info,
    warning,
    loading,
    update,
    dismiss,
    dismissAll,
    promise,
  };
};