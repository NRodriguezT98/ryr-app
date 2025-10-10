/**
 * TabHistorial completamente nuevo diseñado para el sistema de auditoría unificado
 * 
 * Características:
 * - Diseñado específicamente para el nuevo sistema de auditoría
 * - Usa interpretAuditForClientHistory para mensajes detallados
 * - Interfaz moderna y limpia
 * - Soporte nativo para ambos formatos (transición suave)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAuditLogsForCliente } from '../../../services/auditService';
import { interpretAuditForClientHistory } from '../../../utils/clientHistoryAuditInterpreter';

// Iconos SVG embebidos para garantizar renderizado
const Icons = {
    CheckCircle: ({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    ),
    Calendar: ({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
    ),
    FolderOpen: ({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
    ),
    RotateCcw: ({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
    ),
    CreditCard: ({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
        </svg>
    ),
    Users: ({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
    ),
    Archive: ({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
            <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
    ),
    DocumentText: ({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
    ),
    RefreshCw: ({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
    ),
    UserPlus: ({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
        </svg>
    ),
    Edit3: ({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
    ),
    FileText: ({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
    ),
    DollarSign: ({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
    ),
    XCircle: ({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
    )
};

// Función para obtener el icono apropiado según el tipo de acción
const getActionIcon = (log) => {
    // Detectar tipo de acción (nuevo sistema vs anterior)
    let actionType = log.actionType; // Nuevo sistema

    if (!actionType && log.details) {
        // Sistema anterior: mapear desde scenario o action
        const scenario = log.details.scenario;
        actionType = log.details.action || (
            scenario === 'FIRST_COMPLETION' ? 'COMPLETE_PROCESS_STEP' :
                scenario === 'REOPEN_WITH_CHANGES' ? 'REOPEN_PROCESS_STEP' :
                    scenario === 'DATE_CHANGE' ? 'CHANGE_COMPLETION_DATE' :
                        scenario === 'EVIDENCE_CHANGE' ? 'CHANGE_STEP_EVIDENCE' :
                            'COMPLETE_PROCESS_STEP'
        );
    }

    // Mapear iconos
    const iconMap = {
        'CREATE_CLIENT': 'UserPlus',
        'UPDATE_CLIENT': 'Edit3',
        'COMPLETE_PROCESS_STEP': 'CheckCircle',
        'REOPEN_PROCESS_STEP': 'RotateCcw',
        'CHANGE_COMPLETION_DATE': 'Calendar',
        'CHANGE_STEP_EVIDENCE': 'FileText',
        'REGISTER_ABONO': 'CreditCard',
        'REGISTER_DISBURSEMENT': 'DollarSign',
        'ARCHIVE_CLIENT': 'Archive',
        'CLIENT_RENOUNCE': 'XCircle'
    };

    const iconName = iconMap[actionType] || 'CheckCircle';
    const IconComponent = Icons[iconName];

    return IconComponent ? <IconComponent className="w-4 h-4" /> : <Icons.CheckCircle className="w-4 h-4" />;
};

// Función para obtener el color del tema según el tipo de acción
const getActionTheme = (log) => {
    let actionType = log.actionType;

    if (!actionType && log.details) {
        const scenario = log.details.scenario;
        actionType = log.details.action || (
            scenario === 'FIRST_COMPLETION' ? 'COMPLETE_PROCESS_STEP' :
                scenario === 'REOPEN_WITH_CHANGES' ? 'REOPEN_PROCESS_STEP' :
                    scenario === 'DATE_CHANGE' ? 'CHANGE_COMPLETION_DATE' :
                        scenario === 'EVIDENCE_CHANGE' ? 'CHANGE_STEP_EVIDENCE' :
                            'COMPLETE_PROCESS_STEP'
        );
    }

    const themeMap = {
        'CREATE_CLIENT': {
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            border: 'border-emerald-200 dark:border-emerald-800',
            icon: 'bg-emerald-500 dark:bg-emerald-600',
            badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100',
            text: 'text-emerald-600 dark:text-emerald-400'
        },
        'UPDATE_CLIENT': {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800',
            icon: 'bg-blue-500 dark:bg-blue-600',
            badge: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
            text: 'text-blue-600 dark:text-blue-400'
        },
        'COMPLETE_PROCESS_STEP': {
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800',
            icon: 'bg-green-500 dark:bg-green-600',
            badge: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
            text: 'text-green-600 dark:text-green-400'
        },
        'REOPEN_PROCESS_STEP': {
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            border: 'border-yellow-200 dark:border-yellow-800',
            icon: 'bg-yellow-500 dark:bg-yellow-600',
            badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
            text: 'text-yellow-600 dark:text-yellow-400'
        },
        'CHANGE_COMPLETION_DATE': {
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            border: 'border-purple-200 dark:border-purple-800',
            icon: 'bg-purple-500 dark:bg-purple-600',
            badge: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
            text: 'text-purple-600 dark:text-purple-400'
        },
        'CHANGE_STEP_EVIDENCE': {
            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
            border: 'border-indigo-200 dark:border-indigo-800',
            icon: 'bg-indigo-500 dark:bg-indigo-600',
            badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100',
            text: 'text-indigo-600 dark:text-indigo-400'
        },
        'REGISTER_ABONO': {
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800',
            icon: 'bg-green-500 dark:bg-green-600',
            badge: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
            text: 'text-green-600 dark:text-green-400'
        },
        'REGISTER_DISBURSEMENT': {
            bg: 'bg-teal-50 dark:bg-teal-900/20',
            border: 'border-teal-200 dark:border-teal-800',
            icon: 'bg-teal-500 dark:bg-teal-600',
            badge: 'bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100',
            text: 'text-teal-600 dark:text-teal-400'
        },
        'ARCHIVE_CLIENT': {
            bg: 'bg-gray-50 dark:bg-gray-900/20',
            border: 'border-gray-200 dark:border-gray-800',
            icon: 'bg-gray-500 dark:bg-gray-600',
            badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
            text: 'text-gray-600 dark:text-gray-400'
        }
    };

    return themeMap[actionType] || themeMap['COMPLETE_PROCESS_STEP'];
};

// Función para obtener la etiqueta de la acción
const getActionLabel = (log) => {
    let actionType = log.actionType;

    if (!actionType && log.details) {
        const scenario = log.details.scenario;
        actionType = log.details.action || (
            scenario === 'FIRST_COMPLETION' ? 'COMPLETE_PROCESS_STEP' :
                scenario === 'REOPEN_WITH_CHANGES' ? 'REOPEN_PROCESS_STEP' :
                    scenario === 'DATE_CHANGE' ? 'CHANGE_COMPLETION_DATE' :
                        scenario === 'EVIDENCE_CHANGE' ? 'CHANGE_STEP_EVIDENCE' :
                            'COMPLETE_PROCESS_STEP'
        );
    }

    const labelMap = {
        'CREATE_CLIENT': 'Cliente Creado',
        'UPDATE_CLIENT': 'Información Actualizada',
        'COMPLETE_PROCESS_STEP': 'Paso Completado',
        'REOPEN_PROCESS_STEP': 'Paso Reabierto',
        'CHANGE_COMPLETION_DATE': 'Fecha Modificada',
        'CHANGE_STEP_EVIDENCE': 'Evidencias Modificadas',
        'REGISTER_ABONO': 'Pago Registrado',
        'REGISTER_DISBURSEMENT': 'Desembolso Registrado',
        'ARCHIVE_CLIENT': 'Cliente Archivado',
        'CLIENT_RENOUNCE': 'Renuncia Registrada'
    };

    const baseLabel = labelMap[actionType] || 'Actividad';

    // Si es un paso completado, reabierto o modificado, agregar el nombre del paso
    if (log.actionData?.stepName || log.context?.stepName) {
        const stepName = log.actionData?.stepName || log.context?.stepName;
        if (actionType === 'COMPLETE_PROCESS_STEP') {
            return `Paso Completado: ${stepName}`;
        } else if (actionType === 'REOPEN_PROCESS_STEP') {
            return `Paso Reabierto: ${stepName}`;
        } else if (actionType === 'CHANGE_COMPLETION_DATE') {
            return `Fecha Modificada: ${stepName}`;
        } else if (actionType === 'CHANGE_STEP_EVIDENCE') {
            return `Evidencias Modificadas: ${stepName}`;
        }
    }

    return baseLabel;
};

// Componente para renderizar mensaje inteligente
const SmartMessage = ({ log }) => {
    // Detectar si es estructura nueva o anterior
    const isNewFormat = log.actionType && log.context && log.actionData;

    if (isNewFormat) {
        // Usar intérprete especializado
        try {
            const detailedMessage = interpretAuditForClientHistory(log);
            return <span className="text-gray-800 dark:text-gray-200">{detailedMessage}</span>;
        } catch (error) {
            console.error('Error interpretando mensaje:', error);
            return <span className="text-red-600">Error interpretando mensaje</span>;
        }
    } else {
        // Formato anterior: mostrar mensaje existente
        return <span className="text-gray-800 dark:text-gray-200">{log.message}</span>;
    }
};

// Componente para cada item del historial
const HistoryItem = ({ log, index }) => {
    const icon = getActionIcon(log);
    const theme = getActionTheme(log);
    const label = getActionLabel(log);

    // Formatear timestamp
    const timestamp = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
    const fullDate = format(timestamp, "d 'de' MMMM, yyyy 'a las' h:mm:ss a", { locale: es });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`relative pl-8 pb-8 ${index === 0 ? '' : ''}`}
        >
            {/* Línea vertical de conexión */}
            {index > 0 && (
                <div className="absolute left-4 top-0 w-0.5 h-8 bg-gray-200 dark:bg-gray-700 -translate-y-8"></div>
            )}

            {/* Icono circular */}
            <div className={`absolute left-0 flex items-center justify-center w-8 h-8 rounded-full ${theme.icon} ring-4 ring-white dark:ring-gray-900`}>
                {icon}
            </div>

            {/* Contenido del item */}
            <div className={`ml-4 p-4 rounded-lg border ${theme.bg} ${theme.border} shadow-sm`}>
                {/* Header con etiqueta */}
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${theme.badge}`}>
                        {label}
                    </span>
                </div>

                {/* Mensaje principal */}
                <div className="text-sm font-normal mb-3">
                    <SmartMessage log={log} />
                </div>

                {/* Footer con detalles de tiempo y usuario */}
                <div className={`text-xs ${theme.text} space-y-1`}>
                    <div>La acción se realizó: {fullDate}</div>
                    <div>Acción Realizada por: {log.user?.nombre || log.user?.name || log.userName || 'Usuario'}</div>
                </div>
            </div>
        </motion.div>
    );
};

// Hook personalizado para manejar el historial
const useClientHistory = (clienteId) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHistory = useCallback(async () => {
        if (!clienteId) return;

        try {
            setLoading(true);
            setError(null);

            const auditLogs = await getAuditLogsForCliente(clienteId);

            // Filtrar logs irrelevantes
            const filtered = auditLogs.filter(log =>
                log.details && log.details.action !== 'EDIT_NOTE'
            );

            // Ordenar por timestamp descendente (más reciente primero)
            const sorted = filtered.sort((a, b) => {
                const timestampA = a.timestamp?.toDate?.() || new Date(a.timestamp);
                const timestampB = b.timestamp?.toDate?.() || new Date(b.timestamp);
                return timestampB - timestampA;
            });

            console.log('📊 Historial cargado:', {
                total: sorted.length,
                clienteId,
                tipos: [...new Set(sorted.map(log => log.details?.action || log.actionType))],
                muestra: sorted.slice(0, 2).map(log => ({
                    action: log.details?.action || log.actionType,
                    hasMessage: !!log.message,
                    timestamp: log.timestamp
                }))
            });

            setLogs(sorted);
        } catch (err) {
            console.error('Error cargando historial:', err);
            setError('Error al cargar el historial del cliente');
        } finally {
            setLoading(false);
        }
    }, [clienteId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { logs, loading, error, refetch: fetchHistory };
};

// Componente principal
const NewTabHistorial = ({ cliente }) => {
    const { logs, loading, error, refetch } = useClientHistory(cliente?.id);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 dark:text-gray-400">Cargando historial...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
                <button
                    onClick={refetch}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    <Icons.RefreshCw className="w-4 h-4 mr-2" />
                    Reintentar
                </button>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="text-center py-12">
                <Icons.DocumentText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Sin actividad registrada
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                    No hay actividad registrada para este cliente aún.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Historial de Actividad
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Registro cronológico de todas las acciones realizadas
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        {logs.length} registros
                    </span>
                    <button
                        onClick={refetch}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        title="Actualizar historial"
                    >
                        <Icons.RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative">
                <AnimatePresence>
                    {logs.map((log, index) => (
                        <HistoryItem
                            key={log.id}
                            log={log}
                            index={index}
                        />
                    ))}
                </AnimatePresence>

                {/* Línea vertical final */}
                {logs.length > 0 && (
                    <div className="absolute left-4 bottom-0 w-0.5 h-4 bg-gradient-to-b from-gray-200 to-transparent dark:from-gray-700"></div>
                )}
            </div>
        </div>
    );
};

export default NewTabHistorial;