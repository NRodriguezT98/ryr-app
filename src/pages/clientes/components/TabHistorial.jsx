import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../../context/AuthContext';
import { useHistorialCliente } from '../../../hooks/clientes/useHistorialCliente';
import { updateNotaHistorial } from '../../../services/clienteService';
import { hasFileChanges } from '../../../utils/fileAuditHelper';
import AnimatedPage from '../../../components/AnimatedPage';
import FormularioNuevaNota from './FormularioNuevaNota';
import ModalEditarNota from './ModalEditarNota';
import ModalConfirmacion from '../../../components/ModalConfirmacion';
import ModalAuditoriaArchivos from '../../../components/ModalAuditoriaArchivos';
import toast from 'react-hot-toast';

// Iconos SVG embebidos directamente
const IconosSVG = {
    CheckCircle: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Calendar: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    FolderOpen: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
        </svg>
    ),
    RotateCcw: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
    ),
    Edit: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    ),
    AlertCircle: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L5.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
    ),
    RefreshCw: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    ),
    FileCheck: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
    ),
    FileX: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    ExternalLink: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
    ),
    MessageSquareText: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    ),
    UserPlus: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
    ),
    GitCommit: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path d="m1.05 12h6.9" />
            <path d="m16.05 12h6.9" />
        </svg>
    ),
    DollarSign: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
    ),
    UserX: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
        </svg>
    ),
    Archive: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6 6-6" />
        </svg>
    ),
    ArchiveRestore: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l3-3 3 3M7 8l3 3 3-3" />
        </svg>
    ),
    Unlock: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
    ),
    FileText: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    Clock: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Loader: ({ className = "w-4 h-4", color = "currentColor" }) => (
        <svg className={`${className} animate-spin`} fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    )
};

// Helper para obtener iconos según la acción
const getActionIcon = (action) => {
    const iconProps = { className: "w-4 h-4 text-white" };

    switch (action) {
        case 'ADD_NOTE':
            return <IconosSVG.MessageSquareText {...iconProps} />;
        case 'CREATE_CLIENT':
            return <IconosSVG.UserPlus {...iconProps} />;
        case 'UPDATE_CLIENT':
            return <IconosSVG.Edit {...iconProps} />;
        case 'EDIT_NOTE':
            return <IconosSVG.Edit {...iconProps} />;
        case 'UPDATE_PROCESO':
            return <IconosSVG.GitCommit {...iconProps} />;
        case 'COMPLETE_PROCESS_STEP':
            return <IconosSVG.CheckCircle {...iconProps} />;
        case 'RECOMPLETE_PROCESS_STEP':
            return <IconosSVG.RefreshCw {...iconProps} />;
        case 'REOPEN_PROCESS_STEP':
            return <IconosSVG.RefreshCw {...iconProps} />;
        case 'REOPEN_PROCESS_STEP_COMPLETE':
            return <IconosSVG.RotateCcw {...iconProps} />;
        case 'MODIFY_COMPLETED_STEP':
            return <IconosSVG.Edit {...iconProps} />;
        case 'CHANGE_COMPLETION_DATE':
            return <IconosSVG.Calendar {...iconProps} />;
        case 'CHANGE_STEP_EVIDENCE':
            return <IconosSVG.FolderOpen {...iconProps} />;
        case 'REGISTER_ABONO':
            return <IconosSVG.DollarSign {...iconProps} />;
        case 'REGISTER_DISBURSEMENT':
            return <IconosSVG.DollarSign {...iconProps} />;
        case 'REGISTER_CREDIT_DISBURSEMENT':
            return <IconosSVG.DollarSign {...iconProps} />;
        case 'VOID_ABONO':
            return <IconosSVG.UserX {...iconProps} />;
        case 'REVERT_VOID_ABONO':
            return <IconosSVG.RefreshCw {...iconProps} />;
        case 'CLIENT_RENOUNCE':
            return <IconosSVG.UserX {...iconProps} />;
        case 'RESTART_CLIENT_PROCESS':
            return <IconosSVG.RefreshCw {...iconProps} />;
        case 'ARCHIVE_CLIENT':
            return <IconosSVG.Archive {...iconProps} />;
        case 'RESTORE_CLIENT':
            return <IconosSVG.ArchiveRestore {...iconProps} />;
        case 'ANULAR_CIERRE_PROCESO':
            return <IconosSVG.Unlock {...iconProps} />;
        default:
            return <IconosSVG.FileText {...iconProps} />;
    }
};

