import React, { Fragment, memo } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { MoreVertical, User, Eye, Pencil, Trash, UserX, RefreshCw, Home, ArchiveRestore, Archive, AlertTriangle } from 'lucide-react';
import { getInitials, formatID, formatCurrency } from '../../utils/textFormatters';
import { useClienteCardLogic } from '../../hooks/clientes/useClienteCardLogic';

const ClienteCard = ({ cardData, onEdit, onArchive, onDelete, onRenunciar, onReactivar, onRestaurar }) => {
    const {
        id,
        datosCliente,
        vivienda,
        clientStatus,
        isPagada,
        totalAbonado,
        porcentajePagado,
        puedeEditar,
        puedeRenunciar,
        status,
        puedeSerEliminado
    } = cardData;

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border flex flex-col transition-all duration-300 hover:shadow-xl ${isPagada ? 'border-green-400 dark:border-green-600' : 'dark:border-gray-700'}`}>
            <div className={`flex items-center p-5 border-b dark:border-gray-700 rounded-t-2xl ${isPagada ? 'bg-green-50 dark:bg-green-900/50' : ''}`}>
                <div className={`w-14 h-14 rounded-full text-white flex items-center justify-center font-bold text-2xl mr-4 flex-shrink-0 bg-blue-500`}>
                    {getInitials(datosCliente?.nombres, datosCliente?.apellidos)}
                </div>
                <div className="overflow-hidden">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate" title={`${datosCliente?.nombres} ${datosCliente?.apellidos}`}>{`${datosCliente?.nombres} ${datosCliente?.apellidos}`}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={datosCliente?.correo}>C.C. {formatID(datosCliente?.cedula)}</p>
                </div>
            </div>
            <div className="p-5 space-y-4 text-sm flex-grow">
                <div className="space-y-2">
                    <p className="flex items-center gap-3 font-semibold">
                        <Home size={16} className={vivienda ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400'} />
                        {vivienda ? (
                            <span className="text-gray-600 dark:text-gray-300">
                                {status === 'enProcesoDeRenuncia' ? 'Renunció a la vivienda:' : 'Vivienda:'}
                                <Link to={`/viviendas/detalle/${vivienda.id}`} className="font-bold text-blue-600 dark:text-blue-400 hover:underline ml-1">
                                    {`Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}
                                </Link>
                            </span>
                        ) : (
                            <span className="text-gray-500 dark:text-gray-400">Sin vivienda asignada</span>
                        )}
                    </p>
                </div>

                {status === 'enProcesoDeRenuncia' ? (
                    <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-700 dark:text-orange-300 text-xs font-semibold">
                        <AlertTriangle size={16} />
                        Proceso de renuncia activo.
                    </div>
                ) : vivienda && (
                    <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Progreso de Pago</h4>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{`${Math.round(porcentajePagado)}%`}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                            <div className={`h-2.5 rounded-full ${isPagada ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${porcentajePagado}%` }}></div>
                        </div>
                        <div className="flex justify-between text-sm pt-1">
                            <span className="text-gray-600 dark:text-gray-400">Abonado: <strong className="text-green-600 dark:text-green-400">{formatCurrency(totalAbonado)}</strong></span>
                            <span className="text-gray-600 dark:text-gray-400">Saldo: <strong className={isPagada ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{formatCurrency(vivienda.saldoPendiente)}</strong></span>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-auto p-4 border-t bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 flex items-center justify-between">
                <Link to={`/clientes/detalle/${id}`} state={{ defaultTab: 'proceso' }} className="flex">
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full transition-all duration-200 hover:brightness-110 ${clientStatus.color}`}>
                        {clientStatus.icon}
                        <span>{clientStatus.text}</span>
                    </div>
                </Link>
                <Menu as="div" className="relative">
                    <Menu.Button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                        <MoreVertical size={20} />
                    </Menu.Button>
                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                        <Menu.Items className="absolute bottom-full right-0 mb-2 w-56 origin-bottom-right bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 rounded-md shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 z-10 focus:outline-none">
                            <div className="px-1 py-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link to={`/clientes/detalle/${id}`} className={`${active ? 'bg-indigo-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                                            <Eye className="w-5 h-5 mr-2" /> Ver Detalle
                                        </Link>
                                    )}
                                </Menu.Item>
                            </div>

                            {status === 'activo' && (
                                <>
                                    <div className="px-1 py-1">
                                        <Menu.Item disabled={!puedeEditar}>
                                            {({ active, disabled }) => (
                                                <div data-tooltip-id="app-tooltip" data-tooltip-content={!puedeEditar ? "No se puede editar un cliente con el proceso finalizado." : ''}>
                                                    <button onClick={() => onEdit(cardData)} className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} group flex rounded-md items-center w-full px-2 py-2 text-sm`} disabled={!puedeEditar}>
                                                        <Pencil className="w-5 h-5 mr-2" /> Editar
                                                    </button>
                                                </div>
                                            )}
                                        </Menu.Item>
                                    </div>
                                    {vivienda && !isPagada && (
                                        <div className="px-1 py-1">
                                            <Menu.Item disabled={!puedeRenunciar}>
                                                {({ active, disabled }) => (
                                                    <div data-tooltip-id="app-tooltip" data-tooltip-content={!puedeRenunciar ? "No se puede renunciar: el cliente ha superado un hito clave." : ''}>
                                                        <button onClick={() => onRenunciar(cardData)} className={`${active ? 'bg-orange-500 text-white' : 'text-gray-900 dark:text-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} group flex rounded-md items-center w-full px-2 py-2 text-sm`} disabled={!puedeRenunciar}>
                                                            <UserX className="w-5 h-5 mr-2" /> Renunciar
                                                        </button>
                                                    </div>
                                                )}
                                            </Menu.Item>
                                        </div>
                                    )}
                                </>
                            )}

                            {status === 'renunciado' && (
                                <>
                                    <div className="px-1 py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button onClick={() => onReactivar(cardData)} className={`${active ? 'bg-green-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                                                    <RefreshCw className="w-5 h-5 mr-2" /> Iniciar Nuevo Proceso
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                    <div className="px-1 py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button onClick={() => onArchive(cardData)} className={`${active ? 'bg-gray-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                                                    <Archive className="w-5 h-5 mr-2" /> Archivar
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </>
                            )}

                            {status === 'inactivo' && (
                                <>
                                    <div className="px-1 py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button onClick={() => onRestaurar(cardData)} className={`${active ? 'bg-yellow-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                                                    <ArchiveRestore className="w-5 h-5 mr-2" /> Restaurar Cliente
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                    {puedeSerEliminado && (
                                        <div className="px-1 py-1">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button onClick={() => onDelete(cardData)} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                                                        <Trash className="w-5 h-5 mr-2" /> Eliminar Permanentemente
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
            </div>
        </div>
    );
};

export default memo(ClienteCard);