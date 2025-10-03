// src/pages/admin/audit-details/components/AuditLogModalLayout.jsx
import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AuditLogModalLayout = ({ log, children }) => {
    // Extraemos la información relevante del log para el encabezado
    const timestamp = log.timestamp?.toDate ? log.timestamp.toDate() : new Date();
    const formattedDateTime = format(timestamp, "d 'de' MMMM 'de' yyyy, HH:mm 'hrs'", { locale: es });

    return (
        <div className="space-y-4">
            {/* Bloque superior - Mensaje principal de la acción */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-inner">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Acción realizada por: <span className="font-bold">{log.userName}</span>
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {log.message}
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Fecha y hora: {formattedDateTime}
                </p>
            </div>

            {/* Bloque de "Cambios Específicos" */}
            <div className="space-y-3"> {/* Agregamos un espacio entre los elementos internos */}
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Cambios Específicos</p>
                {/* Aquí se renderizarán los componentes específicos (DetalleSujeto, DetalleDatosClave, etc.) */}
                {children}
            </div>
        </div>
    );
};

export default AuditLogModalLayout;