// Helper para obtener color de fondo del icono (igual que antes)
const getActionColor = (action) => {
    switch (action) {
        case 'ADD_NOTE': return 'bg-blue-500';
        case 'CREATE_CLIENT': return 'bg-green-500';
        case 'UPDATE_CLIENT': return 'bg-amber-500';
        case 'EDIT_NOTE': return 'bg-amber-500';
        case 'UPDATE_PROCESO': return 'bg-indigo-500';
        case 'COMPLETE_PROCESS_STEP': return 'bg-emerald-500';
        case 'RECOMPLETE_PROCESS_STEP': return 'bg-teal-500';
        case 'REOPEN_PROCESS_STEP': return 'bg-orange-500';
        case 'REOPEN_PROCESS_STEP_COMPLETE': return 'bg-red-500';
        case 'MODIFY_COMPLETED_STEP': return 'bg-indigo-500';
        case 'CHANGE_COMPLETION_DATE': return 'bg-blue-600';
        case 'CHANGE_STEP_EVIDENCE': return 'bg-purple-500';
        case 'REGISTER_ABONO': return 'bg-green-600';
        case 'REGISTER_DISBURSEMENT': return 'bg-green-600';
        case 'REGISTER_CREDIT_DISBURSEMENT': return 'bg-green-600';
        case 'VOID_ABONO': return 'bg-red-500';
        case 'REVERT_VOID_ABONO': return 'bg-orange-500';
        case 'CLIENT_RENOUNCE': return 'bg-red-600';
        case 'RESTART_CLIENT_PROCESS': return 'bg-purple-500';
        case 'ARCHIVE_CLIENT': return 'bg-gray-500';
        case 'RESTORE_CLIENT': return 'bg-teal-500';
        case 'ANULAR_CIERRE_PROCESO': return 'bg-yellow-500';
        default: return 'bg-gray-400';
    }
};

// Helper para obtener etiqueta de la acción (igual que antes)
const getActionLabel = (action) => {
    switch (action) {
        case 'COMPLETE_PROCESS_STEP': return 'Paso completado por';
        case 'RECOMPLETE_PROCESS_STEP': return 'Paso re-completado por';
        case 'REOPEN_PROCESS_STEP': return 'Paso reabierto por';
        case 'REOPEN_PROCESS_STEP_COMPLETE': return 'Reapertura integral por';
        case 'MODIFY_COMPLETED_STEP': return 'Paso modificado por';
        case 'CHANGE_COMPLETION_DATE': return 'Fecha modificada por';
        case 'CHANGE_STEP_EVIDENCE': return 'Evidencias modificadas por';
        case 'UPDATE_PROCESO': return 'Proceso actualizado por';
        case 'UPDATE_CLIENT': return 'Cliente actualizado por';
        case 'CREATE_CLIENT': return 'Cliente creado por';
        case 'ADD_NOTE': return 'Nota añadida por';
        default: return 'Acción realizada por';
    }
};

// Helper para obtener badge de la acción
const getActionBadge = (action) => {
    switch (action) {
        case 'COMPLETE_PROCESS_STEP':
            return (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                    <IconosSVG.CheckCircle className="w-3 h-3 mr-1" />
                    Paso completado
                </span>
            );
        case 'RECOMPLETE_PROCESS_STEP':
            return (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200">
                    <IconosSVG.RefreshCw className="w-3 h-3 mr-1" />
                    Re-completado
                </span>
            );
        case 'REOPEN_PROCESS_STEP':
            return (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
                    <IconosSVG.RefreshCw className="w-3 h-3 mr-1" />
                    Reapertura
                </span>
            );
        case 'REOPEN_PROCESS_STEP_COMPLETE':
            return (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                    <IconosSVG.RotateCcw className="w-3 h-3 mr-1" />
                    Reapertura completa
                </span>
            );
        case 'MODIFY_COMPLETED_STEP':
            return (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
                    <IconosSVG.Edit className="w-3 h-3 mr-1" />
                    Modificación
                </span>
            );
        case 'CHANGE_COMPLETION_DATE':
            return (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                    <IconosSVG.Calendar className="w-3 h-3 mr-1" />
                    Cambio de fecha
                </span>
            );
        case 'CHANGE_STEP_EVIDENCE':
            return (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
                    <IconosSVG.FolderOpen className="w-3 h-3 mr-1" />
                    Evidencias
                </span>
            );
        default:
            return null;
    }
};

