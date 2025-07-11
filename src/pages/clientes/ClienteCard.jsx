import React, { Fragment, memo } from 'react'; // <-- 1. Importamos memo
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { MoreVertical, User, Eye, Pencil, Trash, Tag, Phone, MapPin, Home, UserX, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatID } from '../../utils/textFormatters';

const getInitials = (nombres = '', apellidos = '') => {
    const n = nombres.charAt(0) || '';
    const a = apellidos.charAt(0) || '';
    return `${n}${a}`.toUpperCase();
};

const ClienteCard = ({ cliente, onEdit, onDelete, onRenunciar, onReactivar }) => {
    const { datosCliente, vivienda, status, tieneRenunciaPendiente, renunciaPendiente } = cliente;

    const tieneDescuento = vivienda && vivienda.descuentoMonto > 0;
    const isPagado = vivienda && vivienda.saldoPendiente <= 0;
    const puedeRenunciar = vivienda && vivienda.saldoPendiente > 0;
    const isRenunciado = status === 'renunciado';

    const cardBorderClass = isPagado
        ? 'border-green-400 shadow-green-100'
        : tieneRenunciaPendiente || isRenunciado
            ? 'border-orange-300 bg-orange-50'
            : 'border-gray-200';

    const avatarBgClass = isPagado
        ? 'bg-green-500'
        : isRenunciado || tieneRenunciaPendiente
            ? 'bg-orange-500'
            : 'bg-blue-500';

    return (
        <div className={`bg-white rounded-2xl shadow-lg border flex flex-col transition-all duration-300 ${cardBorderClass}`}>
            <div className="flex items-center p-5 border-b">
                <div className={`w-14 h-14 rounded-full text-white flex items-center justify-center font-bold text-2xl mr-4 flex-shrink-0 ${avatarBgClass}`}>
                    {getInitials(datosCliente?.nombres, datosCliente?.apellidos)}
                </div>
                <div className="overflow-hidden">
                    <h3 className="font-bold text-lg text-gray-800 truncate" title={`${datosCliente?.nombres} ${datosCliente?.apellidos}`}>
                        {`${datosCliente?.nombres} ${datosCliente?.apellidos}`}
                    </h3>
                    <p className="text-sm text-gray-500 truncate" title={datosCliente?.correo}>
                        {datosCliente?.correo}
                    </p>
                </div>
            </div>

            <div className="p-5 space-y-4 text-sm">
                <div className="space-y-2">
                    <p className="flex items-center gap-3 text-gray-700"><Phone size={16} className="text-gray-400" /><span>{datosCliente?.telefono}</span></p>
                    <p className="flex items-center gap-3 text-gray-700"><User size={16} className="text-gray-400" /><span>C.C. {formatID(datosCliente?.cedula)}</span></p>
                    <p className="flex items-center gap-3 text-gray-700"><MapPin size={16} className="text-gray-400" /><span>{datosCliente?.direccion}</span></p>
                </div>

                <div className="pt-4 border-t space-y-2">
                    <p className="flex items-center gap-3 font-semibold">
                        <Home size={16} className={vivienda ? 'text-green-600' : 'text-gray-400'} />
                        {vivienda ? (
                            <span className="text-green-700">{`Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}</span>
                        ) : (
                            isRenunciado ?
                                <span className="text-orange-600 font-semibold">Renunció al Proceso</span> :
                                <span className="text-gray-500">Sin vivienda asignada</span>
                        )}
                    </p>
                    {isPagado && (<div className="flex items-center gap-2 text-green-700 bg-green-100 p-2 rounded-md"><CheckCircle2 size={16} /><span className="font-semibold text-xs">¡A Paz y Salvo!</span></div>)}
                    {tieneRenunciaPendiente && (<div className="flex items-center gap-2 text-orange-700 bg-orange-100 p-2 rounded-md"><AlertTriangle size={16} /><span className="font-semibold text-xs">Devolución Pendiente</span></div>)}
                    {tieneDescuento && !isPagado && (<div className="flex items-center gap-3 text-purple-700 bg-purple-100 p-2 rounded-md"><Tag size={16} /><span className="font-semibold text-xs">Vivienda con descuento aplicado</span></div>)}
                    {vivienda && !isPagado && (<p className="text-xs text-gray-600 pt-2">Saldo Pendiente: <span className="font-bold text-red-600">{formatCurrency(vivienda.saldoPendiente)}</span></p>)}
                </div>
            </div>

            <div className="mt-auto p-2 border-t bg-gray-100 rounded-b-2xl flex justify-end">
                <Menu as="div" className="relative">
                    <Menu.Button className="p-2 text-gray-500 hover:bg-gray-200 rounded-full">
                        <MoreVertical size={20} />
                    </Menu.Button>
                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                        <Menu.Items className="absolute bottom-full right-0 mb-2 w-56 origin-bottom-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 focus:outline-none">
                            <div className="px-1 py-1"><Menu.Item>{({ active }) => (<Link to={`/clientes/detalle/${cliente.id}`} className={`${active ? 'bg-indigo-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Eye className="w-5 h-5 mr-2" /> Ver Detalle Cliente</Link>)}</Menu.Item></div>

                            {tieneRenunciaPendiente ? (
                                <div className="px-1 py-1">
                                    <Menu.Item>{({ active }) => (<Link to={`/renuncias/detalle/${renunciaPendiente.id}`} className={`${active ? 'bg-orange-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><AlertTriangle className="w-5 h-5 mr-2" /> Ver Proceso Renuncia</Link>)}</Menu.Item>
                                </div>
                            ) : isRenunciado ? (
                                <div className="px-1 py-1">
                                    <Menu.Item>{({ active }) => (<button onClick={() => onReactivar(cliente)} className={`${active ? 'bg-green-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><RefreshCw className="w-5 h-5 mr-2" /> Reactivar Cliente</button>)}</Menu.Item>
                                </div>
                            ) : (
                                <>
                                    <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onEdit(cliente)} className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Pencil className="w-5 h-5 mr-2" /> Editar</button>)}</Menu.Item></div>
                                    {puedeRenunciar && (
                                        <div className="px-1 py-1">
                                            <Menu.Item>{({ active }) => (<button onClick={() => onRenunciar(cliente)} className={`${active ? 'bg-orange-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><UserX className="w-5 h-5 mr-2" /> Renunciar a Vivienda</button>)}</Menu.Item>
                                        </div>
                                    )}
                                    <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onDelete(cliente)} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Trash className="w-5 h-5 mr-2" /> Eliminar</button>)}</Menu.Item></div>
                                </>
                            )}
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </div>
    );
};

export default memo(ClienteCard); // <-- 2. Envolvemos el componente