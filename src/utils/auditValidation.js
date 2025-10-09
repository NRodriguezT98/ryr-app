// src/utils/auditValidation.js
import { AuditMessageBuilder } from './auditMessageBuilder';

/**
 * Esquemas de validación para diferentes tipos de auditoría
 */
const AUDIT_SCHEMAS = {
    // Esquema base que deben cumplir todos los logs
    base: {
        required: ['userId', 'userName', 'message', 'timestamp', 'details'],
        optional: ['metadata', 'relatedId', 'entityType'],

        // Validaciones específicas para campos
        validators: {
            userId: (value) => typeof value === 'string' && value.length > 0,
            userName: (value) => typeof value === 'string' && value.length > 0,
            message: (value) => typeof value === 'string' && value.length > 0,
            timestamp: (value) => value instanceof Date || typeof value === 'object',
            details: (value) => typeof value === 'object' && value !== null
        }
    },

    // Esquemas específicos por tipo de entidad
    cliente: {
        requiredDetails: ['action', 'category', 'clienteId'],
        optionalDetails: ['oldData', 'newData', 'changes', 'reason'],

        validators: {
            clienteId: (value) => typeof value === 'string' && value.length > 0,
            action: (value) => ['CREATE_CLIENT', 'UPDATE_CLIENT', 'DELETE_CLIENT', 'UPDATE_PROCESO'].includes(value),
            category: (value) => value === 'clientes'
        }
    },

    vivienda: {
        requiredDetails: ['action', 'category', 'viviendaId'],
        optionalDetails: ['oldData', 'newData', 'changes', 'reason', 'clienteId', 'proyectoId'],

        validators: {
            viviendaId: (value) => typeof value === 'string' && value.length > 0,
            action: (value) => ['CREATE_VIVIENDA', 'UPDATE_VIVIENDA', 'DELETE_VIVIENDA', 'ASSIGN_CLIENTE'].includes(value),
            category: (value) => value === 'viviendas'
        }
    },

    abono: {
        requiredDetails: ['action', 'category', 'abonoId'],
        optionalDetails: ['oldData', 'newData', 'changes', 'reason', 'clienteId', 'viviendaId', 'monto'],

        validators: {
            abonoId: (value) => typeof value === 'string' && value.length > 0,
            action: (value) => ['REGISTER_ABONO', 'UPDATE_ABONO', 'DELETE_ABONO'].includes(value),
            category: (value) => value === 'abonos',
            monto: (value) => value === undefined || (typeof value === 'number' && value >= 0)
        }
    },

    renuncia: {
        requiredDetails: ['action', 'category', 'renunciaId'],
        optionalDetails: ['oldData', 'newData', 'changes', 'reason', 'clienteId', 'viviendaId'],

        validators: {
            renunciaId: (value) => typeof value === 'string' && value.length > 0,
            action: (value) => ['CREATE_RENUNCIA', 'UPDATE_RENUNCIA', 'DELETE_RENUNCIA', 'PROCESS_RENUNCIA'].includes(value),
            category: (value) => value === 'renuncias'
        }
    },

    proyecto: {
        requiredDetails: ['action', 'category', 'proyectoId'],
        optionalDetails: ['oldData', 'newData', 'changes', 'reason'],

        validators: {
            proyectoId: (value) => typeof value === 'string' && value.length > 0,
            action: (value) => ['CREATE_PROYECTO', 'UPDATE_PROYECTO', 'DELETE_PROYECTO'].includes(value),
            category: (value) => value === 'proyectos'
        }
    },

    admin: {
        requiredDetails: ['action', 'category'],
        optionalDetails: ['oldData', 'newData', 'changes', 'reason', 'targetUserId', 'targetUserName'],

        validators: {
            action: (value) => ['USER_LOGIN', 'USER_LOGOUT', 'PERMISSION_CHANGE', 'SYSTEM_CONFIG', 'DATA_EXPORT'].includes(value),
            category: (value) => value === 'admin'
        }
    }
};

/**
 * Clase para validación de logs de auditoría
 */