// Helper para obtener styling del contenido (igual que antes)
const getContentStyling = (action) => {
    switch (action) {
        case 'COMPLETE_PROCESS_STEP':
            return 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-300';
        case 'RECOMPLETE_PROCESS_STEP':
            return 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-700 dark:text-teal-300';
        case 'REOPEN_PROCESS_STEP':
            return 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-300';
        case 'REOPEN_PROCESS_STEP_COMPLETE':
            return 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300';
        case 'MODIFY_COMPLETED_STEP':
            return 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-700 dark:text-indigo-300';
        case 'CHANGE_COMPLETION_DATE':
            return 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300';
        case 'CHANGE_STEP_EVIDENCE':
            return 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-300';
        default:
            return 'text-gray-500 border-gray-200 bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300';
    }
};

// Helper para obtener styling del mensaje
const getMessageStyling = (action) => {
    const processStepActions = [
        'COMPLETE_PROCESS_STEP',
        'RECOMPLETE_PROCESS_STEP',
        'REOPEN_PROCESS_STEP',
        'REOPEN_PROCESS_STEP_COMPLETE',
        'MODIFY_COMPLETED_STEP',
        'CHANGE_COMPLETION_DATE',
        'CHANGE_STEP_EVIDENCE'
    ];

    return processStepActions.includes(action) ? 'font-medium leading-relaxed' : 'italic';
};

