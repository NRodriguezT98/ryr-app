// src/context/AuditContext.jsx
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { createAuditLog } from '../services/auditService';
// import { AuditMessageBuilder } from '../utils/auditMessageBuilder';
import toast from 'react-hot-toast';

// === ESTADO INICIAL ===
const initialState = {
    recentActions: [],
    pendingActions: [],
    isLogging: false,
    metrics: {
        todayCount: 0,
        thisWeekCount: 0,
        averagePerDay: 0,
        mostActiveUser: null,
        mostCommonAction: null
    },
    filters: {
        showOnlyMyActions: false,
        categoryFilter: null,
        timeFilter: '24h'
    },
    notifications: {
        showSuccessToasts: true,
        showErrorToasts: true,
        showRealtimeUpdates: false
    }
};

// === TIPOS DE ACCIONES ===
const AUDIT_ACTION_TYPES = {
    SET_LOGGING: 'SET_LOGGING',
    ADD_RECENT_ACTION: 'ADD_RECENT_ACTION',
    ADD_PENDING_ACTION: 'ADD_PENDING_ACTION',
    REMOVE_PENDING_ACTION: 'REMOVE_PENDING_ACTION',
    UPDATE_METRICS: 'UPDATE_METRICS',
    SET_FILTERS: 'SET_FILTERS',
    SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
    CLEAR_RECENT_ACTIONS: 'CLEAR_RECENT_ACTIONS'
};

// === REDUCER ===
const auditReducer = (state, action) => {
    switch (action.type) {
        case AUDIT_ACTION_TYPES.SET_LOGGING:
            return {
                ...state,
                isLogging: action.payload
            };

        case AUDIT_ACTION_TYPES.ADD_RECENT_ACTION:
            return {
                ...state,
                recentActions: [
                    action.payload,
                    ...state.recentActions.slice(0, 9) // Mantener solo las últimas 10
                ]
            };

        case AUDIT_ACTION_TYPES.ADD_PENDING_ACTION:
            return {
                ...state,
                pendingActions: [
                    ...state.pendingActions,
                    { ...action.payload, id: Date.now().toString() }
                ]
            };

        case AUDIT_ACTION_TYPES.REMOVE_PENDING_ACTION:
            return {
                ...state,
                pendingActions: state.pendingActions.filter(
                    pending => pending.id !== action.payload
                )
            };

        case AUDIT_ACTION_TYPES.UPDATE_METRICS:
            return {
                ...state,
                metrics: {
                    ...state.metrics,
                    ...action.payload
                }
            };

        case AUDIT_ACTION_TYPES.SET_FILTERS:
            return {
                ...state,
                filters: {
                    ...state.filters,
                    ...action.payload
                }
            };

        case AUDIT_ACTION_TYPES.SET_NOTIFICATIONS:
            return {
                ...state,
                notifications: {
                    ...state.notifications,
                    ...action.payload
                }
            };

        case AUDIT_ACTION_TYPES.CLEAR_RECENT_ACTIONS:
            return {
                ...state,
                recentActions: []
            };

        default:
            return state;
    }
};

// === CONTEXTO ===
const AuditContext = createContext();

