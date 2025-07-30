import React, { Fragment, memo } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { MoreVertical, Tag, Pencil, Trash, Eye, CheckCircle2, Star, Building, Ruler, User, Home } from 'lucide-react';
import { formatCurrency, toTitleCase } from '../../utils/textFormatters';

const ViviendaCard = ({ vivienda, onEdit, onDelete }) => {
    const {
        manzana, numeroCasa, matricula, nomenclatura, valorFinal, totalAbonado,
        saldoPendiente, clienteNombre, clienteId, descuentoMonto, recargoEsquinera, areaConstruida,
        puedeEditar, puedeEliminar
    } = vivienda;

    const porcentajePagado = valorFinal > 0 ? (totalAbonado / valorFinal) * 100 : 0;
    const isDisponible = !clienteId;
    const isPagada = saldoPendiente <= 0 && !isDisponible;
    const esEsquinera = recargoEsquinera > 0;
    const tieneDescuento = descuentoMonto > 0;
    const esIrregular = String(areaConstruida) !== "41";

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border flex flex-col transition-all duration-300 hover:shadow-xl ${isPagada ? 'border-green-400 dark:border-green-600' : 'border-gray-200 dark:border-gray-700'} overflow-hidden`}>
            <div className={`flex items-center justify-between p-4 border-b dark:border-gray-700 rounded-t-2xl ${isDisponible ? 'bg-gray-50 dark:bg-gray-700/50' : (isPagada ? 'bg-green-50 dark:bg-green-900/50' : 'bg-blue-50 dark:bg-blue-900/50')}`}>
                <div className="flex items-center gap-3 flex-grow min-w-0">
                    <Home className={`w-6 h-6 flex-shrink-0 ${isDisponible ? 'text-gray-500' : (isPagada ? 'text-green-700' : 'text-blue-700')}`} />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">
                        {`Mz. ${manzana} - Casa ${numeroCasa}`}
                    </h3>
                </div>
                <div className='flex items-center gap-2 flex-shrink-0'>
                    {isPagada ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-green-800 bg-green-200 rounded-full">
                            <CheckCircle2 size={14} />
                            Pagada
                        </span>
                    ) : (
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isDisponible ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'}`}>
                            {isDisponible ? 'Disponible' : 'Asignada'}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-5 space-y-4 flex-grow">
                <div className='space-y-3'>
                    <div className="flex items-center gap-2 flex-wrap">
                        {esEsquinera && (<span className="flex items-center gap-1.5 text-xs font-semibold text-purple-800 bg-purple-100 px-2 py-1 rounded-full"><Star size={14} />Esquinera</span>)}
                        {esIrregular && (<span className="flex items-center gap-1.5 text-xs font-semibold text-red-800 bg-red-100 px-2 py-1 rounded-full"><Ruler size={14} />Irregular</span>)}
                        {tieneDescuento && (<span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-800 bg-indigo-100 px-2 py-1 rounded-full"><Tag size={14} />Con Descuento</span>)}
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-400 pt-3 border-t dark:border-gray-700'>
                        <p><strong className='font-medium text-gray-800 dark:text-gray-200'>Matrícula:</strong> {matricula}</p>
                        <p><strong className='font-medium text-gray-800 dark:text-gray-200'>Nomenclatura:</strong> {nomenclatura}</p>
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Progreso de Pago</h4>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{`${Math.round(porcentajePagado)}%`}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${isPagada ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${porcentajePagado}%` }}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Abonado: <strong className="text-green-600 dark:text-green-400">{formatCurrency(totalAbonado)}</strong></span>
                        <span className="text-gray-600 dark:text-gray-400">Valor: <strong className="text-gray-800 dark:text-gray-200">{formatCurrency(valorFinal)}</strong></span>
                    </div>
                    <div className={`flex justify-between text-sm font-bold pt-2 border-t dark:border-gray-700 mt-2 ${saldoPendiente > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        <span>Saldo Pendiente:</span>
                        <span>{formatCurrency(saldoPendiente)}</span>
                    </div>
                </div>
            </div>

            <div className="mt-auto p-4 border-t bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm overflow-hidden">
                    {!isDisponible ? (
                        <Link to={`/clientes/detalle/${clienteId}`} className='flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200 truncate hover:underline hover:text-blue-600 dark:hover:text-blue-400' title={toTitleCase(clienteNombre)}>
                            <User size={16} className="text-gray-400" />
                            {toTitleCase(clienteNombre)}
                        </Link>
                    ) : (
                        <p className='text-xs text-gray-500 dark:text-gray-400'>Vivienda sin asignar</p>
                    )}
                </div>

                <Menu as="div" className="relative">
                    <Menu.Button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                        <MoreVertical size={20} />
                    </Menu.Button>
                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                        <Menu.Items className="absolute bottom-full right-0 mb-2 w-56 origin-bottom-right bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 rounded-md shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 z-10 focus:outline-none">
                            <div className="px-1 py-1"><Menu.Item>{({ active }) => (<Link to={`/viviendas/detalle/${vivienda.id}`} className={`${active ? 'bg-indigo-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Eye className="w-5 h-5 mr-2" /> Ver Detalle</Link>)}</Menu.Item></div>
                            <div className="px-1 py-1">
                                <Menu.Item disabled={!puedeEditar}>
                                    {({ active, disabled }) => (
                                        <div data-tooltip-id="app-tooltip" data-tooltip-content={disabled ? "No se puede editar una vivienda con proceso de cliente finalizado." : ''}>
                                            <button onClick={() => onEdit(vivienda)} className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} group flex rounded-md items-center w-full px-2 py-2 text-sm`} disabled={!puedeEditar}>
                                                <Pencil className="w-5 h-5 mr-2" /> Editar Datos
                                            </button>
                                        </div>
                                    )}
                                </Menu.Item>
                            </div>
                            <div className="px-1 py-1">
                                <Menu.Item disabled={!puedeEliminar}>
                                    {({ active, disabled }) => (
                                        <div data-tooltip-id="app-tooltip" data-tooltip-content={disabled ? "No se puede eliminar una vivienda con historial." : ''}>
                                            <button onClick={() => onDelete(vivienda)} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900 dark:text-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} group flex rounded-md items-center w-full px-2 py-2 text-sm`} disabled={!puedeEliminar}>
                                                <Trash className="w-5 h-5 mr-2" /> Eliminar
                                            </button>
                                        </div>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </div>
    );
};

export default memo(ViviendaCard);