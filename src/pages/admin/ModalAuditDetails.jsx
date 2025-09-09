// src/components/admin/ModalAuditDetails.jsx (CORREGIDO)

import React from 'react';
import { X } from 'lucide-react';
import AuditLogDetails from './AuditLogDetails'; // La importación ya era correcta

const ModalAuditDetails = ({ log, onClose }) => {
    if (!log) return null;

    // --- INICIO DE LA SOLUCIÓN ---
    // 1. Separamos el mensaje largo en una acción principal y los detalles
    const messageParts = log.message.split(',');
    const mainAction = messageParts[0];
    const details = messageParts.slice(1).join(',').trim();
    // --- FIN DE LA SOLUCIÓN ---

    return (
        // Usamos nuestro componente Modal estandarizado para consistencia
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col m-4 max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Detalles de la Acción</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Contenido con scroll */}
                <div className="p-6 space-y-4 overflow-y-auto">
                    {/* --- INICIO DE LA SOLUCIÓN --- */}
                    {/* 2. Mostramos el mensaje de forma estructurada */}
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Acción Realizada por: <span className="text-gray-800 dark:text-gray-200">{log.userName}</span></p>
                        <div className="mt-2">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{mainAction}</p>
                            {details && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{details}</p>
                            )}
                        </div>
                    </div>
                    {/* --- FIN DE LA SOLUCIÓN --- */}

                    <div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Cambios Específicos</p>
                        <AuditLogDetails log={log} />
                    </div>
                </div>

                {/* Footer del Modal */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 text-right">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalAuditDetails;