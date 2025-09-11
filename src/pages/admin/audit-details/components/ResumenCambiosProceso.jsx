// src/pages/admin/audit-details/components/ResumenCambiosProceso.jsx
import React from 'react';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { formatDisplayDate } from '../../../../utils/textFormatters';

const ResumenCambiosProceso = ({ cambios }) => {
    if (!cambios || cambios.length === 0) {
        return <p className="text-sm text-gray-500">No se registraron cambios en los pasos del proceso.</p>;
    }

    return (
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
            <h4 className="font-semibold text-gray-600 dark:text-gray-300">Cambios en el Proceso</h4>
            <div className="space-y-2">
                {cambios.map((cambio, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-md bg-white dark:bg-gray-800 border dark:border-gray-600">
                        {cambio.accion === 'completó' ? (
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                        ) : (
                            <RefreshCw size={18} className="text-yellow-500 flex-shrink-0" />
                        )}
                        <div className="text-sm">
                            <p className="text-gray-800 dark:text-gray-200">
                                <span className="font-bold">{cambio.accion === 'completó' ? 'Se completó:' : 'Se reabrió:'}</span> {cambio.paso}
                            </p>
                            {cambio.fecha && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Fecha de finalización: {formatDisplayDate(cambio.fecha)}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResumenCambiosProceso;