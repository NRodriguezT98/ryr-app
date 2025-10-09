import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { getAuditLogsForCliente } from '../../../services/auditService';
import { updateNotaHistorial } from '../../../services/clienteService';
import { useHistorialCliente } from '../../../hooks/clientes/useHistorialCliente';
import { useAuth } from '../../../context/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader, Edit, UserPlus, FileText, UserX, RefreshCw, Archive, ArchiveRestore, CheckCircle, MessageSquareText, GitCommit, DollarSign, Unlock, Eye, FolderOpen, AlertTriangle, Calendar, Settings, RotateCcw, Plus, Minus, FileCheck, FileX, Download, ExternalLink } from 'lucide-react';
import AnimatedPage from '../../../components/AnimatedPage';
import FormularioNuevaNota from './FormularioNuevaNota';
import ModalEditarNota from './ModalEditarNota';
import ModalConfirmacion from '../../../components/ModalConfirmacion';
import ModalAuditoriaArchivos from '../../../components/ModalAuditoriaArchivos';
import toast from 'react-hot-toast';
import { formatDisplayDate } from '../../../utils/textFormatters';
import { hasFileChanges } from '../../../utils/fileAuditHelper';

// Helper para asignar un ícono a cada tipo de acción
const getActionIcon = (action) => {
    const iconMap = {
        'ADD_NOTE': <MessageSquareText className="w-4 h-4 text-white" />,
        'CREATE_CLIENT': <UserPlus className="w-4 h-4 text-white" />,
        'UPDATE_CLIENT': <Edit className="w-4 h-4 text-white" />,
        'EDIT_NOTE': <Edit className="w-4 h-4 text-white" />,
        'UPDATE_PROCESO': <GitCommit className="w-4 h-4 text-white" />,
        'COMPLETE_PROCESS_STEP': <CheckCircle className="w-4 h-4 text-white" />,
        'RECOMPLETE_PROCESS_STEP': <RefreshCw className="w-4 h-4 text-white" />,
        'REOPEN_PROCESS_STEP': <RefreshCw className="w-4 h-4 text-white" />,
        'REOPEN_PROCESS_STEP_COMPLETE': <RefreshCw className="w-4 h-4 text-white" />,
        'MODIFY_COMPLETED_STEP': <Edit className="w-4 h-4 text-white" />,
        'CHANGE_COMPLETION_DATE': <GitCommit className="w-4 h-4 text-white" />,
        'CHANGE_STEP_EVIDENCE': <FolderOpen className="w-4 h-4 text-white" />,
        'REGISTER_ABONO': <DollarSign className="w-4 h-4 text-white" />,
        'REGISTER_DISBURSEMENT': <DollarSign className="w-4 h-4 text-white" />,
        'REGISTER_CREDIT_DISBURSEMENT': <DollarSign className="w-4 h-4 text-white" />,
        'VOID_ABONO': <UserX className="w-4 h-4 text-white" />,
        'REVERT_VOID_ABONO': <RefreshCw className="w-4 h-4 text-white" />,
        'CLIENT_RENOUNCE': <UserX className="w-4 h-4 text-white" />,
        'RESTART_CLIENT_PROCESS': <RefreshCw className="w-4 h-4 text-white" />,
        'ARCHIVE_CLIENT': <Archive className="w-4 h-4 text-white" />,
        'RESTORE_CLIENT': <ArchiveRestore className="w-4 h-4 text-white" />,
        'ANULAR_CIERRE_PROCESO': <Unlock className="w-4 h-4 text-white" />,
        'DEFAULT': <FileText className="w-4 h-4 text-white" />,
    };
    if (!action) return iconMap['DEFAULT'];
    return iconMap[action] || iconMap['DEFAULT'];
};

// Helper para obtener el color del fondo del ícono según el tipo de acción
const getActionColor = (action) => {
    const colorMap = {
        'ADD_NOTE': 'bg-blue-500',
        'CREATE_CLIENT': 'bg-green-500',
        'UPDATE_CLIENT': 'bg-amber-500',
        'EDIT_NOTE': 'bg-amber-500',
        'UPDATE_PROCESO': 'bg-indigo-500',
        'COMPLETE_PROCESS_STEP': 'bg-emerald-500', // Verde para completar pasos
        'RECOMPLETE_PROCESS_STEP': 'bg-teal-500', // Teal para re-completar pasos
        'REOPEN_PROCESS_STEP': 'bg-orange-500', // Naranja para reaperturas
        'REOPEN_PROCESS_STEP_COMPLETE': 'bg-red-500', // Rojo para reaperturas integrales
        'MODIFY_COMPLETED_STEP': 'bg-indigo-500', // Índigo para modificaciones
        'CHANGE_COMPLETION_DATE': 'bg-blue-600', // Azul para cambios de fecha
        'CHANGE_STEP_EVIDENCE': 'bg-purple-500', // Púrpura para cambios de evidencias
        'REGISTER_ABONO': 'bg-green-600',
        'REGISTER_DISBURSEMENT': 'bg-green-600',
        'REGISTER_CREDIT_DISBURSEMENT': 'bg-green-600',
        'VOID_ABONO': 'bg-red-500',
        'REVERT_VOID_ABONO': 'bg-orange-500',
        'CLIENT_RENOUNCE': 'bg-red-600',
        'RESTART_CLIENT_PROCESS': 'bg-purple-500',
        'ARCHIVE_CLIENT': 'bg-gray-500',
        'RESTORE_CLIENT': 'bg-teal-500',
        'ANULAR_CIERRE_PROCESO': 'bg-yellow-500',
        'DEFAULT': 'bg-gray-400',
    };
    return colorMap[action] || colorMap['DEFAULT'];
};

// Helper para obtener la etiqueta descriptiva de la acción
const getActionLabel = (action) => {
    const labelMap = {
        'COMPLETE_PROCESS_STEP': 'Paso completado por',
        'RECOMPLETE_PROCESS_STEP': 'Paso re-completado por',
        'REOPEN_PROCESS_STEP': 'Paso reabierto por',
        'REOPEN_PROCESS_STEP_COMPLETE': 'Reapertura integral por',
        'MODIFY_COMPLETED_STEP': 'Paso modificado por',
        'CHANGE_COMPLETION_DATE': 'Fecha modificada por',
        'CHANGE_STEP_EVIDENCE': 'Evidencias modificadas por',
        'UPDATE_PROCESO': 'Proceso actualizado por',
        'UPDATE_CLIENT': 'Cliente actualizado por',
        'CREATE_CLIENT': 'Cliente creado por',
        'DEFAULT': 'Acción realizada por'
    };
    return labelMap[action] || labelMap['DEFAULT'];
};

// Helper para obtener el badge correspondiente a la acción
const getActionBadge = (action) => {
    const badgeMap = {
        'COMPLETE_PROCESS_STEP': (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                <CheckCircle size={10} className="mr-1" />
                Paso completado
            </span>
        ),
        'RECOMPLETE_PROCESS_STEP': (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200">
                <RefreshCw size={10} className="mr-1" />
                Re-completado
            </span>
        ),
        'REOPEN_PROCESS_STEP': (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
                <RefreshCw size={10} className="mr-1" />
                Reapertura
            </span>
        ),
        'REOPEN_PROCESS_STEP_COMPLETE': (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                <RefreshCw size={10} className="mr-1" />
                Reapertura completa
            </span>
        ),
        'MODIFY_COMPLETED_STEP': (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
                <Edit size={10} className="mr-1" />
                Modificación
            </span>
        ),
        'CHANGE_COMPLETION_DATE': (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                <GitCommit size={10} className="mr-1" />
                Cambio de fecha
            </span>
        ),
        'CHANGE_STEP_EVIDENCE': (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
                <FolderOpen size={10} className="mr-1" />
                Evidencias
            </span>
        )
    };
    return badgeMap[action] || null;
};

