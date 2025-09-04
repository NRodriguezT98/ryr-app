import React from 'react';
import { Edit } from 'lucide-react';

const DetalleCambios = ({ cambios, titulo }) => {
    if (!cambios || cambios.length === 0) {
        return (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <Edit size={16} /> {titulo || 'Cambios Específicos'}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No se registraron cambios específicos para esta acción.</p>
            </div>
        );
    }

    return (
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2">
                <Edit size={16} /> {titulo || 'Cambios Específicos'}
            </h4>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-left text-xs text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="font-semibold p-2 w-1/3">Campo</th>
                            <th className="font-semibold p-2 w-1/3">Valor Anterior</th>
                            <th className="font-semibold p-2 w-1/3">Valor Nuevo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-600">
                        {cambios.map((cambio, index) => (
                            <tr key={index}>
                                <td className="p-2 font-semibold text-gray-800 dark:text-gray-200 capitalize">{cambio.campo.replace(/_/g, ' ')}</td>
                                <td className="p-2 text-gray-600 dark:text-gray-300">{String(cambio.anterior)}</td>
                                <td className="p-2 text-green-600 dark:text-green-400 font-medium">{String(cambio.actual)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DetalleCambios;