export class AuditValidator {
    /**
     * Valida un log de auditoría completo
     */
    static validate(auditLog) {
        const errors = [];
        const warnings = [];

        try {
            // Validación del esquema base
            const baseErrors = this.validateBaseSchema(auditLog);
            errors.push(...baseErrors);

            // Si hay errores básicos, no continuar
            if (baseErrors.length > 0) {
                return { isValid: false, errors, warnings };
            }

            // Validación específica por categoría
            const category = auditLog.details?.category;
            if (category && AUDIT_SCHEMAS[category]) {
                const categoryErrors = this.validateCategorySchema(auditLog, category);
                errors.push(...categoryErrors);
            } else if (category) {
                warnings.push(`Categoría '${category}' no tiene esquema de validación definido`);
            }

            // Validaciones adicionales
            const additionalErrors = this.validateAdditionalRules(auditLog);
            errors.push(...additionalErrors);

            // Verificar consistencia del mensaje
            const messageWarnings = this.validateMessage(auditLog);
            warnings.push(...messageWarnings);

        } catch (error) {
            errors.push(`Error durante la validación: ${error.message}`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: this.calculateValidationScore(errors, warnings)
        };
    }

    /**
     * Valida el esquema base
     */
    static validateBaseSchema(auditLog) {
        const errors = [];
        const schema = AUDIT_SCHEMAS.base;

        // Verificar campos requeridos
        for (const field of schema.required) {
            if (!(field in auditLog)) {
                errors.push(`Campo requerido '${field}' está ausente`);
            } else if (auditLog[field] === null || auditLog[field] === undefined) {
                errors.push(`Campo requerido '${field}' no puede ser nulo`);
            }
        }

        // Validar tipos de datos
        for (const [field, validator] of Object.entries(schema.validators)) {
            if (field in auditLog && auditLog[field] !== null && auditLog[field] !== undefined) {
                if (!validator(auditLog[field])) {
                    errors.push(`Campo '${field}' no cumple con el formato requerido`);
                }
            }
        }

        return errors;
    }

    /**
     * Valida esquema específico por categoría
     */
    static validateCategorySchema(auditLog, category) {
        const errors = [];
        const schema = AUDIT_SCHEMAS[category];
        const details = auditLog.details;

        // Verificar campos requeridos en details
        for (const field of schema.requiredDetails) {
            if (!(field in details)) {
                errors.push(`Campo requerido en details '${field}' está ausente para categoría '${category}'`);
            } else if (details[field] === null || details[field] === undefined) {
                errors.push(`Campo requerido en details '${field}' no puede ser nulo para categoría '${category}'`);
            }
        }

        // Validar campos específicos
        for (const [field, validator] of Object.entries(schema.validators)) {
            if (field in details && details[field] !== null && details[field] !== undefined) {
                if (!validator(details[field])) {
                    errors.push(`Campo en details '${field}' no cumple con el formato requerido para categoría '${category}'`);
                }
            }
        }

        return errors;
    }

    /**
     * Validaciones adicionales y reglas de negocio
     */
    static validateAdditionalRules(auditLog) {
        const errors = [];
        const details = auditLog.details;

        // Validar que si hay oldData y newData, sean objetos
        if (details.oldData && typeof details.oldData !== 'object') {
            errors.push('oldData debe ser un objeto');
        }

        if (details.newData && typeof details.newData !== 'object') {
            errors.push('newData debe ser un objeto');
        }

        // Validar que si hay changes, sea un array
        if (details.changes && !Array.isArray(details.changes)) {
            errors.push('changes debe ser un array');
        }

        // Validar timestamps
        const timestamp = auditLog.timestamp;
        if (timestamp) {
            const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
            const now = new Date();
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

            if (date > now) {
                errors.push('timestamp no puede ser en el futuro');
            }

            if (date < oneYearAgo) {
                errors.push('timestamp es demasiado antiguo (más de 1 año)');
            }
        }

        // Validar que el userId corresponda con userName si es posible
        // (Esta validación podría necesitar acceso a la base de datos de usuarios)

        return errors;
    }

    /**
     * Valida consistencia del mensaje
     */
    static validateMessage(auditLog) {
        const warnings = [];

        try {
            // Intentar regenerar el mensaje usando AuditMessageBuilder
            const regeneratedMessage = AuditMessageBuilder.buildMessage(
                auditLog.details.action,
                auditLog.details,
                auditLog.userName
            );

            // Comparar con el mensaje original (normalizado)
            const originalNormalized = auditLog.message.trim().replace(/\s+/g, ' ');
            const regeneratedNormalized = regeneratedMessage.trim().replace(/\s+/g, ' ');

            if (originalNormalized !== regeneratedNormalized) {
                warnings.push('El mensaje no coincide con el formato estándar esperado');
            }

        } catch (error) {
            warnings.push(`No se pudo validar el formato del mensaje: ${error.message}`);
        }

        return warnings;
    }

    /**
     * Calcula un score de validación (0-100)
     */
    static calculateValidationScore(errors, warnings) {
        let score = 100;

        // Restar puntos por errores (más severos)
        score -= errors.length * 20;

        // Restar puntos menores por warnings
        score -= warnings.length * 5;

        return Math.max(0, score);
    }

    /**
     * Valida múltiples logs de auditoría
     */
    static validateBatch(auditLogs) {
        const results = auditLogs.map((log, index) => ({
            index,
            logId: log.id || `log-${index}`,
            ...this.validate(log)
        }));

        const summary = {
            total: auditLogs.length,
            valid: results.filter(r => r.isValid).length,
            invalid: results.filter(r => !r.isValid).length,
            averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
            totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
            totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0)
        };

        return {
            results,
            summary,
            overallValid: summary.invalid === 0
        };
    }

