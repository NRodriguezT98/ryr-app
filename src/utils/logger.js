/**
 * @file logger.js
 * @description Sistema de logging profesional para desarrollo y producción
 * 
 * Características:
 * - Niveles de log configurables (debug, info, warn, error)
 * - Formato limpio y legible
 * - Desactiva logs en producción
 * - Agrupa logs relacionados
 * - Incluye timestamps y contexto
 */

const isDevelopment = import.meta.env.MODE === 'development';
const isProd = import.meta.env.PROD;

/**
 * Niveles de logging
 */
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
};

/**
 * Configuración actual de logging
 * DESARROLLO: INFO (debug desactivado para reducir ruido)
 * PRODUCCIÓN: ERROR (solo errores críticos)
 */
const CURRENT_LOG_LEVEL = isProd ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;

/**
 * Colores para consola (solo en desarrollo)
 */
const COLORS = {
    debug: '#9333ea', // Purple
    info: '#3b82f6',  // Blue
    warn: '#f59e0b',  // Orange
    error: '#ef4444', // Red
    success: '#10b981' // Green
};

/**
 * Formatea el timestamp actual
 * @returns {string} Timestamp formateado
 */
const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString('es-MX', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
    });
};

/**
 * Formatea el contexto del log
 * @param {string} context - Nombre del contexto (componente, servicio, etc.)
 * @returns {string} Contexto formateado
 */
const formatContext = (context) => {
    return `[${context}]`;
};

/**
 * Logger profesional con diferentes niveles
 */
class Logger {
    /**
     * @param {string} context - Contexto del logger (nombre del módulo/componente)
     */
    constructor(context = 'App') {
        this.context = context;
    }

    /**
     * Log de debug - Solo información técnica detallada
     * @param {string} message - Mensaje principal
     * @param {*} data - Datos adicionales
     */
    debug(message, data = null) {
        if (CURRENT_LOG_LEVEL > LOG_LEVELS.DEBUG) return;

        const timestamp = getTimestamp();
        const contextStr = formatContext(this.context);

        console.log(
            `%c${timestamp} %c${contextStr} %c${message}`,
            `color: #6b7280; font-weight: normal;`, // Gray timestamp
            `color: ${COLORS.debug}; font-weight: bold;`, // Purple context
            'color: inherit; font-weight: normal;' // Normal message
        );

        if (data) {
            console.log(data);
        }
    }

    /**
     * Log de información - Eventos importantes del flujo
     * @param {string} message - Mensaje principal
     * @param {*} data - Datos adicionales
     */
    info(message, data = null) {
        if (CURRENT_LOG_LEVEL > LOG_LEVELS.INFO) return;

        const timestamp = getTimestamp();
        const contextStr = formatContext(this.context);

        console.log(
            `%c${timestamp} %c${contextStr} %c${message}`,
            `color: #6b7280; font-weight: normal;`,
            `color: ${COLORS.info}; font-weight: bold;`,
            'color: inherit; font-weight: normal;'
        );

        if (data) {
            console.log(data);
        }
    }

    /**
     * Log de éxito - Operaciones completadas exitosamente
     * @param {string} message - Mensaje principal
     * @param {*} data - Datos adicionales
     */
    success(message, data = null) {
        if (CURRENT_LOG_LEVEL > LOG_LEVELS.INFO) return;

        const timestamp = getTimestamp();
        const contextStr = formatContext(this.context);

        console.log(
            `%c${timestamp} %c${contextStr} %c✓ ${message}`,
            `color: #6b7280; font-weight: normal;`,
            `color: ${COLORS.success}; font-weight: bold;`,
            `color: ${COLORS.success}; font-weight: normal;`
        );

        if (data) {
            console.log(data);
        }
    }

    /**
     * Log de advertencia - Situaciones que requieren atención
     * @param {string} message - Mensaje principal
     * @param {*} data - Datos adicionales
     */
    warn(message, data = null) {
        if (CURRENT_LOG_LEVEL > LOG_LEVELS.WARN) return;

        const timestamp = getTimestamp();
        const contextStr = formatContext(this.context);

        console.warn(
            `%c${timestamp} %c${contextStr} %c⚠ ${message}`,
            `color: #6b7280; font-weight: normal;`,
            `color: ${COLORS.warn}; font-weight: bold;`,
            `color: ${COLORS.warn}; font-weight: bold;`
        );

        if (data) {
            console.warn(data);
        }
    }

    /**
     * Log de error - Errores que requieren investigación
     * @param {string} message - Mensaje principal
     * @param {Error|*} error - Error o datos adicionales
     */
    error(message, error = null) {
        if (CURRENT_LOG_LEVEL > LOG_LEVELS.ERROR) return;

        const timestamp = getTimestamp();
        const contextStr = formatContext(this.context);

        console.error(
            `%c${timestamp} %c${contextStr} %c✖ ${message}`,
            `color: #6b7280; font-weight: normal;`,
            `color: ${COLORS.error}; font-weight: bold;`,
            `color: ${COLORS.error}; font-weight: bold;`
        );

        if (error) {
            if (error instanceof Error) {
                // En desarrollo: muestra el stack trace
                // En producción: solo el mensaje
                if (isDevelopment) {
                    console.error(error);
                } else {
                    console.error(`Error: ${error.message}`);
                }
            } else {
                console.error(error);
            }
        }
    }

    /**
     * Agrupa logs relacionados
     * @param {string} groupName - Nombre del grupo
     * @param {boolean} collapsed - Si el grupo debe estar colapsado
     */
    group(groupName, collapsed = false) {
        if (!isDevelopment) return;

        const timestamp = getTimestamp();
        const contextStr = formatContext(this.context);

        if (collapsed) {
            console.groupCollapsed(
                `%c${timestamp} %c${contextStr} %c${groupName}`,
                `color: #6b7280; font-weight: normal;`,
                `color: ${COLORS.info}; font-weight: bold;`,
                'color: inherit; font-weight: bold;'
            );
        } else {
            console.group(
                `%c${timestamp} %c${contextStr} %c${groupName}`,
                `color: #6b7280; font-weight: normal;`,
                `color: ${COLORS.info}; font-weight: bold;`,
                'color: inherit; font-weight: bold;'
            );
        }
    }

    /**
     * Cierra el grupo actual
     */
    groupEnd() {
        if (!isDevelopment) return;
        console.groupEnd();
    }

    /**
     * Mide el tiempo de ejecución de una operación
     * @param {string} label - Etiqueta del timer
     */
    time(label) {
        if (!isDevelopment) return;
        console.time(`${this.context} - ${label}`);
    }

    /**
     * Finaliza la medición de tiempo
     * @param {string} label - Etiqueta del timer
     */
    timeEnd(label) {
        if (!isDevelopment) return;
        console.timeEnd(`${this.context} - ${label}`);
    }

    /**
     * Tabla para visualizar datos estructurados
     * @param {Array|Object} data - Datos a mostrar en tabla
     */
    table(data) {
        if (!isDevelopment) return;
        console.table(data);
    }
}

/**
 * Factory para crear loggers
 * @param {string} context - Contexto del logger
 * @returns {Logger} Instancia del logger
 */
export const createLogger = (context) => {
    return new Logger(context);
};

/**
 * Logger global por defecto
 */
export const logger = new Logger('App');

/**
 * Loggers pre-configurados para módulos comunes
 */
export const authLogger = new Logger('Auth');
export const apiLogger = new Logger('API');
export const cacheLogger = new Logger('Cache');
export const validationLogger = new Logger('Validation');
export const uiLogger = new Logger('UI');

export default logger;
