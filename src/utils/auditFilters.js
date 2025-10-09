// src/utils/auditFilters.js
import { formatCurrency, formatDisplayDate } from './textFormatters';

/**
 * Sistema avanzado de filtrado para logs de auditoría
 * Elimina duplicados, agrupa acciones relacionadas y mejora la experiencia del usuario
 */

export class AuditFilters {

    /**
     * Elimina duplicados inteligentemente considerando múltiples factores
     */
    static deduplicateAdvanced(logs) {
        const processed = new Map();

        return logs.filter(log => {
            const timestamp = log.timestamp?.toDate?.() || log.timestamp;
            const timeKey = Math.floor(timestamp.getTime() / 5000); // Ventana de 5 segundos

            // Crear clave única considerando múltiples factores
            const key = this.createDeduplicationKey(log, timeKey);

            if (processed.has(key)) {
                const existing = processed.get(key);
                // Mantener el log con más información
                if (this.hasMoreInformation(log, existing)) {
                    processed.set(key, log);
                    return true;
                }
                return false; // Es duplicado
            }

            processed.set(key, log);
            return true;
        });
    }

    /**
     * Crea una clave única para detectar duplicados
     */
    static createDeduplicationKey(log, timeKey) {
        const { details } = log;

        // Para acciones de proceso del mismo paso
        if (details?.action === 'UPDATE_PROCESO') {
            const paso = details.cambios?.[0]?.paso || details.paso;
            return `${log.userName}_${details.action}_${paso}_${timeKey}`;
        }

        // Para acciones del mismo cliente
        if (details?.clienteId) {
            return `${log.userName}_${details.action}_${details.clienteId}_${timeKey}`;
        }

        // Para acciones generales
        return `${log.userName}_${details?.action || 'unknown'}_${timeKey}`;
    }

    /**
     * Determina si un log tiene más información que otro
     */
    static hasMoreInformation(newLog, existingLog) {
        const newDetails = newLog.details || {};
        const existingDetails = existingLog.details || {};

        // Priorizar UPDATE_PROCESO sobre otras acciones similares
        if (newDetails.action === 'UPDATE_PROCESO' && existingDetails.action !== 'UPDATE_PROCESO') {
            return true;
        }

        // Priorizar logs con más cambios
        const newChanges = newDetails.cambios?.length || 0;
        const existingChanges = existingDetails.cambios?.length || 0;

        return newChanges > existingChanges;
    }

    /**
     * Agrupa acciones relacionadas en secuencias lógicas
     */
    static groupRelatedActions(logs) {
        const groups = [];
        let currentGroup = null;

        logs.forEach((log, index) => {
            if (this.shouldStartNewGroup(log, currentGroup, logs[index - 1])) {
                if (currentGroup) groups.push(this.finalizeGroup(currentGroup));
                currentGroup = { main: log, related: [] };
            } else if (currentGroup && this.isRelatedAction(log, currentGroup.main)) {
                currentGroup.related.push(log);
            } else {
                if (currentGroup) groups.push(this.finalizeGroup(currentGroup));
                currentGroup = { main: log, related: [] };
            }
        });

        if (currentGroup) groups.push(this.finalizeGroup(currentGroup));

        return groups.map(group => group.main); // Por ahora solo retornamos el principal
    }

    /**
     * Determina si debe iniciar un nuevo grupo
     */
    static shouldStartNewGroup(log, currentGroup, previousLog) {
        if (!currentGroup) return true;

        const timeDiff = this.getTimeDifference(log, currentGroup.main);

        // Nuevo grupo si hay más de 30 segundos de diferencia
        if (timeDiff > 30000) return true;

        // Nuevo grupo si cambia el usuario
        if (log.userName !== currentGroup.main.userName) return true;

        // Nuevo grupo si cambia completamente el contexto
        if (!this.isSameContext(log, currentGroup.main)) return true;

        return false;
    }

    /**
     * Verifica si dos logs son del mismo contexto
     */
    static isSameContext(log1, log2) {
        const details1 = log1.details || {};
        const details2 = log2.details || {};

        // Mismo cliente
        if (details1.clienteId && details2.clienteId) {
            return details1.clienteId === details2.clienteId;
        }

        // Misma vivienda
        if (details1.viviendaId && details2.viviendaId) {
            return details1.viviendaId === details2.viviendaId;
        }

        return false;
    }

    /**
     * Verifica si una acción está relacionada con otra
     */
    static isRelatedAction(log, mainLog) {
        const timeDiff = this.getTimeDifference(log, mainLog);

        // Relacionada si es dentro de 30 segundos y mismo contexto
        return timeDiff <= 30000 && this.isSameContext(log, mainLog);
    }

    /**
     * Calcula la diferencia de tiempo entre dos logs
     */
    static getTimeDifference(log1, log2) {
        const time1 = log1.timestamp?.toDate?.() || log1.timestamp;
        const time2 = log2.timestamp?.toDate?.() || log2.timestamp;
        return Math.abs(time1.getTime() - time2.getTime());
    }