    /**
     * Sugiere correcciones para un log inválido
     */
    static suggestCorrections(auditLog) {
        const validation = this.validate(auditLog);
        const suggestions = [];

        if (!validation.isValid) {
            for (const error of validation.errors) {
                // Sugerencias específicas basadas en el tipo de error
                if (error.includes('Campo requerido')) {
                    const field = error.match(/'([^']+)'/)?.[1];
                    if (field) {
                        suggestions.push({
                            field,
                            issue: 'Campo faltante',
                            suggestion: `Agregar el campo '${field}' al log de auditoría`,
                            severity: 'error'
                        });
                    }
                }

                if (error.includes('no cumple con el formato')) {
                    const field = error.match(/'([^']+)'/)?.[1];
                    if (field) {
                        suggestions.push({
                            field,
                            issue: 'Formato incorrecto',
                            suggestion: `Verificar el formato del campo '${field}'`,
                            severity: 'error'
                        });
                    }
                }

                if (error.includes('timestamp')) {
                    suggestions.push({
                        field: 'timestamp',
                        issue: 'Timestamp inválido',
                        suggestion: 'Usar new Date() para el timestamp actual',
                        severity: 'error'
                    });
                }
            }
        }

        for (const warning of validation.warnings) {
            if (warning.includes('mensaje no coincide')) {
                suggestions.push({
                    field: 'message',
                    issue: 'Mensaje no estándar',
                    suggestion: 'Usar AuditMessageBuilder.buildMessage() para generar mensajes consistentes',
                    severity: 'warning'
                });
            }
        }

        return suggestions;
    }

    /**
     * Normaliza un log de auditoría para que cumpla con el esquema
     */
    static normalize(auditLog) {
        const normalized = { ...auditLog };

        // Asegurar que details sea un objeto
        if (!normalized.details || typeof normalized.details !== 'object') {
            normalized.details = {};
        }

        // Normalizar timestamp
        if (normalized.timestamp && !(normalized.timestamp instanceof Date)) {
            normalized.timestamp = new Date(normalized.timestamp);
        }

        // Asegurar campos string
        ['userId', 'userName', 'message'].forEach(field => {
            if (normalized[field] && typeof normalized[field] !== 'string') {
                normalized[field] = String(normalized[field]);
            }
        });

        // Regenerar mensaje si es necesario
        if (normalized.details.action && !normalized.message) {
            try {
                normalized.message = AuditMessageBuilder.buildMessage(
                    normalized.details.action,
                    normalized.details,
                    normalized.userName || 'Usuario'
                );
            } catch (error) {
                console.warn('No se pudo generar mensaje automáticamente:', error);
            }
        }

        return normalized;
    }
}

/**
 * Funciones de utilidad para validación rápida
 */

/**
 * Valida rápidamente si un log es válido
 */
export const isValidAuditLog = (auditLog) => {
    return AuditValidator.validate(auditLog).isValid;
};

/**
 * Obtiene solo los errores de validación
 */
export const getValidationErrors = (auditLog) => {
    return AuditValidator.validate(auditLog).errors;
};

/**
 * Obtiene solo las advertencias de validación
 */
export const getValidationWarnings = (auditLog) => {
    return AuditValidator.validate(auditLog).warnings;
};

/**
 * Normaliza un log antes de guardarlo
 */
export const normalizeAuditLog = (auditLog) => {
    return AuditValidator.normalize(auditLog);
};

/**
 * Constantes útiles
 */
export const AUDIT_ACTIONS = {
    // Cliente
    CREATE_CLIENT: 'CREATE_CLIENT',
    UPDATE_CLIENT: 'UPDATE_CLIENT',
    DELETE_CLIENT: 'DELETE_CLIENT',
    UPDATE_PROCESO: 'UPDATE_PROCESO',

    // Vivienda
    CREATE_VIVIENDA: 'CREATE_VIVIENDA',
    UPDATE_VIVIENDA: 'UPDATE_VIVIENDA',
    DELETE_VIVIENDA: 'DELETE_VIVIENDA',
    ASSIGN_CLIENTE: 'ASSIGN_CLIENTE',

    // Abono
    REGISTER_ABONO: 'REGISTER_ABONO',
    UPDATE_ABONO: 'UPDATE_ABONO',
    DELETE_ABONO: 'DELETE_ABONO',

    // Renuncia
    CREATE_RENUNCIA: 'CREATE_RENUNCIA',
    UPDATE_RENUNCIA: 'UPDATE_RENUNCIA',
    DELETE_RENUNCIA: 'DELETE_RENUNCIA',
    PROCESS_RENUNCIA: 'PROCESS_RENUNCIA',

    // Proyecto
    CREATE_PROYECTO: 'CREATE_PROYECTO',
    UPDATE_PROYECTO: 'UPDATE_PROYECTO',
    DELETE_PROYECTO: 'DELETE_PROYECTO',

    // Admin
    USER_LOGIN: 'USER_LOGIN',
    USER_LOGOUT: 'USER_LOGOUT',
    PERMISSION_CHANGE: 'PERMISSION_CHANGE',
    SYSTEM_CONFIG: 'SYSTEM_CONFIG',
    DATA_EXPORT: 'DATA_EXPORT'
};

export const AUDIT_CATEGORIES = {
    CLIENTES: 'clientes',
    VIVIENDAS: 'viviendas',
    ABONOS: 'abonos',
    RENUNCIAS: 'renuncias',
    PROYECTOS: 'proyectos',
    ADMIN: 'admin'
};

export default AuditValidator;