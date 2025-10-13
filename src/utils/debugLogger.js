/**
 * Utilidad para logs de debug
 * Solo muestra logs en modo desarrollo
 */

const isDevelopment = import.meta.env.MODE === 'development';

export const debugLog = {
    info: (...args) => {
        if (isDevelopment) console.log(...args);
    },
    warn: (...args) => {
        if (isDevelopment) console.warn(...args);
    },
    error: (...args) => {
        // Los errores siempre se muestran
        console.error(...args);
    },
    group: (label) => {
        if (isDevelopment) console.group(label);
    },
    groupEnd: () => {
        if (isDevelopment) console.groupEnd();
    }
};
