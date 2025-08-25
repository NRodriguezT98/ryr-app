// src/pages/admin/audit-details/DeleteDetails.jsx

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toTitleCase } from '../../../utils/textFormatters';
import { User, Hash, Clock, Trash2, AlertTriangle } from 'lucide-react';

const DetailSection = ({ icon, title, children }) => (
    <div>
        <h4 className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2">
            {icon} {title}
        </h4>
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
            {children}
        </div>
    </div>
);

const DeleteDetails = ({ log }) => {
    const details = log.details || {};
    const fechaAccion = log.timestamp?.toDate()
        ? format(log.timestamp.toDate(), "dd MMMM yyyy, hh:mm:ss a", { locale: es })
        : 'Fecha no disponible';

    return (
        <div className="space-y-4 text-sm">
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300">
                <div className="flex items-center gap-3">
                    <AlertTriangle size={24} />
                    <div>
                        <h5 className="font-bold">Acción Irreversible</h5>
                        <p>Este cliente y todos sus datos asociados fueron eliminados permanentemente.</p>
                    </div>
                </div>
            </div>

            <DetailSection icon={<Trash2 size={16} />} title="Detalles de la Eliminación">
                <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-500" />
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Cliente Eliminado</p>
                        <p className="text-gray-800 dark:text-gray-200">{toTitleCase(details.clienteNombre)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Hash size={14} className="text-gray-500" />
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Cédula</p>
                        <p className="text-gray-800 dark:text-gray-200">{details.clienteId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-500" />
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Hora de la Acción</p>
                        <p className="text-gray-800 dark:text-gray-200">{fechaAccion}</p>
                    </div>
                </div>
            </DetailSection>
        </div>
    );
};

export default DeleteDetails;