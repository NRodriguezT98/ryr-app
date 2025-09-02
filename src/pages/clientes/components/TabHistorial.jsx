// src/pages/clientes/components/TabHistorial.jsx
import React from 'react';
import { Clock } from 'lucide-react';

const TabHistorial = ({ clienteId }) => {
    // En el futuro, aquí harías la llamada para obtener y mostrar las notas y eventos
    return (
        <div className="animate-fade-in bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700">
            <h3 className="font-bold text-lg flex items-center gap-2 text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-600 pb-3">
                <Clock size={20} /> Historial y Notas
            </h3>
            <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">Funcionalidad en desarrollo.</p>
            </div>
        </div>
    );
};

export default TabHistorial;