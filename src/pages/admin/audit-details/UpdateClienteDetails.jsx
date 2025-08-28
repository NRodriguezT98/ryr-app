// src/pages/admin/audit-details/UpdateClienteDetails.jsx

import React from 'react';
import { Clock, ArrowRight, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const DetailRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-2">
        {icon}
        <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);

const UpdateClienteDetails = ({ log }) => {
    const details = log.details || {};
    const cambios = details.cambios || [];
    const fechaAccion = log.timestamp?.toDate()
        ? format(log.timestamp.toDate(), "dd MMMM yyyy, hh:mm:ss a", { locale: es })
        : 'Fecha no disponible';

    return (
        <div className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                <h4 className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2">
                    <User size={16} /> Resumen del Cliente
                </h4>
                <DetailRow icon={<User size={14} className="text-gray-500" />} label="Cliente Actualizado" value={details.clienteNombre} />
                <DetailRow icon={<User size={14} className="text-gray-500" />} label="Cédula" value={details.clienteId} />
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                <h4 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    Campos Modificados:
                </h4>
                {cambios.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                        {cambios.map((cambio, index) => (
                            <li key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-md">
                                <span className="font-semibold">{cambio.campo}:</span>
                                <span className="text-gray-500 dark:text-gray-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded">{cambio.anterior}</span>
                                <ArrowRight size={14} className="flex-shrink-0 text-blue-500" />
                                <span className="text-gray-800 dark:text-gray-200 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">{cambio.actual}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No se detectaron cambios específicos en los campos.</p>
                )}
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <DetailRow icon={<Clock size={14} className="text-gray-500" />} label="Hora de la Acción" value={fechaAccion} />
            </div>
        </div>
    );
};

export default UpdateClienteDetails;