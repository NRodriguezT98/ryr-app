// src/pages/admin/audit-details/components/ResumenCambiosProceso.jsx
import React from 'react';
import { CheckCircle, RefreshCw } from 'lucide-react';

const ResumenCambiosProceso = ({ cambios }) => {
    if (!cambios || cambios.length === 0) {
        return null; // Si no hay cambios, no mostramos nada.
    }

    return (
        // Contenedor que imita el estilo de "Información de la Anulación"
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Cambios en el Proceso
            </h4>
            <div className="space-y-2">
                {cambios.map((cambio, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {cambio.accion === 'completó'
                            ? <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                            : <RefreshCw size={16} className="text-yellow-500 flex-shrink-0" />
                        }
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{cambio.accion === 'completó' ? 'Se completó:' : 'Se reabrió:'}</span> {cambio.paso}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResumenCambiosProceso;