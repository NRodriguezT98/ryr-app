/**
 * Componente para renderizar cada item individual del historial
 */

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Icons } from './HistorialIcons';
import { User, FileText, Home, Edit3, Pencil, Paperclip, ArrowRight, Check, X, RefreshCw, DollarSign, Info } from 'lucide-react';
import { getActionIcon, getActionTheme, getActionLabel } from './utils/actionHelpers';
import { interpretAuditForClientHistory } from '@/utils/clientHistoryAuditInterpreter';
import { ParsedMessage } from './ParsedMessage';
import { TransferMessage } from './messages/TransferMessage';
import { RenounceMessage } from './messages/RenounceMessage';

// Componente para renderizar mensajes
const SmartMessage = ({ log }) => {
    // Si el log tiene un mensaje pre-generado (plantillas FASE 2), parsearlo y mostrarlo con estilo
    if (log.message) {
        return <ParsedMessage message={log.message} log={log} />;
    }

    // Detectar si es estructura nueva o anterior
    const isNewFormat = log.actionType && log.context && log.actionData;

    if (isNewFormat) {
        // Usar intérprete especializado (solo para logs sin mensaje pre-generado)
        try {
            const detailedMessage = interpretAuditForClientHistory(log);

            // Si el intérprete devuelve un objeto con __renderAsComponent, renderizar el componente correspondiente
            if (typeof detailedMessage === 'object' && detailedMessage.__renderAsComponent) {
                const componentType = detailedMessage.__renderAsComponent;
                const { __renderAsComponent, ...props } = detailedMessage;

                if (componentType === 'TransferMessage') {
                    return <TransferMessage {...props} />;
                }

                if (componentType === 'RenounceMessage') {
                    return <RenounceMessage {...props} />;
                }

                // Aquí se pueden agregar más componentes estructurados en el futuro
                console.warn('Componente estructurado no reconocido:', componentType);
            }            // Si es string, renderizar mensaje con formato (soporta saltos de línea y markdown básico)
            return <FormattedMessage message={detailedMessage} />;
        } catch (error) {
            console.error('Error interpretando mensaje:', error);
            return <span className="text-red-600">Error interpretando mensaje</span>;
        }
    } else {
        // Formato anterior: mostrar mensaje existente
        return <span className="text-gray-800 dark:text-gray-200">{log.message}</span>;
    }
};

