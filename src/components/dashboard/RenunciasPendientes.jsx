import React from 'react';
import { Link } from 'react-router-dom';
import { UserX, AlertTriangle } from 'lucide-react';

const formatCurrency = (value) => (value || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });

const RenunciasPendientes = ({ renuncias }) => {
    // --- LÓGICA DE FILTRADO AÑADIDA AQUÍ ---
    // Este componente ahora es responsable de filtrar solo las pendientes.
    const renunciasPendientes = renuncias.filter(r => r.estadoDevolucion === 'Pendiente');

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-full">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-500" />
                Devoluciones por Renuncia
            </h2>
            {renunciasPendientes.length > 0 ? (
                <ul className="space-y-3 max-h-80 overflow-y-auto">
                    {renunciasPendientes.map(renuncia => (
                        <li key={renuncia.id}>
                            <Link to={`/renuncias/detalle/${renuncia.id}`} className="block p-3 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-red-100 p-2 rounded-full">
                                            <UserX size={16} className="text-red-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{renuncia.clienteNombre}</p>
                                            <p className="text-xs text-gray-500">{renuncia.viviendaInfo}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-red-600">{formatCurrency(renuncia.totalAbonadoParaDevolucion)}</p>
                                        <p className="text-xs text-red-500">Devolución Pendiente</p>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500">No hay renuncias con devoluciones pendientes.</p>
                </div>
            )}
        </div>
    );
};

export default RenunciasPendientes;