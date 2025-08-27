// src/pages/admin/audit-details/RestoreViviendaDetails.jsx

import React from 'react';
import { Home, MapPin, Clock, ArchiveRestore } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const DetailRow = ({ label, value }) => (
    <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-gray-800 dark:text-gray-200">{value || 'No especificado'}</p>
    </div>
);

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

const RestoreViviendaDetails = ({ log }) => {
    const details = log.details || {};
    const fechaAccion = log.timestamp?.toDate()
        ? format(log.timestamp.toDate(), "dd MMMM yyyy, hh:mm:ss a", { locale: es })
        : 'Fecha no disponible';

    return (
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
            <h4 className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2">
                <ArchiveRestore size={16} /> Detalles de la Restauración
            </h4>
            <DetailRow icon={<Home size={14} className="text-gray-500" />} label="Vivienda" value={details.viviendaNombre} />
            <DetailRow icon={<MapPin size={14} className="text-gray-500" />} label="Proyecto" value={details.proyectoNombre} />
            <DetailRow icon={<Clock size={14} className="text-gray-500" />} label="Hora de la Acción" value={fechaAccion} />
        </div>
    );
};

export default RestoreViviendaDetails;