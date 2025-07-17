import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { MoreVertical, Eye, Pencil, Trash, UserX, RefreshCw } from 'lucide-react';
import { getInitials, formatID, formatCurrency } from '../../../utils/textFormatters';
import { determineClientStatus } from '../../../utils/statusHelper.jsx';

const ClienteTableRow = ({ cliente, onEdit, onDelete, onRenunciar, onReactivar }) => {
    const { datosCliente, vivienda, status, tieneRenunciaPendiente } = cliente;
    const clientStatus = determineClientStatus(cliente);
    const isRenunciado = status === 'renunciado';

    return (
        <tr className="bg-white hover:bg-gray-50 border-b">
            <td className="px-6 py-4">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl">
                            {getInitials(datosCliente?.nombres, datosCliente?.apellidos)}
                        </div>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{`${datosCliente?.nombres} ${datosCliente?.apellidos}`}</div>
                        <div className="text-sm text-gray-500">{`C.C. ${formatID(datosCliente?.cedula)}`}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {vivienda ? (
                    <div className="text-sm font-semibold text-green-700">{`Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}</div>
                ) : (
                    <div className="text-sm text-gray-500">Sin asignar</div>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${clientStatus.color}`}>
                    {clientStatus.text}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                {formatCurrency(vivienda?.saldoPendiente || 0)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="p-2 text-gray-500 hover:bg-gray-200 rounded-full">
                        <MoreVertical size={20} />
                    </Menu.Button>
                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 focus:outline-none">
                            <div className="px-1 py-1"><Menu.Item>{({ active }) => (<Link to={`/clientes/detalle/${cliente.id}`} className={`${active ? 'bg-indigo-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Eye className="w-5 h-5 mr-2" /> Ver Detalle</Link>)}</Menu.Item></div>
                            {!isRenunciado && !tieneRenunciaPendiente && (<div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onEdit(cliente)} className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Pencil className="w-5 h-5 mr-2" /> Editar</button>)}</Menu.Item></div>)}
                            {vivienda && !isRenunciado && !tieneRenunciaPendiente && (<div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onRenunciar(cliente)} className={`${active ? 'bg-orange-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><UserX className="w-5 h-5 mr-2" /> Renunciar</button>)}</Menu.Item></div>)}
                            {isRenunciado && !tieneRenunciaPendiente && (<div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onReactivar(cliente)} className={`${active ? 'bg-green-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><RefreshCw className="w-5 h-5 mr-2" /> Reactivar</button>)}</Menu.Item></div>)}
                            <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onDelete(cliente)} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Trash className="w-5 h-5 mr-2" /> Eliminar</button>)}</Menu.Item></div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </td>
        </tr>
    );
};

export default ClienteTableRow;