// === PROVIDER ===
export const AuditProvider = ({ children }) => {
    const [state, dispatch] = useReducer(auditReducer, initialState);

    // === ACCIONES PRINCIPALES ===

    /**
     * Registra una nueva acción de auditoría
     */
    const logAction = useCallback(async (actionType, context, options = {}) => {
        const actionId = Date.now().toString();

        try {
            dispatch({ type: AUDIT_ACTION_TYPES.SET_LOGGING, payload: true });

            // Agregar a acciones pendientes si se solicita
            if (options.showPending) {
                // const messageData = AuditMessageBuilder.buildMessage(actionType, context);
                const messageData = { message: `Acción: ${actionType}`, shortMessage: actionType, category: 'general' };
                dispatch({
                    type: AUDIT_ACTION_TYPES.ADD_PENDING_ACTION,
                    payload: {
                        id: actionId,
                        actionType,
                        message: messageData.shortMessage || messageData.message,
                        category: messageData.category,
                        timestamp: new Date()
                    }
                });
            }

            // Construir mensaje usando el builder
            // const messageData = AuditMessageBuilder.buildMessage(actionType, context, options);
            const messageData = { message: `Acción: ${actionType}`, category: 'general' };

            // Crear el log en la base de datos
            await createAuditLog(messageData.message, {
                action: actionType,
                ...context,
                timestamp: new Date(),
                category: messageData.category
            });

            // Remover de pendientes
            if (options.showPending) {
                dispatch({
                    type: AUDIT_ACTION_TYPES.REMOVE_PENDING_ACTION,
                    payload: actionId
                });
            }

            // Agregar a acciones recientes
            dispatch({
                type: AUDIT_ACTION_TYPES.ADD_RECENT_ACTION,
                payload: {
                    id: actionId,
                    actionType,
                    message: messageData.message,
                    shortMessage: messageData.shortMessage,
                    category: messageData.category,
                    timestamp: new Date(),
                    context
                }
            });

            // Mostrar notificación de éxito
            if (state.notifications.showSuccessToasts) {
                toast.success(
                    messageData.shortMessage || 'Acción registrada',
                    { duration: 3000 }
                );
            }

            // Actualizar métricas
            updateMetrics();

        } catch (error) {
            console.error('Error logging audit action:', error);

            // Remover de pendientes en caso de error
            if (options.showPending) {
                dispatch({
                    type: AUDIT_ACTION_TYPES.REMOVE_PENDING_ACTION,
                    payload: actionId
                });
            }

            // Mostrar notificación de error
            if (state.notifications.showErrorToasts) {
                toast.error('Error al registrar la acción');
            }

            throw error;
        } finally {
            dispatch({ type: AUDIT_ACTION_TYPES.SET_LOGGING, payload: false });
        }
    }, [state.notifications]);

    /**
     * Registra múltiples acciones en lote
     */
    const logBatch = useCallback(async (actions) => {
        const results = [];

        for (const action of actions) {
            try {
                await logAction(
                    action.actionType,
                    action.context,
                    { ...action.options, showPending: false }
                );
                results.push({ success: true, action });
            } catch (error) {
                results.push({ success: false, action, error });
            }
        }

        return results;
    }, [logAction]);

    /**
     * Actualiza las métricas de auditoría
     */
    const updateMetrics = useCallback(() => {
        // Calcular métricas basadas en acciones recientes
        const today = new Date();
        const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const todayActions = state.recentActions.filter(action => {
            const actionDate = new Date(action.timestamp);
            return actionDate.toDateString() === today.toDateString();
        });

        const thisWeekActions = state.recentActions.filter(action => {
            const actionDate = new Date(action.timestamp);
            return actionDate >= thisWeek;
        });

        // Contar acciones por tipo
        const actionCounts = {};
        state.recentActions.forEach(action => {
            actionCounts[action.actionType] = (actionCounts[action.actionType] || 0) + 1;
        });

        const mostCommonAction = Object.keys(actionCounts).reduce((a, b) =>
            actionCounts[a] > actionCounts[b] ? a : b
            , null);

        dispatch({
            type: AUDIT_ACTION_TYPES.UPDATE_METRICS,
            payload: {
                todayCount: todayActions.length,
                thisWeekCount: thisWeekActions.length,
                averagePerDay: Math.round(thisWeekActions.length / 7),
                mostCommonAction
            }
        });
    }, [state.recentActions]);

    /**
     * Actualiza los filtros de visualización
     */
    const setFilters = useCallback((newFilters) => {
        dispatch({
            type: AUDIT_ACTION_TYPES.SET_FILTERS,
            payload: newFilters
        });
    }, []);

    /**
     * Actualiza las configuraciones de notificaciones
     */
    const setNotifications = useCallback((newNotifications) => {
        dispatch({
            type: AUDIT_ACTION_TYPES.SET_NOTIFICATIONS,
            payload: newNotifications
        });
    }, []);

    /**
     * Limpia las acciones recientes
     */
    const clearRecentActions = useCallback(() => {
        dispatch({ type: AUDIT_ACTION_TYPES.CLEAR_RECENT_ACTIONS });
    }, []);

    /**
     * Obtiene acciones filtradas según las preferencias del usuario
     */
    const getFilteredActions = useCallback(() => {
        let filtered = [...state.recentActions];

        // Filtrar por categoría
        if (state.filters.categoryFilter) {
            filtered = filtered.filter(action =>
                action.category === state.filters.categoryFilter
            );
        }

        // Filtrar por tiempo
        if (state.filters.timeFilter) {
            const now = new Date();
            const timeLimit = {
                '1h': 60 * 60 * 1000,
                '24h': 24 * 60 * 60 * 1000,
                '7d': 7 * 24 * 60 * 60 * 1000
            }[state.filters.timeFilter];

            if (timeLimit) {
                const cutoff = new Date(now.getTime() - timeLimit);
                filtered = filtered.filter(action =>
                    new Date(action.timestamp) >= cutoff
                );
            }
        }

        return filtered;
    }, [state.recentActions, state.filters]);

    // === EFECTOS ===

    // Actualizar métricas cuando cambien las acciones recientes
    useEffect(() => {
        updateMetrics();
    }, [state.recentActions]);

    // === VALOR DEL CONTEXTO ===
    const value = {
        // Estado
        ...state,

        // Acciones
        logAction,
        logBatch,
        setFilters,
        setNotifications,
        clearRecentActions,

        // Getters computados
        filteredActions: getFilteredActions(),

        // Helpers
        isActionPending: (actionId) =>
            state.pendingActions.some(pending => pending.id === actionId),

        getActionsByCategory: (category) =>
            state.recentActions.filter(action => action.category === category),

        getActionsByType: (actionType) =>
            state.recentActions.filter(action => action.actionType === actionType)
    };

    return (
        <AuditContext.Provider value={value}>
            {children}
        </AuditContext.Provider>
    );
};