// Componente auxiliar para renderizar mensajes con formato
const FormattedMessage = ({ message }) => {
    // Mapeo de marcadores a componentes de iconos
    const iconMap = {
        'ICON:USER': { Component: User, color: 'text-blue-600 dark:text-blue-400' },
        'ICON:FILE': { Component: FileText, color: 'text-blue-600 dark:text-blue-400' },
        'ICON:HOME': { Component: Home, color: 'text-blue-600 dark:text-blue-400' },
        'ICON:EDIT': { Component: Edit3, color: 'text-indigo-600 dark:text-indigo-400' },
        'ICON:PENCIL': { Component: Pencil, color: 'text-indigo-600 dark:text-indigo-400' },
        'ICON:PAPERCLIP': { Component: Paperclip, color: 'text-indigo-600 dark:text-indigo-400' },
        'ICON:ARROW': { Component: ArrowRight, color: 'text-gray-500 dark:text-gray-400' },
        'ICON:CHECK-GREEN': { Component: Check, color: 'text-green-600 dark:text-green-400' },
        'ICON:X-RED': { Component: X, color: 'text-red-600 dark:text-red-400' },
        'ICON:REFRESH': { Component: RefreshCw, color: 'text-yellow-600 dark:text-yellow-400' },
        'ICON:DOLLAR': { Component: DollarSign, color: 'text-green-600 dark:text-green-400' },
        'ICON:INFO': { Component: Info, color: 'text-blue-600 dark:text-blue-400' },
    };

    // Si el mensaje contiene saltos de línea, procesarlo
    if (message.includes('\n')) {
        const lines = message.split('\n');

        return (
            <div className="text-gray-800 dark:text-gray-200 space-y-1.5">
                {lines.map((line, index) => {
                    const isSeparator = line.includes('━━━━━');
                    const isListItem = /^\s+\d+\./.test(line);

                    // Detectar si la línea tiene un marcador de icono
                    const iconMatch = line.match(/\[ICON:([A-Z-]+)\]/);

                    // Procesar texto con formato Markdown e iconos
                    const processText = (text) => {
                        const parts = [];
                        let currentIndex = 0;

                        // Regex combinado para: links [texto](url), negrita **texto**, e iconos [ICON:TYPE]
                        const combinedRegex = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\[ICON:([A-Z-]+)\])/g;
                        let match;

                        while ((match = combinedRegex.exec(text)) !== null) {
                            // Agregar texto antes del match
                            if (match.index > currentIndex) {
                                parts.push(text.substring(currentIndex, match.index));
                            }

                            if (match[1]) {
                                // Es un link [texto](url)
                                parts.push(
                                    <a
                                        key={`link-${index}-${match.index}`}
                                        href={match[3]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {match[2]}
                                        <Icons.ExternalLink className="w-3 h-3" />
                                    </a>
                                );
                            } else if (match[4]) {
                                // Es negrita **texto**
                                parts.push(
                                    <strong key={`bold-${index}-${match.index}`} className="font-semibold text-gray-900 dark:text-gray-100">
                                        {match[5]}
                                    </strong>
                                );
                            } else if (match[6]) {
                                // Es un icono [ICON:TYPE]
                                const iconKey = match[6];
                                const iconData = iconMap[iconKey];

                                if (iconData) {
                                    const IconComponent = iconData.Component;
                                    parts.push(
                                        <IconComponent
                                            key={`icon-${index}-${match.index}`}
                                            className={`inline-block w-4 h-4 ${iconData.color}`}
                                        />
                                    );
                                }
                            }

                            currentIndex = combinedRegex.lastIndex;
                        }

                        // Agregar texto restante
                        if (currentIndex < text.length) {
                            parts.push(text.substring(currentIndex));
                        }

                        return parts.length > 0 ? parts : text;
                    };

                    // Si la línea está vacía, renderizar espacio pequeño
                    if (line.trim() === '') {
                        return <div key={index} className="h-2"></div>;
                    }

                    // Línea separadora
                    if (isSeparator) {
                        return (
                            <div key={index} className="border-t border-gray-300 dark:border-gray-600 my-2"></div>
                        );
                    }

                    // Primera línea (nombre del usuario y acción)
                    if (index === 0) {
                        return (
                            <div key={index} className="font-semibold text-base text-gray-900 dark:text-gray-100 mb-2">
                                {processText(line)}
                            </div>
                        );
                    }

                    // Líneas con iconos al inicio (información del cliente)
                    if (iconMatch && (line.includes('**Cliente:**') || line.includes('**Documento:**') || line.includes('**Vivienda:**'))) {
                        return (
                            <div key={index} className="flex items-start gap-2 text-sm py-0.5">
                                {processText(line)}
                            </div>
                        );
                    }

                    // Secciones principales con iconos (Nueva Vivienda, Cambios en Plan Financiero, etc.)
                    if (iconMatch && line.includes('**') && line.includes(':**')) {
                        return (
                            <div key={index} className="font-semibold text-sm text-gray-900 dark:text-gray-100 mt-3 mb-1 flex items-center gap-2">
                                {processText(line)}
                            </div>
                        );
                    }

                    // Items de lista numerados
                    if (isListItem) {
                        return (
                            <div key={index} className="ml-4 text-sm py-1 flex items-start gap-2">
                                {processText(line)}
                            </div>
                        );
                    }

                    // Sub-items (líneas que empiezan con espacios y tienen iconos)
                    if (line.startsWith('     ') && iconMatch) {
                        return (
                            <div key={index} className="ml-8 text-xs py-0.5 flex items-start gap-2">
                                {processText(line.trim())}
                            </div>
                        );
                    }

                    // Línea normal
                    return (
                        <div key={index} className="text-sm">
                            {processText(line)}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Mensaje simple sin formato especial
    return <span className="text-gray-800 dark:text-gray-200">{message}</span>;
};

export const HistoryItem = ({ log, index }) => {
    const IconComponent = getActionIcon(log);
    const theme = getActionTheme(log);
    const label = getActionLabel(log);

    // Formatear timestamp con validación robusta
    let timestamp;
    let fullDate;

    try {
        // Manejar timestamps de Firestore correctamente
        if (log.timestamp?.toDate && typeof log.timestamp.toDate === 'function') {
            timestamp = log.timestamp.toDate();
        } else if (log.timestamp?.seconds !== undefined) {
            timestamp = new Date(log.timestamp.seconds * 1000 + (log.timestamp.nanoseconds || 0) / 1000000);
        } else if (log.timestamp) {
            timestamp = new Date(log.timestamp);
        } else {
            console.warn('⚠️ Log sin timestamp:', log.id);
            timestamp = new Date();
        }

        if (isNaN(timestamp.getTime())) {
            console.warn('⚠️ Timestamp inválido en log:', log.id, log.timestamp);
            timestamp = new Date();
        }

        fullDate = format(timestamp, "d 'de' MMMM, yyyy 'a las' h:mm:ss a", { locale: es });
    } catch (error) {
        console.error('❌ Error formateando timestamp:', error, 'Log ID:', log.id, 'Timestamp:', log.timestamp);
        fullDate = 'Fecha no disponible';
        timestamp = new Date();
    }

    return (
        <div className={`relative pl-8 pb-8 ${index === 0 ? '' : ''}`}>
            {/* Línea vertical de conexión */}
            {index > 0 && (
                <div className="absolute left-4 top-0 w-0.5 h-8 bg-gray-200 dark:bg-gray-700 -translate-y-8"></div>
            )}

            {/* Icono circular */}
            <div className={`absolute left-0 flex items-center justify-center w-8 h-8 rounded-full ${theme.icon} ring-4 ring-white dark:ring-gray-900`}>
                <IconComponent className="w-4 h-4" />
            </div>

            {/* Contenido del item */}
            <div className={`ml-4 p-4 rounded-lg border ${theme.bg} ${theme.border} shadow-sm`}>
                {/* Mensaje principal */}
                <div className="text-sm font-normal mb-3">
                    <SmartMessage log={log} />
                </div>

                {/* Footer con detalles de tiempo y usuario */}
                <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-xs ${theme.text} pt-2 border-t border-gray-200 dark:border-gray-700`}>
                    <div className="flex items-center gap-1.5">
                        <Icons.Users className="w-3.5 h-3.5" />
                        <span className="text-gray-500 dark:text-gray-400">Acción Realizada por:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            {log.user?.nombre || log.user?.name || log.userName || 'Usuario'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Icons.Calendar className="w-3.5 h-3.5" />
                        <span className="text-gray-500 dark:text-gray-400">Fecha y hora de la acción:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{fullDate}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