// Helper para obtener el styling del contenido según el tipo de acción
const getContentStyling = (action) => {
    const styleMap = {
        'COMPLETE_PROCESS_STEP': 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-300',
        'RECOMPLETE_PROCESS_STEP': 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-700 dark:text-teal-300',
        'REOPEN_PROCESS_STEP': 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-300',
        'REOPEN_PROCESS_STEP_COMPLETE': 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300',
        'MODIFY_COMPLETED_STEP': 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-700 dark:text-indigo-300',
        'CHANGE_COMPLETION_DATE': 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300',
        'CHANGE_STEP_EVIDENCE': 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-300',
        'DEFAULT': 'text-gray-500 border-gray-200 bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300'
    };
    return styleMap[action] || styleMap['DEFAULT'];
};

// Helper para obtener el styling del texto del mensaje
const getMessageStyling = (action) => {
    const messageStyleMap = {
        'COMPLETE_PROCESS_STEP': 'font-medium leading-relaxed',
        'RECOMPLETE_PROCESS_STEP': 'font-medium leading-relaxed',
        'REOPEN_PROCESS_STEP': 'font-medium leading-relaxed',
        'REOPEN_PROCESS_STEP_COMPLETE': 'font-medium leading-relaxed',
        'MODIFY_COMPLETED_STEP': 'font-medium leading-relaxed',
        'CHANGE_COMPLETION_DATE': 'font-medium leading-relaxed',
        'CHANGE_STEP_EVIDENCE': 'font-medium leading-relaxed',
        'DEFAULT': 'italic'
    };
    return messageStyleMap[action] || messageStyleMap['DEFAULT'];
};

// Helper para obtener ícono de Lucide según el nombre
const getLucideIcon = (iconName, className = "w-4 h-4 inline mr-2") => {
    const iconMap = {
        'RotateCcw': <RotateCcw className={className} />,
        'AlertTriangle': <AlertTriangle className={className} />,
        'Calendar': <Calendar className={className} />,
        'Settings': <Settings className={className} />,
        'FileText': <FileText className={className} />,
        'Plus': <Plus className={className} />,
        'Minus': <Minus className={className} />,
        'RefreshCw': <RefreshCw className={className} />,
        'FileCheck': <FileCheck className={className} />,
        'FileX': <FileX className={className} />,
        'Download': <Download className={className} />,
        'ExternalLink': <ExternalLink className={className} />
    };
    return iconMap[iconName] || null;
};

// Componente para renderizar acceso a evidencias
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
            <ExternalLink className="w-3 h-3" />
            {tipo === 'anterior' ? 'Ver anterior' : 'Ver nuevo'}
        </button>
    );
};

// Componente para renderizar mensaje con iconos de Lucide y acceso a archivos
const RenderMessageWithIcons = ({ log }) => {
    const { displayMessage, details } = log;

    // Debug logging (remover después)
    console.log('RenderMessageWithIcons - log completo:', log);
    console.log('RenderMessageWithIcons - details:', details);
    console.log('RenderMessageWithIcons - displayMessage:', displayMessage);

    // Versión simplificada para debugging - solo mostrar icono de prueba
    if (details?.action === 'REOPEN_PROCESS_STEP_COMPLETE') {
        return (
            <div className="space-y-2">
                <div className="flex items-center">
                    <RotateCcw className="w-4 h-4 inline mr-2" />
                    <span className="font-medium">ICONO TEST - {displayMessage.split('\n')[0]}</span>
                </div>
                <div className="ml-6">
                    <span className="whitespace-pre-wrap">{displayMessage}</span>
                </div>
            </div>
        );
    }

    // Fallback original con debugging
    return (
        <div className="relative">
            <span className="whitespace-pre-wrap">{displayMessage}</span>
            <span className="text-xs text-green-500 ml-2">✓ Renderizado</span>
        </div>
    );

    // Código original comentado temporalmente
    /*
    if (details?.action === 'REOPEN_PROCESS_STEP_COMPLETE') {
        return (
            <div className="space-y-2">
                {/* Título principal */}
<div className="flex items-center">
    {getLucideIcon('RotateCcw')}
    <span className="font-medium">
        {displayMessage.split('\n')[0]}
    </span>
</div>

{/* Motivo de reapertura */ }
{
    details.motivoReapertura && (
        <div className="flex items-start">
            {getLucideIcon('AlertTriangle')}
            <span>Motivo de reapertura: {details.motivoReapertura}</span>
        </div>
    )
}

{/* Cambios realizados */ }
<div className="mt-3">
    <div className="flex items-center mb-2">
        {getLucideIcon('Settings')}
        <span className="font-medium">Cambios realizados en la reapertura del paso:</span>
    </div>

    {/* Cambio de fecha */}
    {details.cambiosRealizados?.fechaCambio && (
        <div className="ml-6 flex items-center">
            {getLucideIcon('Calendar')}
            <span>Fecha de paso completado: {details.fechaOriginal} → {details.fechaNueva}</span>
        </div>
    )}

    {/* Cambios de evidencias con acceso directo */}
    {details.evidenciasAcceso?.length > 0 ? (
        <div className="ml-6 mt-2">
            <div className="flex items-center mb-2">
                {getLucideIcon('FileText')}
                <span>Evidencias modificadas:</span>
            </div>

            {details.evidenciasAcceso.map((evidencia, index) => (
                <div key={index} className="ml-4 mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                    <div className="flex items-center gap-2 mb-2">
                        {evidencia.tipo === 'AGREGADA' && getLucideIcon('Plus', "w-3 h-3 text-green-600")}
                        {evidencia.tipo === 'ELIMINADA' && getLucideIcon('Minus', "w-3 h-3 text-red-600")}
                        {evidencia.tipo === 'REEMPLAZADA' && getLucideIcon('RefreshCw', "w-3 h-3 text-blue-600")}
                        <span className="font-medium text-sm">{evidencia.tipo}: {evidencia.nombreTipo}</span>
                    </div>

                    <div className="space-y-1 ml-4">
                        {evidencia.archivoAnterior && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {getLucideIcon('FileX', "w-3 h-3")}
                                    <span className="text-sm">Anterior: {evidencia.archivoAnterior.nombre}</span>
                                </div>
                                <EvidenceAccessButton archivo={evidencia.archivoAnterior} tipo="anterior" />
                            </div>
                        )}
                        {evidencia.archivoNuevo && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {getLucideIcon('FileCheck', "w-3 h-3")}
                                    <span className="text-sm">Nueva: {evidencia.archivoNuevo.nombre}</span>
                                </div>
                                <EvidenceAccessButton archivo={evidencia.archivoNuevo} tipo="nueva" />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    ) : (
        // Fallback: parsear el mensaje texto para mostrar evidencias con iconos
        displayMessage.includes('Evidencias modificadas:') && (
            <div className="ml-6 mt-2">
                <div className="flex items-center mb-2">
                    {getLucideIcon('FileText')}
                    <span>Evidencias modificadas:</span>
                </div>

                {/* Parsear las líneas del mensaje para mostrar con iconos */}
                <div className="ml-4 space-y-1">
                    {displayMessage.split('\n').slice(4).map((line, index) => {
                        if (!line.trim()) return null;

                        if (line.includes('Reemplazada:')) {
                            return (
                                <div key={index} className="flex items-center">
                                    {getLucideIcon('RefreshCw', "w-3 h-3 text-blue-600 mr-2")}
                                    <span className="text-sm">{line.trim()}</span>
                                </div>
                            );
                        }

                        if (line.includes('Anterior:')) {
                            return (
                                <div key={index} className="ml-4 flex items-center">
                                    {getLucideIcon('FileX', "w-3 h-3 mr-2")}
                                    <span className="text-sm">{line.trim()}</span>
                                </div>
                            );
                        }

                        if (line.includes('Nueva:')) {
                            return (
                                <div key={index} className="ml-4 flex items-center">
                                    {getLucideIcon('FileCheck', "w-3 h-3 mr-2")}
                                    <span className="text-sm">{line.trim()}</span>
                                </div>
                            );
                        }

                        return (
                            <div key={index} className="ml-2">
                                <span className="text-sm">{line.trim()}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        )
    )}
</div>
            </div >
        );
    }

// Verificar si es cambio de fecha específico
if (details?.action === 'CHANGE_COMPLETION_DATE') {
    const lines = displayMessage.split('\n');
    return (
        <div className="space-y-2">
            {/* Título principal */}
            <div className="flex items-center">
                {getLucideIcon('Calendar')}
                <span className="font-medium">
                    {lines[0]}
                </span>
            </div>

            {/* Resto del contenido */}
            {lines.slice(1).map((line, index) => {
                if (!line.trim()) return <br key={index} />;

                if (line.includes('Fecha de completado:')) {
                    return (
                        <div key={index} className="ml-6 flex items-center">
                            {getLucideIcon('Calendar', "w-4 h-4 mr-2")}
                            <span>{line}</span>
                        </div>
                    );
                }

                if (line.includes('Evidencias:')) {
                    return (
                        <div key={index} className="ml-6 flex items-center">
                            {getLucideIcon('FileText', "w-4 h-4 mr-2")}
                            <span>{line}</span>
                        </div>
                    );
                }

                return <div key={index} className="ml-6"><span>{line}</span></div>;
            })}
        </div>
    );
}

// Verificar si es cambio de evidencias específico
if (details?.action === 'CHANGE_STEP_EVIDENCE') {
    const lines = displayMessage.split('\n');
    return (
        <div className="space-y-2">
            {/* Título principal */}
            <div className="flex items-center">
                {getLucideIcon('FileText')}
                <span className="font-medium">
                    {lines[0]}
                </span>
            </div>

            {/* Acceso a evidencias si está disponible */}
            {details.evidenciasAcceso?.length > 0 && (
                <div className="ml-6 mt-2">
                    <div className="flex items-center mb-2">
                        {getLucideIcon('FileText', "w-4 h-4 mr-2")}
                        <span>Cambios en evidencias:</span>
                    </div>

                    {details.evidenciasAcceso.map((evidencia, index) => (
                        <div key={index} className="ml-4 mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                            <div className="flex items-center gap-2 mb-2">
                                {evidencia.tipo === 'AGREGADA' && getLucideIcon('Plus', "w-3 h-3 text-green-600")}
                                {evidencia.tipo === 'ELIMINADA' && getLucideIcon('Minus', "w-3 h-3 text-red-600")}
                                {evidencia.tipo === 'REEMPLAZADA' && getLucideIcon('RefreshCw', "w-3 h-3 text-blue-600")}
                                <span className="font-medium text-sm">{evidencia.tipo}: {evidencia.nombreTipo}</span>
                            </div>

                            <div className="space-y-1 ml-4">
                                {evidencia.archivoAnterior && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getLucideIcon('FileX', "w-3 h-3")}
                                            <span className="text-sm">Anterior: {evidencia.archivoAnterior.nombre}</span>
                                        </div>
                                        <EvidenceAccessButton archivo={evidencia.archivoAnterior} tipo="anterior" />
                                    </div>
                                )}
                                {evidencia.archivoNuevo && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getLucideIcon('FileCheck', "w-3 h-3")}
                                            <span className="text-sm">Nueva: {evidencia.archivoNuevo.nombre}</span>
                                        </div>
                                        <EvidenceAccessButton archivo={evidencia.archivoNuevo} tipo="nueva" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Resto del contenido */}
            {lines.slice(1).map((line, index) => {
                if (!line.trim()) return <br key={index} />;

                if (line.includes('Fecha de completado:')) {
                    return (
                        <div key={index} className="ml-6 flex items-center">
                            {getLucideIcon('Calendar', "w-4 h-4 mr-2")}
                            <span>{line}</span>
                        </div>
                    );
                }

                return <div key={index} className="ml-6"><span>{line}</span></div>;
            })}
        </div>
    );
}

// Para otros tipos de mensajes, renderizar con indicador visual de que funciona
return (
    <div className="relative">
        <span className="whitespace-pre-wrap">{displayMessage}</span>
        {/* Indicador temporal para debug - quitar después */}
        <span className="text-xs text-blue-500 ml-2">✓</span>
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

    // Extraemos los detalles relevantes de forma segura
    const cambiosProceso = log.details?.action === 'UPDATE_PROCESO' ? log.details.cambios : [];
    // Usar el mensaje procesado por el hook (el mismo que auditoría)
    const messageContent = log.displayMessage;

    // Mejorar visualización de cambios de proceso (reabrió/completó)
    const renderCambiosProceso = () => {
        if (!cambiosProceso || cambiosProceso.length === 0) return null;
        return (
            <div className="mt-2 pt-2 border-t border-dashed dark:border-gray-500 space-y-1">
                {cambiosProceso.map((cambio, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {cambio.accion === 'completó' ? (
                            <CheckCircle size={14} className="text-green-500" />
                        ) : cambio.accion === 'reabrió' ? (
                            <RefreshCw size={14} className="text-yellow-500" />
                        ) : (
                            <Edit size={14} className="text-blue-500" />
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
        <li className="mb-10 ms-6">
            <span className={`absolute flex items-center justify-center ${log.details?.action === 'COMPLETE_PROCESS_STEP' ? 'w-10 h-10 ring-4 ring-emerald-200 dark:ring-emerald-800' : 'w-8 h-8 ring-4 ring-white dark:ring-gray-800'
                } rounded-full -start-4 ${getActionColor(log.details?.action)}`}>
                {icon}
                {/* Agregar checkmark extra para pasos completados */}
                {log.details?.action === 'COMPLETE_PROCESS_STEP' && (
                    <CheckCircle className="w-3 h-3 text-white absolute -bottom-1 -right-1 bg-emerald-500 rounded-full" />
                )}
            </span>
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                <div className="items-center justify-between mb-3 sm:flex">
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-300">
                        {isNota ? 'Nota añadida por' : getActionLabel(log.details?.action)} <span className="font-semibold text-gray-900 dark:text-white">{log.userName}</span>

                        {/* Etiquetas especiales para diferentes tipos de acciones */}
                        {getActionBadge(log.details?.action)}

                        {tieneArchivos && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                <FolderOpen size={10} className="mr-1" />
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
                                <FolderOpen size={14} className="text-blue-600 dark:text-blue-400" />
                            </button>
                        )}
                        {puedeEditar && (
                            <button onClick={() => onEdit(log)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">
                                <Edit size={14} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        )}
                    </div>

                    <div className={`pr-8 ${getMessageStyling(log.details?.action)}`}>
                        <RenderMessageWithIcons log={log} />
                    </div>
                    {renderCambiosProceso()}
                </div>
            </div>
        </li>
    );
};

// Componente principal de la pestaña
const TabHistorial = forwardRef(({ cliente, isReadOnly }, ref) => {
    const { userData } = useAuth();
    const userName = `${userData.nombres} ${userData.apellidos}`;

    const { historial, loading, error, fetchHistorial } = useHistorialCliente(cliente?.id);

    useImperativeHandle(ref, () => ({
        fetchHistorial
    }));

    const [notaAEditar, setNotaAEditar] = useState(null);
    const [confirmacionCambios, setConfirmacionCambios] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [auditoriaArchivos, setAuditoriaArchivos] = useState(null);

    if (!cliente) {
        // Esto previene el error y muestra un estado de carga o nulo si los datos no han llegado.
        return <div className="p-10 text-center">Cargando datos del cliente...</div>;
    }

    const clienteId = cliente.id;

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
            console.error("Error DETALLADO al actualizar la nota:", error);
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
                <Loader className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }


    const puedeAnadirNotas = cliente.status === 'activo' || cliente.status === 'enProcesoDeRenuncia';

    return (
        <AnimatedPage>
            {/* El formulario para añadir notas solo aparece si el cliente no ha renunciado */}
            {puedeAnadirNotas && (
                <FormularioNuevaNota clienteId={clienteId} onNotaAgregada={fetchHistorial} />
            )}

            {historial.length > 0 ? (
                <ol className="relative border-s border-gray-200 dark:border-gray-600">
                    {historial.map(item =>
                        <LogItem
                            key={item.id}
                            log={item}
                            onEdit={handleIniciarEdicion}
                            onViewFileAudit={handleVerAuditoriaArchivos}
                            isReadOnly={isReadOnly}
                        />
                    )}
                </ol>
            ) : (
                <div className="text-center py-10">
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

export default TabHistorial;