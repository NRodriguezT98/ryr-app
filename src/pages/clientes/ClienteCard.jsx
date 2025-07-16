import React, { Fragment, memo } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { MoreVertical, User, Eye, Pencil, Trash, UserX, RefreshCw, Home } from 'lucide-react';
import { getInitials, formatID } from '../../utils/textFormatters';
import { determineClientStatus } from '../../utils/statusHelper.jsx'; // <-- RUTA ACTUALIZADA

const ClienteCard = ({ cliente, onEdit, onDelete, onRenunciar, onReactivar }) => {
    const { datosCliente, vivienda, status } = cliente;

    const clientStatus = determineClientStatus(cliente);
    const isRenunciado = status === 'renunciado';

    return (
        <div className={`bg-white rounded-2xl shadow-lg border flex flex-col transition-all duration-300 hover:shadow-xl`}>
            <div className="flex items-center p-5 border-b">
                <div className={`w-14 h-14 rounded-full text-white flex items-center justify-center font-bold text-2xl mr-4 flex-shrink-0 bg-blue-500`}>
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

            <div className="p-5 space-y-4 text-sm flex-grow">
                <div className="space-y-2">
                    <p className="flex items-center gap-3 text-gray-700"><User size={16} className="text-gray-400" /><span>C.C. {formatID(datosCliente?.cedula)}</span></p>
                    <p className="flex items-center gap-3 font-semibold">
                        <Home size={16} className={vivienda ? 'text-green-600' : 'text-gray-400'} />
                        {vivienda ? (
                            <span className="text-green-700">{`Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}</span>
                        ) : (
                            <span className="text-gray-500">Sin vivienda asignada</span>
                        )}
                    </p>
                </div>
            </div>

            <div className="mt-auto p-4 border-t bg-gray-50 flex items-center justify-between">
                <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${clientStatus.color}`}>
                    {clientStatus.icon}
                    <span>{clientStatus.text}</span>
                </div>

                <Menu as="div" className="relative">
                    <Menu.Button className="p-2 text-gray-500 hover:bg-gray-200 rounded-full">
                        <MoreVertical size={20} />
                    </Menu.Button>
                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                        <Menu.Items className="absolute bottom-full right-0 mb-2 w-56 origin-bottom-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 focus:outline-none">
                            <div className="px-1 py-1"><Menu.Item>{({ active }) => (<Link to={`/clientes/detalle/${cliente.id}`} className={`${active ? 'bg-indigo-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Eye className="w-5 h-5 mr-2" /> Ver Detalle</Link>)}</Menu.Item></div>
                            {!isRenunciado && !cliente.tieneRenunciaPendiente && (
                                <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onEdit(cliente)} className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Pencil className="w-5 h-5 mr-2" /> Editar</button>)}</Menu.Item></div>
                            )}
                            {vivienda && !isRenunciado && !cliente.tieneRenunciaPendiente && (
                                <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onRenunciar(cliente)} className={`${active ? 'bg-orange-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><UserX className="w-5 h-5 mr-2" /> Renunciar a Vivienda</button>)}</Menu.Item></div>
                            )}
                            {isRenunciado && !cliente.tieneRenunciaPendiente && (
                                <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onReactivar(cliente)} className={`${active ? 'bg-green-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><RefreshCw className="w-5 h-5 mr-2" /> Reactivar Cliente</button>)}</Menu.Item></div>
                            )}
                            <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onDelete(cliente)} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Trash className="w-5 h-5 mr-2" /> Eliminar</button>)}</Menu.Item></div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </div>
    );
};

export default memo(ClienteCard);