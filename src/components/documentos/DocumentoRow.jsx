import React from 'react';
import FileUpload from '../FileUpload';
import { FileText, Eye, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

const DocumentoRow = ({ label, isRequired, currentFileUrl, estado, isReadOnly = false, onFileUploaded, onFileDeleted }) => {

    if (!isRequired && !currentFileUrl) {
        return null;
    }

    const isUploaded = estado === 'Subido';

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
                {currentFileUrl ? (
                    <div className="flex items-center gap-4">
                        <a
                            href={currentFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold px-3 py-1.5 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                        >
                            <Eye size={16} /> Ver
                        </a>
                        {!isReadOnly && (
                            <button onClick={onFileDeleted} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                ) : !isReadOnly ? (
                    <FileUpload
                        label="Subir"
                        filePath={onFileUploaded.filePath}
                        onUploadSuccess={onFileUploaded.onSuccess}
                        isCompact={true}
                    />
                ) : (
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                        Pendiente
                    </span>
                )}
            </div>
        </div>
    );
};

export default DocumentoRow;