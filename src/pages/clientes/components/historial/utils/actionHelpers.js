/**
 * Funciones helper para determinar iconos, temas y etiquetas de acciones
 */

import { Icons } from '../HistorialIcons';

/**
 * Detecta el tipo de acción desde un log
 */
export const detectActionType = (log) => {
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

    return actionType;
};

/**
 * Obtiene el icono apropiado según el tipo de acción
 * Retorna el componente de icono (no JSX), debe ser renderizado por el padre
 */
export const getActionIcon = (log) => {
    const actionType = detectActionType(log);

    const iconMap = {
        'CREATE_CLIENT': 'UserPlus',
        'UPDATE_CLIENT': 'Edit3',
        'TRANSFER_CLIENT': 'ArrowRightLeft',
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
    return Icons[iconName] || Icons.CheckCircle;
};

/**
 * Obtiene el color del tema según el tipo de acción
 */
export const getActionTheme = (log) => {
    const actionType = detectActionType(log);

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
        'TRANSFER_CLIENT': {
            bg: 'bg-slate-50 dark:bg-slate-900/30',
            border: 'border-slate-200 dark:border-slate-700/50',
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
        },
        'CLIENT_RENOUNCE': {
            bg: 'bg-red-50 dark:bg-red-900/30',
            border: 'border-red-200 dark:border-red-800/50',
            icon: 'bg-red-500 dark:bg-red-600',
            badge: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
            text: 'text-red-600 dark:text-red-400'
        }
    };

    return themeMap[actionType] || themeMap['COMPLETE_PROCESS_STEP'];
};

/**
 * Obtiene la etiqueta de la acción
 */
export const getActionLabel = (log) => {
    const actionType = detectActionType(log);

    const labelMap = {
        'CREATE_CLIENT': 'Cliente Creado',
        'UPDATE_CLIENT': 'Información Actualizada',
        'TRANSFER_CLIENT': 'Cliente Transferido',
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
