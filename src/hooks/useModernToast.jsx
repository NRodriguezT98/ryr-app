import { toast } from 'react-hot-toast';
import ModernToast from '../components/ModernToast';

export const useModernToast = () => {
    const showToast = (type, title, message, options = {}) => {
        const { action, actionIcon, onAction, duration, ...rest } = options;
        
        return toast.custom((t) => (
            <ModernToast
                t={t}
                type={type}
                title={title}
                message={message}
                action={action}
                actionIcon={actionIcon}
                onAction={onAction}
                duration={duration}
                onDismiss={() => toast.dismiss(t.id)}
            />
        ), {
            duration: duration || (type === 'loading' ? Infinity : 4000),
            position: 'top-right',
            ...rest
        });
    };

    return {
        success: (message, options = {}) => 
            showToast('success', options.title || '¡Éxito!', message, options),
            
        error: (message, options = {}) => 
            showToast('error', options.title || 'Error', message, options),
            
        warning: (message, options = {}) => 
            showToast('warning', options.title || 'Advertencia', message, options),
            
        info: (message, options = {}) => 
            showToast('info', options.title || 'Información', message, options),
            
        loading: (message, options = {}) => 
            showToast('loading', options.title || 'Cargando...', message, { ...options, duration: Infinity }),

        // Métodos con acciones
        successWithAction: (message, action, onAction, options = {}) =>
            showToast('success', options.title || '¡Éxito!', message, { 
                ...options, 
                action, 
                onAction, 
                actionIcon: options.actionIcon || 'copy' 
            }),

        errorWithAction: (message, action, onAction, options = {}) =>
            showToast('error', options.title || 'Error', message, { 
                ...options, 
                action, 
                onAction, 
                actionIcon: options.actionIcon || 'copy' 
            }),

        // Métodos de control
        dismiss: toast.dismiss,
        remove: toast.remove,
        
        // Método personalizado completo
        custom: showToast
    };
};

export default useModernToast;