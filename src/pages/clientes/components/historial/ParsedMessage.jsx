/**
 * Componente principal para parsear y renderizar mensajes de auditoría
 * Delega a componentes especializados según el tipo de mensaje
 * 
 * FASE 1: Prioriza datos estructurados, fallback a parsing legacy
 */

import {
    detectMessageType,
    extractBasicInfo,
    extractStepNumber,
    parseReopeningInfo,
    parseClientCreatedInfo
} from './utils/messageParser';

import { CompletionMessage } from './messages/CompletionMessage';
import { DateChangeMessage } from './messages/DateChangeMessage';
import { ReopeningMessage } from './messages/ReopeningMessage';
import { ClientCreatedMessage } from './messages/ClientCreatedMessage';
import { formatDisplayDate } from '../../../../utils/textFormatters';

// 🆕 FASE 1: Renderer de datos estructurados
import { StructuredMessageRenderer } from './StructuredMessageRenderer';

// 🆕 Importar FormattedMessage para procesar iconos
import { User, FileText, Home, Edit3, Pencil, Paperclip, ArrowRight, Check, X, RefreshCw, CreditCard } from 'lucide-react';
import { Icons } from './HistorialIcons';

// Componente auxiliar para renderizar mensajes con formato e iconos
const FormattedMessage = ({ message }) => {
    // Mapeo de marcadores a componentes de iconos
    const iconMap = {
        'USER': { Component: User, color: 'text-blue-600 dark:text-blue-400' },
        'FILE': { Component: CreditCard, color: 'text-purple-600 dark:text-purple-400' },
        'HOME': { Component: Home, color: 'text-blue-600 dark:text-blue-400' },
        'EDIT': { Component: Edit3, color: 'text-indigo-600 dark:text-indigo-400' },
        'PENCIL': { Component: Pencil, color: 'text-indigo-600 dark:text-indigo-400' },
        'PAPERCLIP': { Component: Paperclip, color: 'text-indigo-600 dark:text-indigo-400' },
        'ARROW': { Component: ArrowRight, color: 'text-gray-500 dark:text-gray-400' },
        'CHECK-GREEN': { Component: Check, color: 'text-green-600 dark:text-green-400' },
        'X-RED': { Component: X, color: 'text-red-600 dark:text-red-400' },
        'REFRESH': { Component: RefreshCw, color: 'text-yellow-600 dark:text-yellow-400' },
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
                                const iconKey = match[7]; // ✅ FIX: match[7] es el contenido DENTRO de [ICON:...]
                                const iconData = iconMap[iconKey];

                                if (iconData) {
                                    const IconComponent = iconData.Component;
                                    parts.push(
                                        <IconComponent
                                            key={`icon-${index}-${match.index}`}
                                            className={`inline-block w-4 h-4 ${iconData.color} mr-1.5`}
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
                    if (iconMatch && (line.includes('**Cliente:**') || line.includes('**Número de Cédula:**') || line.includes('**Vivienda:**'))) {
                        return (
                            <div key={index} className="flex items-start gap-2 text-sm py-0.5">
                                {processText(line)}
                            </div>
                        );
                    }

                    // Secciones principales (Cambios realizados, Datos modificados, Archivos modificados)
                    if (iconMatch && (line.includes('**Cambios realizados:**') || line.includes('**Datos modificados:**') || line.includes('**Archivos modificados:**'))) {
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

export const ParsedMessage = ({ message, log }) => {
    // 🆕 FASE 1: PRIORIDAD 1 - Usar datos estructurados si existen
    if (log.structured) {
        console.log('✅ Usando datos estructurados (sin parsing)', log.id);

        // � SOLUCIÓN DIRECTA PARA REAPERTURAS - Sin capas intermedias
        if (log.structured.type === 'reapertura') {
            const { metadata, step, dates } = log.structured;

            // Mapear evidencias DIRECTAMENTE aquí
            const evidenciasReemplazadas = (metadata?.replacedEvidences || []).map(replaced => ({
                antes: replaced.before?.name || 'Archivo anterior',
                antesUrl: replaced.before?.url,  // ✅ DIRECTO desde Firestore
                despues: replaced.after?.name || 'Archivo nuevo',
                despuesUrl: replaced.after?.url  // ✅ DIRECTO desde Firestore
            }));

            console.log('🎯 [ParsedMessage - REAPERTURA DIRECTA] evidencias mapeadas:', evidenciasReemplazadas);

            // Renderizar DIRECTAMENTE sin pasar por StructuredMessageRenderer
            return (
                <ReopeningMessage
                    pasoNombre={step?.name || 'Paso del proceso'}
                    numeroPaso={step?.number}
                    totalPasos={step?.total}
                    motivoReapertura={metadata?.reopenReason}
                    cambioFecha={metadata?.flags?.hasDateChange || false}
                    estadoAnterior={{
                        fecha: dates?.before ? formatDisplayDate(dates.before) : null
                    }}
                    estadoFinal={{
                        fecha: dates?.after ? formatDisplayDate(dates.after) : null
                    }}
                    evidenciasReemplazadas={evidenciasReemplazadas}
                    getEvidenciaUrl={(nombre) => {
                        // Fallback si no hay URL
                        console.warn('⚠️ Usando fallback getEvidenciaUrl para:', nombre);
                        return '#';
                    }}
                />
            );
        }

        // Para otros tipos, usar StructuredMessageRenderer
        return <StructuredMessageRenderer structured={log.structured} />;
    }

    // PRIORIDAD 2: Fallback a parsing legacy (logs antiguos)
    console.log('⚠️ Usando parsing legacy (log antiguo sin structured)', log.id);
    // Detectar tipo de mensaje
    const messageType = detectMessageType(message);

    // Extraer información básica común
    const basicInfo = extractBasicInfo(message);
    const stepNumbers = extractStepNumber(message);

    // Obtener evidencias con URLs desde el log
    const evidenciasConUrl = log.actionData?.evidenciasDespues || [];

    // Funciones helper para evidencias
    const getEvidenciaUrl = (nombreEvidencia) => {
        const evidenciaClean = nombreEvidencia.replace(/^\d+\.\s*/, '').trim();
        const found = evidenciasConUrl.find(ev =>
            ev.nombre === evidenciaClean ||
            ev.displayName === evidenciaClean
        );
        return found?.url;
    };

    const getEvidenciaDisplayName = (idx) => {
        if (evidenciasConUrl && evidenciasConUrl[idx]) {
            return evidenciasConUrl[idx].displayName ||
                evidenciasConUrl[idx].nombre ||
                evidenciasConUrl[idx].name ||
                `Evidencia ${idx + 1}`;
        }
        return `Evidencia ${idx + 1}`;
    };

    // Renderizar según tipo de mensaje
    if (messageType.isCompletion) {
        return (
            <CompletionMessage
                pasoNombre={basicInfo.pasoNombre}
                numeroPaso={stepNumbers.numeroPaso}
                totalPasos={stepNumbers.totalPasos}
                isAutoCompletion={messageType.isAutoCompletion}
                fecha={basicInfo.fecha}
                evidencias={basicInfo.evidencias}
                evidenciasConUrl={evidenciasConUrl}
                getEvidenciaUrl={getEvidenciaUrl}
                getEvidenciaDisplayName={getEvidenciaDisplayName}
            />
        );
    }

    if (messageType.isDateChange) {
        return (
            <DateChangeMessage
                pasoNombre={basicInfo.pasoNombre}
                numeroPaso={stepNumbers.numeroPaso}
                totalPasos={stepNumbers.totalPasos}
                fechaAnterior={basicInfo.fechaAnterior}
                fechaNueva={basicInfo.fechaNueva}
            />
        );
    }

    if (messageType.isReopening) {
        const reopeningInfo = parseReopeningInfo(basicInfo.lines);

        return (
            <ReopeningMessage
                pasoNombre={basicInfo.pasoNombre}
                numeroPaso={stepNumbers.numeroPaso}
                totalPasos={stepNumbers.totalPasos}
                motivoReapertura={reopeningInfo.motivoReapertura}
                estadoAnterior={reopeningInfo.estadoAnterior}
                estadoFinal={reopeningInfo.estadoFinal}
                cambioFecha={reopeningInfo.cambioFecha}
                evidenciasReemplazadas={reopeningInfo.evidenciasReemplazadas}
                getEvidenciaUrl={getEvidenciaUrl}
            />
        );
    }

    if (messageType.isClientCreated) {
        const clientInfo = parseClientCreatedInfo(basicInfo.lines);

        return <ClientCreatedMessage clientInfo={clientInfo} />;
    }

    // Fallback: usar FormattedMessage para procesar iconos y markdown
    return <FormattedMessage message={message} />;
};
