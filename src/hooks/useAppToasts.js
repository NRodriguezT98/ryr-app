import { useModernToast } from './useModernToast.jsx';

/**
 * Hook principal para toasts de la aplicación
 * Usa el sistema ModernToast con estilos personalizados y animaciones avanzadas
 */
export const useAppToasts = () => {
    const toast = useModernToast();

    return {
        // Métodos principales
        success: toast.success,
        error: toast.error,
        warning: toast.warning,
        info: toast.info,
        loading: toast.loading,

        // Métodos con acciones
        successWithAction: toast.successWithAction,
        errorWithAction: toast.errorWithAction,

        // Métodos de control
        dismiss: toast.dismiss,
        remove: toast.remove,
        custom: toast.custom
    };
};

export default useAppToasts;