// Utilidades para auditoría de archivos
import { formatDisplayDate } from './textFormatters';

/**
 * Formatea un timestamp para mostrar en la auditoría
 * @param {string|Date} timestamp - Timestamp en formato ISO string o objeto Date
 * @returns {string} Fecha formateada legible
 */
const formatAuditTimestamp = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';

    try {
        // Si es un string ISO, convertir a Date
        if (typeof timestamp === 'string') {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) {
                return 'Fecha inválida';
            }
            // Formatear con fecha y hora
            return new Intl.DateTimeFormat('es-CO', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).format(date);
        }

        // Si ya es un objeto Date
        if (timestamp instanceof Date) {
            return new Intl.DateTimeFormat('es-CO', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).format(timestamp);
        }

        return 'Formato de fecha no soportado';
    } catch (error) {
        console.error('Error al formatear timestamp de auditoría:', error);
        return 'Error al formatear fecha';
    }
};

/**
 * Extrae información de auditoría de archivos de un log de auditoría
 * @param {Object} auditLog - Log de auditoría del cliente
 * @returns {Array} Array con información detallada de cambios de archivos
 */
export const extractFileAuditInfo = (auditLog) => {
    if (!auditLog?.details?.auditDetails?.cambiosArchivos) {
        return [];
    }

    return auditLog.details.auditDetails.cambiosArchivos.map(cambio => ({
        documentType: cambio.fileAuditInfo.documentType,
        changeType: cambio.fileAuditInfo.changeType,
        previousUrl: cambio.fileAuditInfo.previousUrl,
        newUrl: cambio.fileAuditInfo.newUrl,
        timestamp: cambio.fileAuditInfo.timestamp,
        formattedTimestamp: formatAuditTimestamp(cambio.fileAuditInfo.timestamp),
        metadata: cambio.fileAuditInfo.metadata,
        // Información legible para mostrar al usuario
        description: generateFileChangeDescription(cambio.fileAuditInfo),
        // URLs accesibles para descargar (si están disponibles)
        downloadInfo: {
            canDownloadPrevious: !!cambio.fileAuditInfo.previousUrl,
            canDownloadNew: !!cambio.fileAuditInfo.newUrl,
            previousUrl: cambio.fileAuditInfo.previousUrl,
            newUrl: cambio.fileAuditInfo.newUrl
        }
    }));
};

/**
 * Genera una descripción legible del cambio de archivo
 * @param {Object} fileAuditInfo - Información de auditoría del archivo
 * @returns {string} Descripción del cambio
 */
const generateFileChangeDescription = (fileAuditInfo) => {
    const { changeType, documentType, metadata } = fileAuditInfo;

    switch (changeType) {
        case 'adjuntó':
            return `Se adjuntó por primera vez el documento: ${documentType}`;
        case 'eliminó':
            return `Se eliminó el documento: ${documentType}`;
        case 'reemplazó':
            return `Se reemplazó el documento: ${documentType} (archivo anterior disponible para comparación)`;
        default:
            return `Se modificó el documento: ${documentType}`;
    }
};

/**
 * Verifica si un log de auditoría contiene cambios de archivos
 * @param {Object} auditLog - Log de auditoría
 * @returns {boolean} True si contiene cambios de archivos
 */
export const hasFileChanges = (auditLog) => {
    return auditLog?.details?.auditDetails?.tieneArchivos === true;
};

/**
 * Obtiene un resumen de cambios de archivos para mostrar en la UI
 * @param {Object} auditLog - Log de auditoría
 * @returns {Object} Resumen de cambios de archivos
 */
export const getFileChangesSummary = (auditLog) => {
    const fileChanges = extractFileAuditInfo(auditLog);

    if (fileChanges.length === 0) {
        return null;
    }

    const summary = {
        totalChanges: fileChanges.length,
        added: fileChanges.filter(c => c.changeType === 'adjuntó').length,
        removed: fileChanges.filter(c => c.changeType === 'eliminó').length,
        replaced: fileChanges.filter(c => c.changeType === 'reemplazó').length,
        documents: fileChanges.map(c => c.documentType)
    };

    return summary;
};

/**
 * Función para uso administrativo - obtiene todas las URLs de archivos 
 * involucradas en un cambio para auditoría completa
 * @param {Object} auditLog - Log de auditoría
 * @returns {Array} Array con todas las URLs para auditoría
 */
export const getAllFileUrlsForAudit = (auditLog) => {
    const fileChanges = extractFileAuditInfo(auditLog);
    const urls = [];

    fileChanges.forEach(change => {
        if (change.previousUrl) {
            urls.push({
                type: 'previous',
                document: change.documentType,
                url: change.previousUrl,
                timestamp: change.timestamp,
                description: `Archivo anterior de ${change.documentType}`
            });
        }
        if (change.newUrl) {
            urls.push({
                type: 'new',
                document: change.documentType,
                url: change.newUrl,
                timestamp: change.timestamp,
                description: `Archivo nuevo de ${change.documentType}`
            });
        }
    });

    return urls;
};