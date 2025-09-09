// src/pages/admin/audit-details/components/ResumenDeCambios.jsx
import React from 'react';
import { ArrowRight } from 'lucide-react';

const ResumenDeCambios = ({ titulo, cambios = [] }) => {
    if (cambios.length === 0) {
        return null;
    }

    return (
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
            <h4 className="font-semibold text-gray-600 dark:text-gray-300">{titulo}</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {cambios.map((cambio, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
                        <p className="font-semibold text-gray-700 dark:text-gray-200">{cambio.campo}</p>
                        <div className="flex items-center gap-2 mt-1 sm:mt-0">
                            <span className="text-gray-500 dark:text-gray-400 line-through truncate" title={String(cambio.anterior)}>
                                {String(cambio.anterior) || 'Vacío'}
                            </span>
                            <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <span className="font-bold text-gray-900 dark:text-gray-100 truncate" title={String(cambio.actual)}>
                                {String(cambio.actual) || 'Vacío'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResumenDeCambios;