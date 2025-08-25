// src/pages/admin/audit-details/RestoreDetails.jsx

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toTitleCase } from '../../../utils/textFormatters';
import { User, RefreshCw, Clock, Hash } from 'lucide-react'; // Importamos el ícono RefreshCw

// Componentes auxiliares para el diseño (copia los que creamos en el archivo principal)
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

const RestoreDetails = ({ log }) => {
    const details = log.details || {};
    const fechaAccion = log.timestamp?.toDate()
        ? format(log.timestamp.toDate(), "dd MMMM yyyy, hh:mm:ss a", { locale: es })
        : 'Fecha no disponible';

    return (
        <DetailSection icon={<RefreshCw size={16} />} title="Detalles de Restauración">
            <div className="flex items-center gap-2">
                <User size={14} className="text-gray-500" />
                <DetailRow label="Cliente" value={toTitleCase(details.clienteNombre)} />
            </div>
            <div className="flex items-center gap-2">
                <Hash size={14} className="text-gray-500" />
                <DetailRow label="Cédula" value={details.clienteId} />
            </div>
            <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-500" />
                <DetailRow label="Hora de la Acción" value={fechaAccion} />
            </div>
        </DetailSection>
    );
};

export default RestoreDetails;