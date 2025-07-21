import React, { Fragment, memo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Menu, Transition } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { UserX, Calendar, Home, MoreVertical, CheckCircle, DollarSign, Eye, Pencil, RotateCcw } from 'lucide-react';
import { formatCurrency } from '../../../utils/textFormatters';

const formatDate = (dateString) => {
    if (!dateString) return "Fecha inválida";
    try {
        const date = new Date(dateString);
        return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) { return "Fecha inválida"; }
};

const RenunciaCard = ({ renuncia, onMarcarPagada, onEditar, onCancelar }) => {
    const isPagada = renuncia.estadoDevolucion === 'Pagada';

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border ${isPagada ? 'border-gray-200 dark:border-gray-700' : 'border-orange-300 dark:border-orange-700'} p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${isPagada ? 'bg-gray-100 dark:bg-gray-700' : 'bg-orange-100 dark:bg-orange-900/50'}`}>
                    <UserX className={`w-6 h-6 ${isPagada ? 'text-gray-500 dark:text-gray-400' : 'text-orange-600 dark:text-orange-400'}`} />
                </div>
                <div>
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{renuncia.clienteNombre}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Home size={14} /> Vivienda: {renuncia.viviendaInfo}
                    </p>
                </div>
            </div>
            <div className="w-full sm:w-auto flex-grow pl-0 sm:pl-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-1">
                    <Calendar size={14} /> Fecha de Renuncia: {formatDate(renuncia.fechaRenuncia)}
                </p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <DollarSign size={14} /> Devolución: <span className='text-red-600 dark:text-red-400'>{formatCurrency(renuncia.totalAbonadoParaDevolucion)}</span>
                </p>
            </div>
            <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isPagada ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {renuncia.estadoDevolucion}
                </span>
                <Menu as="div" className="relative">
                    <Menu.Button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                        <MoreVertical size={20} />
                    </Menu.Button>
                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                        <Menu.Items className="absolute bottom-full right-0 mb-2 w-56 origin-bottom-right bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 rounded-md shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 z-10 focus:outline-none">
                            <div className="px-1 py-1"><Menu.Item>{({ active }) => (<Link to={`/renuncias/detalle/${renuncia.id}`} className={`${active ? 'bg-indigo-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Eye className="w-5 h-5 mr-2" /> Ver Detalle</Link>)}</Menu.Item></div>
                            {!isPagada && (
                                <>
                                    <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onEditar(renuncia)} className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Pencil className="w-5 h-5 mr-2" /> Editar Motivo</button>)}</Menu.Item></div>
                                    <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onMarcarPagada(renuncia)} className={`${active ? 'bg-green-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><CheckCircle className="w-5 h-5 mr-2" /> Marcar como Pagada</button>)}</Menu.Item></div>
                                    <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onCancelar(renuncia)} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><RotateCcw className="w-5 h-5 mr-2" /> Cancelar Renuncia</button>)}</Menu.Item></div>
                                </>
                            )}
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </div>
    );
};

export default memo(RenunciaCard);