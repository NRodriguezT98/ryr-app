import React from 'react';
import { Link } from 'react-router-dom';
import { UserX, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/textFormatters';

const RenunciasPendientes = ({ renuncias }) => {
    const renunciasPendientes = renuncias.filter(r => r.estadoDevolucion === 'Pendiente');

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-full">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-500" />
                Devoluciones por Renuncia
            </h2>
            {renunciasPendientes.length > 0 ? (
                <ul className="space-y-3 max-h-80 overflow-y-auto">
                    {renunciasPendientes.map(renuncia => (
                        <li key={renuncia.id}>
                            <Link to={`/renuncias/detalle/${renuncia.id}`} className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full">
                                            <UserX size={16} className="text-red-600 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{renuncia.clienteNombre}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{renuncia.viviendaInfo}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-red-600 dark:text-red-400">{formatCurrency(renuncia.totalAbonadoParaDevolucion)}</p>
                                        <p className="text-xs text-red-500 dark:text-red-500">Devolución Pendiente</p>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">No hay renuncias con devoluciones pendientes.</p>
                </div>
            )}
        </div>
    );
};

export default RenunciasPendientes;