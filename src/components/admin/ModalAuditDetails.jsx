// src/components/admin/ModalAuditDetails.jsx

import React from 'react';
import { X } from 'lucide-react';
// --- INICIO DE LA CORRECCIÓN ---
// La ruta ahora sube dos niveles (hasta 'src') y luego entra a 'pages/admin'
import AuditLogDetails from '../../pages/admin/AuditLogDetails';
// --- FIN DE LA CORRECCIÓN ---

const ModalAuditDetails = ({ log, onClose }) => {
    if (!log) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 m-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Detalles de la Acción</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Usuario</p>
                        <p className="text-gray-800 dark:text-gray-200">{log.userName}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Acción Realizada</p>
                        <p className="text-gray-800 dark:text-gray-200">{log.message}</p>
                    </div>
                    <hr className="dark:border-gray-600" />
                    <div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Cambios Específicos</p>
                        <AuditLogDetails details={log.details} />
                    </div>
                </div>

                <div className="mt-6 text-right">
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