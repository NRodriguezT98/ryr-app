import React from 'react';
import { CheckCircle, Eye, Clock } from 'lucide-react';

const DocumentoRow = ({ label, isRequired, currentFileUrl, estado }) => {
    if (!isRequired) {
        return null;
    }

    const isUploaded = estado === 'Subido';

    const statusInfo = isUploaded
        ? {
            icon: <CheckCircle className="text-green-500" />,
            bgColor: "hover:bg-green-50 dark:hover:bg-green-900/20"
        }
        : {
            icon: <Clock className="text-gray-400" />,
            bgColor: "bg-gray-50 dark:bg-gray-800/50 opacity-75"
        };

    return (
        <div className={`flex items-center justify-between p-4 transition-colors ${statusInfo.bgColor}`}>
            <div className="flex-1 flex items-center gap-4">
                <div className="flex-shrink-0">
                    {statusInfo.icon}
                </div>
                <span className={`font-semibold ${isUploaded ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                    {label}
                </span>
            </div>
            <div className="flex-none flex items-center gap-4 ml-4">
                {isUploaded ? (
                    <a
                        href={currentFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold px-3 py-1.5 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                    >
                        <Eye size={16} /> Ver
                    </a>
                ) : (
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                        Pendiente de Proceso
                    </span>
                )}
            </div>
        </div>
    );
};

export default DocumentoRow;