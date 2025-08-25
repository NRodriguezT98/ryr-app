// src/pages/admin/audit-details/ArchiveDetails.jsx

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toTitleCase } from '../../../utils/textFormatters';
import { User, Archive, Clock, Hash } from 'lucide-react'; // Importamos el ícono de Hash

// Componente auxiliar para el diseño
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

// --- INICIO DE LA CORRECCIÓN ---
// 1. El componente ahora recibe el 'log' completo como prop.
const ArchiveDetails = ({ log }) => {
    // 2. Extraemos los 'details' desde el objeto 'log'.
    const details = log.details || {};

    // 3. Leemos el 'timestamp' desde el objeto 'log'.
    const fechaAccion = log.timestamp?.toDate()
        ? format(log.timestamp.toDate(), "dd MMMM yyyy, hh:mm:ss a", { locale: es })
        : 'Fecha no disponible';
    // --- FIN DE LA CORRECCIÓN ---


    return (
        <DetailSection icon={<Archive size={16} />} title="Detalles del Archivado">
            {/* --- INICIO DE LA CORRECCIÓN DEL FORMATO --- */}
            <div className="flex items-center gap-2">
                <User size={14} className="text-gray-500" />
                <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Cliente</p>
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
            {/* --- FIN DE LA CORRECCIÓN DEL FORMATO --- */}
        </DetailSection>
    );
};

export default ArchiveDetails;