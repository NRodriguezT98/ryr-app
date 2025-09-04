import React from 'react';
import { Link } from 'react-router-dom';

const DetalleSujeto = ({ icon, titulo, nombre, enlace }) => {
    return (
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-1">
                {icon} {titulo}
            </h4>
            <div className="text-sm text-gray-800 dark:text-gray-200">
                <Link to={enlace} className="text-blue-500 hover:underline font-semibold" target="_blank">
                    {nombre}
                </Link>
            </div>
        </div>
    );
};

export default DetalleSujeto;