// Componente para botones de acceso a evidencias
const EvidenceAccessButton = ({ archivo, tipo, className = "" }) => {
    if (!archivo || !archivo.url) return null;

    const handleClick = () => {
        window.open(archivo.url, '_blank');
    };

    return (
        <button
            onClick={handleClick}
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors ${className}`}
            title={`Abrir ${archivo.nombre || 'archivo'}`}
        >
            <IconosSVG.ExternalLink className="w-3 h-3" />
            {tipo === 'anterior' ? 'Ver anterior' : 'Ver nuevo'}
        </button>
    );
};

// Componente para renderizar mensaje con iconos embebidos
const RenderMessageWithIcons = ({ log }) => {
    const { displayMessage, details } = log;

    // Para reapertura completa
    if (details?.action === 'REOPEN_PROCESS_STEP_COMPLETE') {
        const lines = displayMessage.split('\n');
        return (
            <div className="space-y-2">
                <div className="flex items-center">
                    <IconosSVG.RotateCcw className="w-4 h-4 inline mr-2 text-red-600" />
                    <span className="font-medium">{lines[0]}</span>
                </div>

                {lines.slice(1).map((line, index) => {
                    if (!line.trim()) return <br key={index} />;

                    if (line.includes('Motivo de reapertura:')) {
                        return (
                            <div key={index} className="flex items-start ml-6">
                                <IconosSVG.AlertCircle className="w-4 h-4 mr-2 text-orange-500 mt-0.5 flex-shrink-0" />
                                <span>{line}</span>
                            </div>
                        );
                    }

                    if (line.includes('Cambios realizados en la reapertura del paso:')) {
                        return (
                            <div key={index} className="flex items-center ml-6 font-medium">
                                <IconosSVG.Edit className="w-4 h-4 mr-2 text-indigo-500" />
                                <span>{line}</span>
                            </div>
                        );
                    }

                    if (line.includes('Fecha de paso completado:')) {
                        return (
                            <div key={index} className="flex items-center ml-10">
                                <IconosSVG.Calendar className="w-3 h-3 mr-2 text-blue-500" />
                                <span className="text-sm">{line}</span>
                            </div>
                        );
                    }

                    if (line.includes('Evidencias modificadas:')) {
                        return (
                            <div key={index} className="flex items-center ml-10">
                                <IconosSVG.FolderOpen className="w-3 h-3 mr-2 text-purple-500" />
                                <span className="text-sm">{line}</span>
                            </div>
                        );
                    }

                    if (line.includes('Reemplazada:')) {
                        return (
                            <div key={index} className="flex items-center ml-12">
                                <IconosSVG.RefreshCw className="w-3 h-3 mr-2 text-blue-600" />
                                <span className="text-sm">{line}</span>
                            </div>
                        );
                    }

                    if (line.includes('Anterior:')) {
                        return (
                            <div key={index} className="flex items-center ml-16">
                                <IconosSVG.FileX className="w-3 h-3 mr-2 text-red-500" />
                                <span className="text-sm">{line}</span>
                            </div>
                        );
                    }

                    if (line.includes('Nueva:')) {
                        return (
                            <div key={index} className="flex items-center ml-16">
                                <IconosSVG.FileCheck className="w-3 h-3 mr-2 text-green-500" />
                                <span className="text-sm">{line}</span>
                            </div>
                        );
                    }

                    return (
                        <div key={index} className="ml-6">
                            <span>{line}</span>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Para cambio de fecha
    if (details?.action === 'CHANGE_COMPLETION_DATE') {
        const lines = displayMessage.split('\n');
        return (
            <div className="space-y-2">
                <div className="flex items-center">
                    <IconosSVG.Calendar className="w-4 h-4 inline mr-2 text-blue-600" />
                    <span className="font-medium">{lines[0]}</span>
                </div>

                {lines.slice(1).map((line, index) => {
                    if (!line.trim()) return <br key={index} />;

                    if (line.includes('Fecha de completado:')) {
                        return (
                            <div key={index} className="ml-6 flex items-center">
                                <IconosSVG.Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                <span>{line}</span>
                            </div>
                        );
                    }

                    if (line.includes('Evidencias:')) {
                        return (
                            <div key={index} className="ml-6 flex items-center">
                                <IconosSVG.FolderOpen className="w-4 h-4 mr-2 text-purple-500" />
                                <span>{line}</span>
                            </div>
                        );
                    }

                    return <div key={index} className="ml-6"><span>{line}</span></div>;
                })}
            </div>
        );
    }

    // Para cambio de evidencias
    if (details?.action === 'CHANGE_STEP_EVIDENCE') {
        const lines = displayMessage.split('\n');
        return (
            <div className="space-y-2">
                <div className="flex items-center">
                    <IconosSVG.FolderOpen className="w-4 h-4 inline mr-2 text-purple-600" />
                    <span className="font-medium">{lines[0]}</span>
                </div>

                {lines.slice(1).map((line, index) => {
                    if (!line.trim()) return <br key={index} />;

                    if (line.includes('Fecha de completado:')) {
                        return (
                            <div key={index} className="ml-6 flex items-center">
                                <IconosSVG.Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                <span>{line}</span>
                            </div>
                        );
                    }

                    return <div key={index} className="ml-6"><span>{line}</span></div>;
                })}
            </div>
        );
    }

    // Para pasos completados
    if (details?.action === 'COMPLETE_PROCESS_STEP') {
        const lines = displayMessage.split('\n');
        return (
            <div className="space-y-2">
                <div className="flex items-center">
                    <IconosSVG.CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />
                    <span className="font-medium">{lines[0]}</span>
                </div>

                {lines.slice(1).map((line, index) => {
                    if (!line.trim()) return <br key={index} />;
                    return <div key={index} className="ml-6"><span>{line}</span></div>;
                })}
            </div>
        );
    }

    // Para otros casos, renderizar mensaje simple
    return (
        <div>
            <span className="whitespace-pre-wrap">{displayMessage}</span>
        </div>
    );
};

// Sub-componente para renderizar cada item del historial
const LogItem = ({ log, onEdit, onViewFileAudit, isReadOnly }) => {
    const { userData } = useAuth();
    const isNota = log.details?.action === 'ADD_NOTE';
    const timestamp = log.timestamp?.toDate ? log.timestamp.toDate() : new Date();
    const formattedDate = format(timestamp, "d 'de' MMMM, yyyy 'a las' h:mm a", { locale: es });
    const icon = getActionIcon(log.details?.action);

    const puedeEditar = !isReadOnly && isNota && log.userName === `${userData.nombres} ${userData.apellidos}`;
    const tieneArchivos = hasFileChanges(log);
    const cambiosProceso = log.details?.action === 'UPDATE_PROCESO' ? log.details.cambios : [];

    const renderCambiosProceso = () => {
        if (!cambiosProceso || cambiosProceso.length === 0) return null;
        return (
            <div className="mt-2 pt-2 border-t border-dashed dark:border-gray-500 space-y-1">
                {cambiosProceso.map((cambio, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {cambio.accion === 'completó' ? (
                            <IconosSVG.CheckCircle className="w-3 h-3 text-green-500" />
                        ) : cambio.accion === 'reabrió' ? (
                            <IconosSVG.RefreshCw className="w-3 h-3 text-yellow-500" />
                        ) : (
                            <IconosSVG.Edit className="w-3 h-3 text-blue-500" />
                        )}
                        <span className="text-xs">
                            {cambio.accion === 'completó' ? 'Se completó:' :
                                cambio.accion === 'reabrió' ? 'Se reabrió:' :
                                    'Se modificó:'} <span className="font-semibold text-gray-700 dark:text-gray-100">{cambio.paso}</span>
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <motion.li
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 ms-6"
        >
            <span className={`absolute flex items-center justify-center ${log.details?.action === 'COMPLETE_PROCESS_STEP'
                    ? 'w-10 h-10 ring-4 ring-emerald-200 dark:ring-emerald-800'
                    : 'w-8 h-8 ring-4 ring-white dark:ring-gray-800'
                } rounded-full -start-4 ${getActionColor(log.details?.action)}`}>
                {icon}
                {log.details?.action === 'COMPLETE_PROCESS_STEP' && (
                    <IconosSVG.CheckCircle className="w-3 h-3 text-white absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5" />
                )}
            </span>

            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                <div className="items-center justify-between mb-3 sm:flex">
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-300">
                        <span>{getActionLabel(log.details?.action)}</span>{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">{log.userName}</span>
                        {getActionBadge(log.details?.action)}
                        {tieneArchivos && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                <IconosSVG.FolderOpen className="w-3 h-3 mr-1" />
                                Con archivos
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {log.editado && <span className="text-xs text-gray-400 italic">(editado)</span>}
                        <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">{formattedDate}</time>
                    </div>
                </div>

                <div className={`relative p-3 text-sm border rounded-lg ${getContentStyling(log.details?.action)}`}>
                    <div className="absolute top-1 right-1 flex gap-1">
                        {tieneArchivos && (
                            <button
                                onClick={() => onViewFileAudit(log)}
                                className="p-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                                title="Ver auditoría de archivos"
                            >
                                <IconosSVG.FolderOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            </button>
                        )}
                        {puedeEditar && (
                            <button
                                onClick={() => onEdit(log)}
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                            >
                                <IconosSVG.Edit className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                            </button>
                        )}
                    </div>

                    <div className={`pr-8 ${getMessageStyling(log.details?.action)}`}>
                        <RenderMessageWithIcons log={log} />
                    </div>
                    {renderCambiosProceso()}
                </div>
            </div>
        </motion.li>
    );
};

// Componente principal
const TabHistorial = forwardRef(({ cliente, isReadOnly }, ref) => {
    const { userData } = useAuth();
    const userName = `${userData.nombres} ${userData.apellidos}`;
    const { historial, loading, error, fetchHistorial } = useHistorialCliente(cliente?.id);

    const [notaAEditar, setNotaAEditar] = useState(null);
    const [confirmacionCambios, setConfirmacionCambios] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [auditoriaArchivos, setAuditoriaArchivos] = useState(null);

    useImperativeHandle(ref, () => ({
        fetchHistorial
    }));

    if (!cliente) {
        return (
            <div className="flex items-center justify-center p-10">
                <IconosSVG.Loader className="animate-spin text-blue-500 mr-3" />
                <span className="text-gray-600 dark:text-gray-400">Cargando datos del cliente...</span>
            </div>
        );
    }

    const handleIniciarEdicion = (nota) => {
        setNotaAEditar(nota);
    };

    const handleGuardarEdicion = (nuevoTexto) => {
        const cambios = [{
            campo: "Contenido de la Nota",
            anterior: notaAEditar.message,
            actual: nuevoTexto
        }];
        setConfirmacionCambios({
            cambios,
            nuevoTexto,
            notaOriginal: notaAEditar
        });
        setNotaAEditar(null);
    };

    const handleConfirmarGuardado = async () => {
        if (!confirmacionCambios) return;
        setIsSubmitting(true);
        try {
            const { notaOriginal, nuevoTexto } = confirmacionCambios;
            await updateNotaHistorial(notaOriginal, nuevoTexto, userName);
            toast.success("Nota actualizada con éxito.");
            fetchHistorial();
        } catch (error) {
            console.error("Error al actualizar la nota:", error);
            toast.error("No se pudo actualizar la nota.");
        } finally {
            setIsSubmitting(false);
            setConfirmacionCambios(null);
        }
    };

    const handleVerAuditoriaArchivos = (log) => {
        setAuditoriaArchivos(log);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-10">
                <IconosSVG.Loader className="animate-spin text-blue-500 w-10 h-10" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <IconosSVG.AlertCircle className="mx-auto w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
        );
    }

    const puedeAnadirNotas = cliente.status === 'activo' || cliente.status === 'enProcesoDeRenuncia';

    // Debug temporal
    console.log('🔥 TabHistorial SVG renderizándose:', { cliente: cliente?.id, historial: historial?.length });

    return (
        <AnimatedPage>
            <div className="bg-red-100 border-2 border-red-500 p-6 rounded-lg mb-6 shadow-lg">
                <h3 className="text-xl font-bold text-red-800 mb-3">🚨 BANNER DE PRUEBA - TabHistorial con SVG Embebidos</h3>
                <p className="text-sm text-red-700 font-medium">Esta versión usa iconos SVG directamente embebidos en lugar de Lucide React.</p>
                <p className="text-xs text-red-600 mt-2">Si ves este mensaje, el componente SVG está funcionando.</p>
            </div>

            {puedeAnadirNotas && (
                <FormularioNuevaNota clienteId={cliente.id} onNotaAgregada={fetchHistorial} />
            )}

            {historial.length > 0 ? (
                <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:border-gray-600"></div>
                    <ol className="relative">
                        <AnimatePresence>
                            {historial.map(item => (
                                <LogItem
                                    key={item.id}
                                    log={item}
                                    onEdit={handleIniciarEdicion}
                                    onViewFileAudit={handleVerAuditoriaArchivos}
                                    isReadOnly={isReadOnly}
                                />
                            ))}
                        </AnimatePresence>
                    </ol>
                </div>
            ) : (
                <div className="text-center py-10">
                    <IconosSVG.Clock className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No hay historial de actividad para este cliente.</p>
                </div>
            )}

            <ModalEditarNota
                isOpen={!!notaAEditar}
                onClose={() => setNotaAEditar(null)}
                onSave={handleGuardarEdicion}
                notaAEditar={notaAEditar}
            />

            <ModalConfirmacion
                isOpen={!!confirmacionCambios}
                onClose={() => setConfirmacionCambios(null)}
                onConfirm={handleConfirmarGuardado}
                titulo="Confirmar Cambios en la Nota"
                cambios={confirmacionCambios?.cambios || []}
                isSubmitting={isSubmitting}
                size="xl"
            />

            <ModalAuditoriaArchivos
                isOpen={!!auditoriaArchivos}
                onClose={() => setAuditoriaArchivos(null)}
                auditLog={auditoriaArchivos}
            />
        </AnimatedPage>
    );
});

TabHistorial.displayName = 'TabHistorial';

export default TabHistorial;