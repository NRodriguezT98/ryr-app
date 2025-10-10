/**
 * EJEMPLO: TabHistorial actualizado para usar el nuevo sistema de auditoría
 * 
 * Este archivo muestra cómo actualizar el componente TabHistorial
 * para usar el intérprete especializado en mensajes detallados para clientes
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../../context/AuthContext';
import { useHistorialCliente } from '../../../hooks/clientes/useHistorialCliente';

// NUEVO: Importar el intérprete especializado
import { interpretAuditForClientHistory } from '../../../utils/clientHistoryAuditInterpreter';

// Mantener los iconos SVG existentes
const IconosSVG = {
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
    Trash: ({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
    )
};

// NUEVA función para renderizar mensajes usando el intérprete
const RenderMessageWithInterpreter = ({ log }) => {
    // Detectar si es un log nuevo (con estructura unificada) o antiguo (con message)
    const isNewFormat = log.actionType && log.context && log.actionData;

    if (isNewFormat) {
        // Usar el intérprete especializado para generar mensaje detallado
        const detailedMessage = interpretAuditForClientHistory(log);
        return <span className="text-gray-800 dark:text-gray-200">{detailedMessage}</span>;
    } else {
        // Formato anterior: usar el mensaje existente
        return <span className="text-gray-800 dark:text-gray-200">{log.message}</span>;
    }
};

// NUEVA función para obtener iconos usando tanto formato nuevo como antiguo
const getActionIcon = (log) => {
    // Determinar el tipo de acción
    let actionType = log.actionType;

    // Si no hay actionType, mapear desde el formato anterior
    if (!actionType && log.details) {
        const scenario = log.details.scenario;
        const action = log.details.action;

        actionType = action || (
            scenario === 'FIRST_COMPLETION' ? 'COMPLETE_PROCESS_STEP' :
                scenario === 'REOPEN_WITH_CHANGES' ? 'REOPEN_PROCESS_STEP' :
                    scenario === 'DATE_CHANGE' ? 'CHANGE_COMPLETION_DATE' :
                        scenario === 'EVIDENCE_CHANGE' ? 'CHANGE_STEP_EVIDENCE' :
                            'COMPLETE_PROCESS_STEP'
        );
    }

    // Mapear iconos según el tipo de acción
    const iconMap = {
        'CREATE_CLIENT': 'Users',
        'UPDATE_CLIENT': 'Users',
        'COMPLETE_PROCESS_STEP': 'CheckCircle',
        'REOPEN_PROCESS_STEP': 'RotateCcw',
        'CHANGE_COMPLETION_DATE': 'Calendar',
        'CHANGE_STEP_EVIDENCE': 'FolderOpen',
        'REGISTER_ABONO': 'CreditCard',
        'REGISTER_DISBURSEMENT': 'CreditCard',
        'ARCHIVE_CLIENT': 'Archive',
        'DELETE_CLIENT_PERMANENTLY': 'Trash',
        'CLIENT_RENOUNCE': 'Archive'
    };

    const iconName = iconMap[actionType] || 'CheckCircle';
    const IconComponent = IconosSVG[iconName];

    return IconComponent ? <IconComponent className="w-4 h-4" /> : <IconosSVG.CheckCircle className="w-4 h-4" />;
};

// NUEVA función para obtener colores usando tanto formato nuevo como antiguo
const getActionColor = (log) => {
    let actionType = log.actionType;

    if (!actionType && log.details) {
        const scenario = log.details.scenario;
        const action = log.details.action;

        actionType = action || (
            scenario === 'FIRST_COMPLETION' ? 'COMPLETE_PROCESS_STEP' :
                scenario === 'REOPEN_WITH_CHANGES' ? 'REOPEN_PROCESS_STEP' :
                    scenario === 'DATE_CHANGE' ? 'CHANGE_COMPLETION_DATE' :
                        scenario === 'EVIDENCE_CHANGE' ? 'CHANGE_STEP_EVIDENCE' :
                            'COMPLETE_PROCESS_STEP'
        );
    }

    const colorMap = {
        'CREATE_CLIENT': 'bg-blue-500 dark:bg-blue-600',
        'UPDATE_CLIENT': 'bg-yellow-500 dark:bg-yellow-600',
        'COMPLETE_PROCESS_STEP': 'bg-emerald-500 dark:bg-emerald-600',
        'REOPEN_PROCESS_STEP': 'bg-orange-500 dark:bg-orange-600',
        'CHANGE_COMPLETION_DATE': 'bg-purple-500 dark:bg-purple-600',
        'CHANGE_STEP_EVIDENCE': 'bg-indigo-500 dark:bg-indigo-600',
        'REGISTER_ABONO': 'bg-green-500 dark:bg-green-600',
        'REGISTER_DISBURSEMENT': 'bg-teal-500 dark:bg-teal-600',
        'ARCHIVE_CLIENT': 'bg-gray-500 dark:bg-gray-600',
        'DELETE_CLIENT_PERMANENTLY': 'bg-red-500 dark:bg-red-600',
        'CLIENT_RENOUNCE': 'bg-red-400 dark:bg-red-500'
    };

    return colorMap[actionType] || 'bg-emerald-500 dark:bg-emerald-600';
};

// NUEVA función para obtener etiquetas usando tanto formato nuevo como antiguo
const getActionLabel = (log) => {
    let actionType = log.actionType;

    if (!actionType && log.details) {
        const scenario = log.details.scenario;
        const action = log.details.action;

        actionType = action || (
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
        'DELETE_CLIENT_PERMANENTLY': 'Cliente Eliminado',
        'CLIENT_RENOUNCE': 'Renuncia Registrada'
    };

    return labelMap[actionType] || 'Actividad';
};

// Componente LogItem actualizado
const LogItem = ({ log, index }) => {
    const icon = getActionIcon(log);
    const bgColor = getActionColor(log);
    const label = getActionLabel(log);

    // Determinar si es un paso completado para estilos especiales
    let actionType = log.actionType || log.details?.action;
    if (!actionType && log.details?.scenario === 'FIRST_COMPLETION') {
        actionType = 'COMPLETE_PROCESS_STEP';
    }

    return (
        <motion.li
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="mb-10 ms-6"
        >
            <span className={`absolute flex items-center justify-center ${actionType === 'COMPLETE_PROCESS_STEP'
                ? 'w-10 h-10 ring-4 ring-emerald-200 dark:ring-emerald-800'
                : 'w-8 h-8 ring-4 ring-white dark:ring-gray-800'
                } rounded-full -start-4 ${bgColor}`}>
                {icon}
                {actionType === 'COMPLETE_PROCESS_STEP' && (
                    <IconosSVG.CheckCircle className="w-3 h-3 text-white absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5" />
                )}
            </span>

            <div className={`p-4 border border-gray-200 rounded-lg shadow-sm ${actionType === 'COMPLETE_PROCESS_STEP'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-white dark:bg-gray-800 dark:border-gray-700'
                }`}>

                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${actionType === 'COMPLETE_PROCESS_STEP'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                        {label}
                    </span>

                    <time className={`text-sm font-normal ${actionType === 'COMPLETE_PROCESS_STEP'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-500 dark:text-gray-400'
                        }`}>
                        {formatDistanceToNow(log.timestamp, { addSuffix: true, locale: es })}
                    </time>
                </div>

                <div className="text-sm font-normal">
                    {/* USAR EL NUEVO INTÉRPRETE */}
                    <RenderMessageWithInterpreter log={log} />
                </div>

                <div className={`text-xs mt-2 ${actionType === 'COMPLETE_PROCESS_STEP'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-500 dark:text-gray-400'
                    }`}>
                    Por {log.userName}
                </div>
            </div>
        </motion.li>
    );
};

