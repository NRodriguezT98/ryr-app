// src/pages/admin/audit-details/components/DetalleSujeto.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const DetalleSujeto = ({ icon, titulo, nombre, enlace }) => {
    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">{icon}</div>
            <div className="min-w-0 flex-grow">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{titulo}</p>
                <Link to={enlace} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline truncate" title={nombre}>
                    {nombre}
                </Link>
            </div>
        </div>
    );
};

export default DetalleSujeto;