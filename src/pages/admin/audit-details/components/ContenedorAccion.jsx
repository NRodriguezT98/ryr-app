// src/pages/admin/audit-details/components/ContenedorAccion.jsx
import React from 'react';

const ContenedorAccion = ({ usuario, descripcion, children }) => {
    return (
        <div className="space-y-4">
            {/* Encabezado estándar */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Acción Realizada por: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{usuario}</span>
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{descripcion}</p>
            </div>

            {/* Aquí se renderizarán los detalles específicos de cada acción */}
            {children}
        </div>
    );
};

export default ContenedorAccion;