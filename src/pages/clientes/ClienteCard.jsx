import React, { Fragment, memo } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { MoreVertical, User, Eye, Pencil, Trash, UserX, RefreshCw, Home } from 'lucide-react';
import { getInitials, formatID, formatCurrency } from '../../utils/textFormatters';
import { determineClientStatus } from '../../utils/statusHelper.jsx';

const ClienteCard = ({ cliente, onEdit, onDelete, onRenunciar, onReactivar }) => {
    const { datosCliente, vivienda, status } = cliente;

    const clientStatus = determineClientStatus(cliente);
    const isRenunciado = status === 'renunciado';

    const valorFinal = vivienda?.valorFinal || 0;
    const totalAbonado = vivienda?.totalAbonado || 0;
    const porcentajePagado = valorFinal > 0 ? (totalAbonado / valorFinal) * 100 : (vivienda ? 100 : 0);

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border flex flex-col transition-all duration-300 hover:shadow-xl dark:border-gray-700`}>
            {/* Encabezado */}
            <div className="flex items-center p-5 border-b dark:border-gray-700">
                <div className={`w-14 h-14 rounded-full text-white flex items-center justify-center font-bold text-2xl mr-4 flex-shrink-0 bg-blue-500`}>
                    {getInitials(datosCliente?.nombres, datosCliente?.apellidos)}
                </div>
                <div className="overflow-hidden">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate" title={`${datosCliente?.nombres} ${datosCliente?.apellidos}`}>
                        {`${datosCliente?.nombres} ${datosCliente?.apellidos}`}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={datosCliente?.correo}>
                        C.C. {formatID(datosCliente?.cedula)}
                    </p>
                </div>
            </div>

            {/* Cuerpo */}
            <div className="p-5 space-y-4 text-sm flex-grow">
                <div className="space-y-2">
                    <p className="flex items-center gap-3 font-semibold">
                        <Home size={16} className={vivienda ? 'text-green-600 dark:text-green-400' : 'text-gray-400'} />
                        {vivienda ? (
                            <Link to={`/viviendas/detalle/${vivienda.id}`} className="text-green-700 dark:text-green-400 hover:underline">
                                {`Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}
                            </Link>
                        ) : (
                            <span className="text-gray-500 dark:text-gray-400">Sin vivienda asignada</span>
                        )}
                    </p>
                </div>
                {vivienda && (
                    <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Progreso de Pago</h4>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{`${Math.round(porcentajePagado)}%`}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                            <div className={`h-2.5 rounded-full ${vivienda.saldoPendiente <= 0 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${porcentajePagado}%` }}></div>
                        </div>
                        <div className="flex justify-between text-sm pt-1">
                            <span className="text-gray-600 dark:text-gray-400">Abonado: <strong className="text-green-600 dark:text-green-400">{formatCurrency(totalAbonado)}</strong></span>
                            <span className="text-gray-600 dark:text-gray-400">Saldo: <strong className="text-red-600 dark:text-red-400">{formatCurrency(vivienda.saldoPendiente)}</strong></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Pie de tarjeta */}
            <div className="mt-auto p-4 border-t bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 flex items-center justify-between">
                <Link to={`/clientes/detalle/${cliente.id}`} state={{ defaultTab: 'proceso' }} className="flex">
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
                            <div className="px-1 py-1"><Menu.Item>{({ active }) => (<Link to={`/clientes/detalle/${cliente.id}`} className={`${active ? 'bg-indigo-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Eye className="w-5 h-5 mr-2" /> Ver Detalle</Link>)}</Menu.Item></div>
                            {!isRenunciado && !cliente.tieneRenunciaPendiente && (
                                <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onEdit(cliente)} className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Pencil className="w-5 h-5 mr-2" /> Editar</button>)}</Menu.Item></div>
                            )}
                            {vivienda && !isRenunciado && !cliente.tieneRenunciaPendiente && (
                                <div className="px-1 py-1">
                                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                                    <Menu.Item disabled={!cliente.puedeRenunciar}>
                                        {({ active, disabled }) => (
                                            <div
                                                // El tooltip se ancla a este div, que siempre puede recibir eventos del mouse
                                                data-tooltip-id="app-tooltip"
                                                data-tooltip-content={disabled ? "No se puede renunciar: el cliente ha superado un paso clave en el proceso (Firmar Minuta de Compraventa)." : ''}
                                            >
                                                <button
                                                    onClick={() => onRenunciar(cliente)}
                                                    className={`${active ? 'bg-orange-500 text-white' : 'text-gray-900 dark:text-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                    disabled={!cliente.puedeRenunciar}
                                                >
                                                    <UserX className="w-5 h-5 mr-2" /> Renunciar a Vivienda
                                                </button>
                                            </div>
                                        )}
                                    </Menu.Item>
                                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                                </div>
                            )}
                            {isRenunciado && !cliente.tieneRenunciaPendiente && (
                                <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onReactivar(cliente)} className={`${active ? 'bg-green-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><RefreshCw className="w-5 h-5 mr-2" /> Reactivar Cliente</button>)}</Menu.Item></div>
                            )}
                            <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onDelete(cliente)} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Trash className="w-5 h-5 mr-2" /> Eliminar</button>)}</Menu.Item></div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </div>
    );
};

export default memo(ClienteCard);