// src/components/admin/ModalAuditDetails.jsx (CORREGIDO)

import React from 'react';
import { X } from 'lucide-react';
import AuditLogDetails from './AuditLogDetails';
import button from '../../components/Button'; // Asumo que el componente Button se importa así

const ModalAuditDetails = ({ log, onClose, size = '2xl' }) => {
    if (!log) return null;

    // Tu lógica para separar el mensaje se mantiene
    const messageParts = log.message.split(',');
    const mainAction = messageParts[0];
    const details = messageParts.slice(1).join(',').trim();

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">

            {/* 1. Contenedor principal: lo hacemos flexible y con altura máxima */}
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-${size} m-4 flex flex-col max-h-[90vh]`}>

                {/* 2. Encabezado: no se encoge */}
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Detalles de la Acción</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* 3. ¡LA CLAVE! Este div ahora contiene TODO el contenido y es el que tiene el scroll */}
                <div className="overflow-y-auto p-6 space-y-4">

                    {/* Tu bloque de resumen, que querías mantener */}
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Acción Realizada por: <span className="text-gray-800 dark:text-gray-200">{log.userName}</span></p>
                        <div className="mt-2">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{mainAction}</p>
                            {details && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{details}</p>
                            )}
                        </div>
                    </div>

                    {/* El contenedor para los detalles específicos */}
                    <div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Cambios Específicos</p>
                        <AuditLogDetails log={log} />
                    </div>

                </div>

                {/* 4. Footer: no se encoge */}
                <div className="p-4 border-t dark:border-gray-700 text-right flex-shrink-0">
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