// === HOOK PERSONALIZADO ===
export const useAudit = () => {
    const context = useContext(AuditContext);

    if (!context) {
        throw new Error('useAudit must be used within an AuditProvider');
    }

    return context;
};

// === HOOKS ESPECIALIZADOS ===

/**
 * Hook para logging simplificado
 */
export const useAuditLogger = () => {
    const { logAction, logBatch, isLogging } = useAudit();

    return {
        logAction,
        logBatch,
        isLogging,

        // Helpers para acciones comunes
        logClientAction: (actionType, clienteData, additionalContext = {}) =>
            logAction(actionType, { cliente: clienteData, ...additionalContext }),

        logProcessAction: (clienteData, paso, accion, additionalData = {}) =>
            logAction('UPDATE_PROCESO', {
                cliente: clienteData,
                paso,
                accion,
                ...additionalData
            }),

        logFinancialAction: (actionType, clienteData, abonoData, additionalContext = {}) =>
            logAction(actionType, {
                cliente: clienteData,
                abono: abonoData,
                ...additionalContext
            })
    };
};

/**
 * Hook para métricas y estadísticas
 */
export const useAuditMetrics = () => {
    const { metrics, recentActions, getActionsByCategory, getActionsByType } = useAudit();

    return {
        metrics,
        recentActions,
        getActionsByCategory,
        getActionsByType,

        // Métricas computadas
        getTotalActions: () => recentActions.length,
        getActionTrend: () => {
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const todayCount = recentActions.filter(action =>
                new Date(action.timestamp).toDateString() === now.toDateString()
            ).length;

            const yesterdayCount = recentActions.filter(action =>
                new Date(action.timestamp).toDateString() === yesterday.toDateString()
            ).length;

            return todayCount - yesterdayCount;
        }
    };
};

export default AuditContext;