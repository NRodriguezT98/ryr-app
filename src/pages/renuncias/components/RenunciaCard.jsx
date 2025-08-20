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
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border ${isCerrada ? 'border-gray-200 dark:border-gray-700' : 'border-orange-300 dark:border-orange-700'} p-4 grid grid-cols-1 sm:grid-cols-[2fr,1.5fr,auto] sm:items-center gap-4`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${isCerrada ? 'bg-green-100 dark:bg-green-900/50' : 'bg-orange-100 dark:bg-orange-900/50'}`}>
                    <UserX className={`w-6 h-6 ${isCerrada ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} />
                </div>
                <div>
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate">{renuncia.clienteNombre}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Home size={14} /> Vivienda: {renuncia.viviendaInfo}
                    </p>
                </div>
            </div>
            <div className="w-full space-y-2 sm:pl-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Calendar size={14} /> Fecha de Renuncia: {formatDisplayDate(renuncia.fechaRenuncia)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 truncate">
                    <FileText size={14} /> Motivo: <span className="font-semibold text-gray-800 dark:text-gray-200">{renuncia.motivo}</span>
                </p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 pt-2 border-t dark:border-gray-700">
                    <DollarSign size={14} /> Devolución: <span className='text-red-600 dark:text-red-400'>{formatCurrency(renuncia.totalAbonadoParaDevolucion)}</span>
                </p>
            </div>
            <div className="flex items-center gap-4 justify-self-end">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isCerrada ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {isCerrada ? 'Cerrada' : renuncia.estadoDevolucion}
                </span>

                {/* El menú solo se renderiza si hay acciones disponibles */}
                {tieneAccionesDisponibles && (
                    <Menu as="div" className="relative">
                        <Menu.Button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                            <MoreVertical size={20} />
                        </Menu.Button>
                        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                            <Menu.Items className="absolute bottom-full right-0 mb-2 w-56 origin-bottom-right bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 rounded-md shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 z-10 focus:outline-none">

                                {can('renuncias', 'verDetalle') && (
                                    <div className="px-1 py-1">
                                        <Menu.Item>{({ active }) => (<Link to={`/renuncias/detalle/${renuncia.id}`} className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex rounded-md items-center w-full px-2 py-2 text-sm text-gray-900 dark:text-gray-200`}><Eye className="w-5 h-5 mr-2" /> Ver Detalle</Link>)}</Menu.Item>
                                    </div>
                                )}

                                {!isCerrada && (
                                    <>
                                        {can('renuncias', 'marcarDevolucion') && (
                                            <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onMarcarPagada(renuncia)} className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex rounded-md items-center w-full px-2 py-2 text-sm text-gray-900 dark:text-gray-200`}><CheckCircle className="w-5 h-5 mr-2" /> Marcar Devolución</button>)}</Menu.Item></div>
                                        )}
                                        {can('renuncias', 'cancelarRenuncia') && (
                                            <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onCancelar(renuncia)} className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex rounded-md items-center w-full px-2 py-2 text-sm text-gray-900 dark:text-gray-200`}><RotateCcw className="w-5 h-5 mr-2" /> Cancelar Renuncia</button>)}</Menu.Item></div>
                                        )}
                                    </>
                                )}
                            </Menu.Items>
                        </Transition>
                    </Menu>
                )}
            </div>
        </div>
    );
};

export default memo(RenunciaCard);