// Componente principal actualizado
const TabHistorialNuevo = ({ clienteId }) => {
    const { user } = useAuth();
    const { logs, loading, error, refreshLogs } = useHistorialCliente(clienteId);

    const sortedLogs = useMemo(() => {
        return [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [logs]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-gray-600 dark:text-gray-400">Cargando historial...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-600 dark:text-red-400 mb-4">Error al cargar el historial</div>
                <button
                    onClick={refreshLogs}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (sortedLogs.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No hay actividad registrada para este cliente.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Historial de Actividad
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {sortedLogs.length} registros
                </span>
            </div>

            <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                <ol className="relative">
                    <AnimatePresence>
                        {sortedLogs.map((log, index) => (
                            <LogItem key={log.id} log={log} index={index} />
                        ))}
                    </AnimatePresence>
                </ol>
            </div>
        </div>
    );
};

export default TabHistorialNuevo;

/**
 * VENTAJAS DE ESTA IMPLEMENTACIÓN:
 * 
 * 1. COMPATIBILIDAD TOTAL:
 *    - Funciona con registros antiguos y nuevos
 *    - No rompe funcionalidad existente
 * 
 * 2. MENSAJES MEJORADOS:
 *    - Usa intérpretes especializados para generar mensajes detallados
 *    - Cada acción tiene su propio formato optimizado
 * 
 * 3. MANTENIBILIDAD:
 *    - Lógica de interpretación centralizada
 *    - Fácil agregar nuevos tipos de acciones
 * 
 * 4. FLEXIBILIDAD:
 *    - Los mensajes se generan dinámicamente
 *    - Fácil personalizar según el contexto
 * 
 * 5. TRANSICIÓN SUAVE:
 *    - Migración gradual sin interrupciones
 *    - Ambos sistemas pueden coexistir
 */