    /**
     * Finaliza un grupo combinando información relacionada
     */
    static finalizeGroup(group) {
        if (group.related.length === 0) {
            return group;
        }

        // Enriquecer el log principal con información de logs relacionados
        group.main._enriched = {
            relatedCount: group.related.length,
            relatedActions: group.related.map(log => log.details?.action).filter(Boolean)
        };

        return group;
    }

    /**
     * Filtra logs por relevancia según el contexto
     */
    static filterByRelevance(logs, context = {}) {
        if (!context.clienteId && !context.viviendaId && !context.proyectoId) {
            return logs; // Sin filtro si no hay contexto
        }

        return logs.filter(log => {
            const details = log.details || {};

            // Filtrar por cliente
            if (context.clienteId && details.clienteId === context.clienteId) {
                return true;
            }

            // Filtrar por vivienda
            if (context.viviendaId && details.viviendaId === context.viviendaId) {
                return true;
            }

            // Filtrar por proyecto
            if (context.proyectoId && details.proyecto?.id === context.proyectoId) {
                return true;
            }

            return false;
        });
    }

    /**
     * Filtra logs por tipo de acción
     */
    static filterByActionType(logs, actionTypes = []) {
        if (actionTypes.length === 0) return logs;

        return logs.filter(log => {
            const action = log.details?.action;
            return actionTypes.includes(action);
        });
    }

    /**
     * Filtra logs por rango de fechas
     */
    static filterByDateRange(logs, startDate, endDate) {
        if (!startDate && !endDate) return logs;

        return logs.filter(log => {
            const logDate = log.timestamp?.toDate?.() || log.timestamp;

            if (startDate && logDate < startDate) return false;
            if (endDate && logDate > endDate) return false;

            return true;
        });
    }

    /**
     * Filtra logs por usuario
     */
    static filterByUser(logs, userNames = []) {
        if (userNames.length === 0) return logs;

        return logs.filter(log => userNames.includes(log.userName));
    }

    /**
     * Aplica todos los filtros en secuencia
     */
    static applyAllFilters(logs, options = {}) {
        let filtered = [...logs];

        // 1. Filtrar por relevancia primero
        if (options.context) {
            filtered = this.filterByRelevance(filtered, options.context);
        }

        // 2. Filtrar por tipo de acción
        if (options.actionTypes) {
            filtered = this.filterByActionType(filtered, options.actionTypes);
        }

        // 3. Filtrar por rango de fechas
        if (options.startDate || options.endDate) {
            filtered = this.filterByDateRange(filtered, options.startDate, options.endDate);
        }

        // 4. Filtrar por usuario
        if (options.userNames) {
            filtered = this.filterByUser(filtered, options.userNames);
        }

        // 5. Eliminar duplicados
        if (options.removeDuplicates !== false) {
            filtered = this.deduplicateAdvanced(filtered);
        }

        // 6. Agrupar acciones relacionadas
        if (options.groupRelated) {
            filtered = this.groupRelatedActions(filtered);
        }

        return filtered;
    }

    /**
     * Obtiene estadísticas de los logs filtrados
     */
    static getFilterStats(logs) {
        const stats = {
            total: logs.length,
            byAction: {},
            byUser: {},
            dateRange: { earliest: null, latest: null }
        };

        logs.forEach(log => {
            // Estadísticas por acción
            const action = log.details?.action || 'unknown';
            stats.byAction[action] = (stats.byAction[action] || 0) + 1;

            // Estadísticas por usuario
            stats.byUser[log.userName] = (stats.byUser[log.userName] || 0) + 1;

            // Rango de fechas
            const logDate = log.timestamp?.toDate?.() || log.timestamp;
            if (!stats.dateRange.earliest || logDate < stats.dateRange.earliest) {
                stats.dateRange.earliest = logDate;
            }
            if (!stats.dateRange.latest || logDate > stats.dateRange.latest) {
                stats.dateRange.latest = logDate;
            }
        });

        return stats;
    }
}

/**
 * Filtros predefinidos para casos comunes
 */
export const AuditFilterPresets = {
    CLIENT_ACTIVITY: {
        actionTypes: ['CREATE_CLIENT', 'UPDATE_CLIENT', 'ARCHIVE_CLIENT', 'RESTORE_CLIENT'],
        removeDuplicates: true
    },

    PROCESS_CHANGES: {
        actionTypes: ['UPDATE_PROCESO'],
        removeDuplicates: true,
        groupRelated: true
    },

    FINANCIAL_ACTIVITY: {
        actionTypes: ['REGISTER_ABONO', 'REGISTER_DISBURSEMENT', 'VOID_ABONO', 'REVERT_VOID_ABONO'],
        removeDuplicates: true
    },

    PROPERTY_MANAGEMENT: {
        actionTypes: ['CREATE_VIVIENDA', 'UPDATE_VIVIENDA', 'DELETE_VIVIENDA', 'RESTORE_VIVIENDA', 'ARCHIVE_VIVIENDA'],
        removeDuplicates: true
    },

    RECENT_ACTIVITY: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
        removeDuplicates: true,
        groupRelated: true
    }
};

export default AuditFilters;