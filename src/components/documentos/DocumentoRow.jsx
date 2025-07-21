import React from 'react';
import { CheckCircle, FileWarning, Eye, Clock } from 'lucide-react'; // Importamos el ícono de Reloj

const DocumentoRow = ({ label, isRequired, currentFileUrl, estado }) => {
    // Si no es un documento requerido, no lo mostramos (mantenemos la lógica por si acaso)
    if (!isRequired) {
        return null;
    }

    const isUploaded = estado === 'Subido';

    const statusInfo = isUploaded
        ? {
            text: "Subido",
            icon: <CheckCircle className="text-green-500" />,
            textColor: "text-green-600",
            bgColor: "hover:bg-green-50"
        }
        : {
            text: "Pendiente",
            icon: <Clock className="text-gray-400" />, // Usamos un ícono más neutral
            textColor: "text-gray-500",
            bgColor: "bg-gray-50 opacity-75" // Fondo gris y opacidad para indicar que está inactivo
        };

    return (
        <div className={`flex items-center justify-between p-4 transition-colors ${statusInfo.bgColor}`}>
            <div className="flex-1 flex items-center gap-4">
                {/* Ícono de Estado a la Izquierda */}
                <div className="flex-shrink-0">
                    {statusInfo.icon}
                </div>
                {/* Nombre del Documento */}
                <span className={`font-semibold ${isUploaded ? 'text-gray-800' : 'text-gray-500'}`}>
                    {label}
                </span>
            </div>

            <div className="flex-none flex items-center gap-4 ml-4">
                {isUploaded ? (
                    // Si está subido, mostramos un enlace para verlo
                    <a
                        href={currentFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-blue-100 text-blue-700 font-semibold px-3 py-1.5 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                    >
                        <Eye size={16} /> Ver
                    </a>
                ) : (
                    // Si está pendiente, mostramos un texto informativo
                    <span className="text-xs font-semibold text-gray-400">
                        Pendiente de Proceso
                    </span>
                )}
            </div>
        </div>
    );
};

export default DocumentoRow;