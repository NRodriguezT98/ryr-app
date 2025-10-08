import React from 'react';
import { X, Download, Eye, AlertCircle, FileText, Calendar } from 'lucide-react';
import { extractFileAuditInfo, getFileChangesSummary } from '../utils/fileAuditHelper';

const ModalAuditoriaArchivos = ({ isOpen, onClose, auditLog }) => {
    if (!isOpen || !auditLog) return null;

    const fileChanges = extractFileAuditInfo(auditLog);
    const summary = getFileChangesSummary(auditLog);

    const handleDownloadFile = (url, filename) => {
        if (url) {
            // Crear un enlace temporal para descargar
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'documento';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const generateDownloadFilename = (documentType, isNew = true) => {
        const suffix = isNew ? 'nuevo' : 'anterior';
        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Limpiar el nombre del documento para usar como filename
        const cleanName = documentType
            .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
            .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
            .toLowerCase();

        return `${cleanName}_${suffix}_${timestamp}`;
    };

    const formatModalHeaderDate = (timestamp) => {
        if (!timestamp) return 'Fecha no disponible';

        try {
            // Si es un timestamp de Firestore
            if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
                return timestamp.toDate().toLocaleString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
            }

            // Si es un string ISO o Date
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) {
                return 'Fecha no disponible';
            }

            return date.toLocaleString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Error al formatear fecha del modal:', error);
            return 'Fecha no disponible';
        }
    };

    const getChangeTypeColor = (changeType) => {
        switch (changeType) {
            case 'adjuntó': return 'text-green-600 bg-green-50';
            case 'eliminó': return 'text-red-600 bg-red-50';
            case 'reemplazó': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const generateFriendlyFileName = (documentType, isNew = true) => {
        const prefix = isNew ? 'nuevo' : 'anterior';

        // Mapear tipos de documentos a nombres más amigables con emojis
        const documentNames = {
            'Cédula (Archivo)': { name: 'cédula', emoji: '🆔' },
            'Carta Aprob. Crédito': { name: 'carta de aprobación de crédito', emoji: '🏦' },
            'Carta Aprob. Subsidio': { name: 'carta de aprobación de subsidio', emoji: '🏠' },
            'Promesa Firmada': { name: 'promesa de compraventa', emoji: '📋' },
            'Minuta Firmada': { name: 'minuta firmada', emoji: '📄' },
            'Escritura': { name: 'escritura', emoji: '📜' },
            'Factura de Venta': { name: 'factura de venta', emoji: '🧾' }
        };

        const docInfo = documentNames[documentType] || { name: documentType.toLowerCase(), emoji: '📎' };
        const friendlyName = docInfo.name.charAt(0).toUpperCase() + docInfo.name.slice(1);
        return `${docInfo.emoji} ${friendlyName} ${prefix}`;
    };

    if (!summary) {
        return (
            <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Auditoría de Archivos</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Este registro no contiene cambios de archivos para auditar.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText size={20} />
                            Auditoría Detallada de Archivos
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Registro del {formatModalHeaderDate(auditLog.timestamp)}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                    {/* Resumen */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Resumen de Cambios</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalChanges}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                            </div>
                            {summary.added > 0 && (
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{summary.added}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Adjuntados</div>
                                </div>
                            )}
                            {summary.replaced > 0 && (
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{summary.replaced}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Reemplazados</div>
                                </div>
                            )}
                            {summary.removed > 0 && (
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{summary.removed}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Eliminados</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Lista de Cambios */}
                    <div className="space-y-4">
                        {fileChanges.map((change, index) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChangeTypeColor(change.changeType)}`}>
                                            {change.changeType.toUpperCase()}
                                        </span>
                                        <h5 className="font-medium text-gray-900 dark:text-white">{change.documentType}</h5>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                        <Calendar size={12} />
                                        {change.formattedTimestamp}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{change.description}</p>

                                {/* Archivos disponibles con enlaces amigables */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {change.downloadInfo.canDownloadPrevious && (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                                            <div className="space-y-2">
                                                <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">Archivo Anterior</p>
                                                <div className="flex flex-col gap-1">
                                                    <button
                                                        onClick={() => window.open(change.downloadInfo.previousUrl, '_blank')}
                                                        className="text-left text-sm text-yellow-700 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100 hover:underline font-medium"
                                                        title={`Abrir ${generateFriendlyFileName(change.documentType, false)} en nueva pestaña`}
                                                    >
                                                        {generateFriendlyFileName(change.documentType, false)}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadFile(change.downloadInfo.previousUrl, generateDownloadFilename(change.documentType, false))}
                                                        className="text-left text-xs text-yellow-600 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-100 hover:underline flex items-center gap-1"
                                                        title={`Descargar ${generateFriendlyFileName(change.documentType, false)} a tu computadora`}
                                                    >
                                                        <Download size={12} />
                                                        Descargar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {change.downloadInfo.canDownloadNew && (
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                                            <div className="space-y-2">
                                                <p className="text-xs font-medium text-green-800 dark:text-green-200">Archivo Nuevo</p>
                                                <div className="flex flex-col gap-1">
                                                    <button
                                                        onClick={() => window.open(change.downloadInfo.newUrl, '_blank')}
                                                        className="text-left text-sm text-green-700 dark:text-green-200 hover:text-green-900 dark:hover:text-green-100 hover:underline font-medium"
                                                        title={`Abrir ${generateFriendlyFileName(change.documentType, true)} en nueva pestaña`}
                                                    >
                                                        {generateFriendlyFileName(change.documentType, true)}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadFile(change.downloadInfo.newUrl, generateDownloadFilename(change.documentType, true))}
                                                        className="text-left text-xs text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100 hover:underline flex items-center gap-1"
                                                        title={`Descargar ${generateFriendlyFileName(change.documentType, true)} a tu computadora`}
                                                    >
                                                        <Download size={12} />
                                                        Descargar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Nota de seguridad */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                                <h5 className="font-medium text-blue-900 dark:text-blue-200">Nota de Auditoría</h5>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                    Las URLs de los archivos están guardadas para propósitos de auditoría.
                                    Los archivos eliminados pueden no estar disponibles para descarga, pero
                                    la información de auditoría se mantiene para trazabilidad completa.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalAuditoriaArchivos;