import React from 'react';

/**
 * Muestra una sola fila en la lista de actividad reciente del dashboard.
 * @param {object} props
 * @param {React.ReactNode} props.icon - El icono a mostrar.
 * @param {string} props.title - El título principal de la actividad.
 * @param {string} props.subtitle - El texto secundario (ej. fecha o cliente).
 * @param {string} props.value - El valor numérico o texto a mostrar a la derecha.
 */
const ActivityItem = ({ icon, title, subtitle, value }) => {
    return (
        <li className="flex items-center justify-between py-3">
            <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
                    {icon}
                </div>
                <div>
                    <p className="font-medium text-gray-800">{title}</p>
                    <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
            </div>
            <p className="font-semibold text-gray-900">{value}</p>
        </li>
    );
};

export default ActivityItem;