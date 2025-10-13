/**
 * Archivo índice para facilitar imports del módulo historial
 */

export { HistoryItem } from './HistoryItem';
export { ParsedMessage } from './ParsedMessage';
export { StructuredMessageRenderer } from './StructuredMessageRenderer'; // 🆕 FASE 1
export { Icons } from './HistorialIcons';
export { useClientHistory } from './useClientHistory';

// Componentes de mensajes
export { CompletionMessage } from './messages/CompletionMessage';
export { DateChangeMessage } from './messages/DateChangeMessage';
export { ReopeningMessage } from './messages/ReopeningMessage';
export { ClientCreatedMessage } from './messages/ClientCreatedMessage';

// Utilidades
export * from './utils/actionHelpers';
export * from './utils/messageParser';
