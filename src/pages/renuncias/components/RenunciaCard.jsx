import React, { Fragment, memo, useMemo } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { UserX, Calendar, Home, MoreVertical, CheckCircle, DollarSign, Eye, RotateCcw, FileText } from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../../utils/textFormatters';
import { usePermissions } from '../../../hooks/auth/usePermissions';

const RenunciaCard = ({ renuncia, onMarcarPagada, onCancelar }) => {
    const { can } = usePermissions();
    const isCerrada = renuncia.estadoDevolucion === 'Cerrada' || renuncia.estadoDevolucion === 'Pagada';

    // --- INICIO DE LA MODIFICACIÓN ---
    // Se determina si el usuario tiene permiso para alguna de las acciones del menú.
    const tieneAccionesDisponibles = useMemo(() => {
        // La acción 'verDetalle' está siempre disponible si se tiene el permiso.
        // Las otras acciones solo están disponibles si la renuncia no está cerrada.
        const puedeGestionar = !isCerrada && (can('renuncias', 'marcarDevolucion') || can('renuncias', 'cancelarRenuncia'));
        return can('renuncias', 'verDetalle') || puedeGestionar;
    }, [can, isCerrada]);
    // --- FIN DE LA MODIFICACIÓN ---

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${isCerrada ? 'border-slate-200 dark:border-slate-700' : 'border-orange-300 dark:border-orange-600'}`}>
            {/* Header con cliente y estado */}
            <div className={`p-6 border-b border-slate-100 dark:border-slate-700 ${isCerrada ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30' : 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className={`p-3 rounded-xl flex-shrink-0 ${isCerrada ? 'bg-green-100 dark:bg-green-900/50' : 'bg-orange-100 dark:bg-orange-900/50'}`}>
                            <UserX className={`w-6 h-6 ${isCerrada ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 break-words mb-1">
                                {renuncia.clienteNombre}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Home size={14} />
                                <span>{renuncia.viviendaInfo}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`px-3 py-1.5 text-sm font-bold rounded-full ${isCerrada ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'}`}>
                            {isCerrada ? 'Cerrada' : renuncia.estadoDevolucion}
                        </span>

                        {tieneAccionesDisponibles && (
                            <Menu as="div" className="relative">
                                <Menu.Button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    <MoreVertical size={18} />
                                </Menu.Button>
                                <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-150" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                    <Menu.Items className="absolute bottom-full right-0 mb-2 w-52 origin-bottom-right bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-600 divide-y divide-slate-100 dark:divide-slate-700 z-20 focus:outline-none">
                                        {can('renuncias', 'verDetalle') && (
                                            <div className="p-1">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            to={`/renuncias/detalle/${renuncia.id}`}
                                                            className={`${active ? 'bg-indigo-50 dark:bg-indigo-900/50' : ''} flex items-center w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-200 rounded-lg transition-colors`}
                                                        >
                                                            <Eye className="w-4 h-4 mr-3" /> Ver Detalle
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                        )}
                                        {!isCerrada && (
                                            <>
                                                {can('renuncias', 'marcarDevolucion') && (
                                                    <div className="p-1">
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={() => onMarcarPagada(renuncia)}
                                                                    className={`${active ? 'bg-green-50 dark:bg-green-900/50' : ''} flex items-center w-full px-3 py-2 text-sm text-green-600 dark:text-green-400 rounded-lg transition-colors`}
                                                                >
                                                                    <CheckCircle className="w-4 h-4 mr-3" /> Marcar Devolución
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    </div>
                                                )}
                                                {can('renuncias', 'cancelarRenuncia') && (
                                                    <div className="p-1">
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={() => onCancelar(renuncia)}
                                                                    className={`${active ? 'bg-orange-50 dark:bg-orange-900/50' : ''} flex items-center w-full px-3 py-2 text-sm text-orange-600 dark:text-orange-400 rounded-lg transition-colors`}
                                                                >
                                                                    <RotateCcw className="w-4 h-4 mr-3" /> Cancelar Renuncia
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        )}
                    </div>
                </div>
            </div>

            {/* Body con información de la renuncia */}
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fecha de renuncia */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                        <Calendar size={16} className="text-slate-500 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Fecha de Renuncia</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatDisplayDate(renuncia.fechaRenuncia)}</p>
                        </div>
                    </div>

                    {/* Monto de devolución */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                        <DollarSign size={16} className="text-red-500 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Monto Devolución</p>
                            <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(renuncia.totalAbonadoParaDevolucion)}</p>
                        </div>
                    </div>
                </div>

                {/* Motivo de renuncia */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border-l-4 border-slate-300 dark:border-slate-600">
                    <div className="flex items-start gap-3">
                        <FileText size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Motivo de Renuncia</p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 break-words">{renuncia.motivo}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(RenunciaCard);