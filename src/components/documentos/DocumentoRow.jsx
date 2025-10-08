import React from 'react';
import UniversalFileManager from '../UniversalFileManager';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const DocumentoRow = ({ label, isRequired, currentFileUrl, estado, isReadOnly = false, onFileUploaded, onFileDeleted, cliente }) => {

    if (!isRequired && !currentFileUrl) {
        return null;
    }

    const isUploaded = !!currentFileUrl;

    const statusInfo = isUploaded
        ? { icon: <CheckCircle className="text-green-500" /> }
        : { icon: <AlertTriangle className="text-yellow-500" /> };

    return (
        <div className={`flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50`}>
            <div className="flex-1 flex items-center gap-4">
                <div className="flex-shrink-0">
                    {statusInfo.icon}
                </div>
                <span className={`font-semibold ${isUploaded ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                    {label}
                </span>
            </div>
            <div className="flex-none flex items-center gap-4 ml-4">
                {!isReadOnly && (onFileUploaded || onFileDeleted) ? (
                    <UniversalFileManager
                        variant="compact"
                        label="Subir"
                        currentFileUrl={currentFileUrl}
                        filePath={onFileUploaded ? onFileUploaded.filePath(label) : null}
                        onUploadSuccess={onFileUploaded ? onFileUploaded.onSuccess : null}
                        onDelete={onFileDeleted}
                        disabled={!cliente?.datosCliente?.cedula}
                        readonly={isReadOnly}
                    />
                ) : currentFileUrl ? (
                    <a
                        href={currentFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold px-3 py-1.5 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                    >
                        Ver Documento
                    </a>
                ) : (
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                        {isReadOnly ? 'Bloqueado' : 'Pendiente'}
                    </span>
                )}
            </div>
        </div>
    );
};

export default DocumentoRow;