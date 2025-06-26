import React, { Fragment } from 'react';
import { Trash, Pencil, ArrowDown, ArrowUp, MoreVertical } from "lucide-react";
import { Menu, Transition } from '@headlessui/react';

const getInitials = (nombres = '', apellidos = '') => {
    const n = nombres.charAt(0) || '';
    const a = apellidos.charAt(0) || '';
    return `${n}${a}`.toUpperCase();
};

function formatID(cedula) {
    if (!cedula) return '';
    if (/^\d+$/.test(cedula)) return Number(cedula).toLocaleString("es-CO");
    return cedula;
}

const TablaClientes = ({ clientes, onEdit, onDelete, onSort, sortConfig }) => {
    const SortIndicator = ({ columnKey }) => {
        if (!sortConfig || sortConfig.key !== columnKey) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1 inline" /> : <ArrowDown size={14} className="ml-1 inline" />;
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse text-center">
                <thead className="bg-slate-700 text-white">
                    <tr className="uppercase tracking-wide text-xs font-semibold">
                        <th className="px-5 py-3 text-left">
                            <button onClick={() => onSort('nombres')} className="flex items-center w-full">Nombre <SortIndicator columnKey="nombres" /></button>
                        </th>
                        <th className="px-5 py-3">Identificación</th>
                        <th className="px-5 py-3">Teléfono</th>
                        <th className="px-5 py-3">Dirección</th>
                        <th className="px-5 py-3">
                            <button onClick={() => onSort('vivienda')} className="flex items-center justify-center w-full">Vivienda Asignada <SortIndicator columnKey="vivienda" /></button>
                        </th>
                        <th className="px-5 py-3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clientes.length > 0 ? (
                        clientes.map((cliente) => (
                            <tr key={cliente.id} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                                <td className="px-5 py-3 text-left">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0">
                                            {getInitials(cliente.datosCliente?.nombres, cliente.datosCliente?.apellidos)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-800">{`${cliente.datosCliente?.nombres || ''} ${cliente.datosCliente?.apellidos || ''}`}</div>
                                            <div className="text-sm text-gray-500">{cliente.datosCliente?.correo || ''}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3">{formatID(cliente.datosCliente?.cedula)}</td>
                                <td className="px-5 py-3">{cliente.datosCliente?.telefono}</td>
                                <td className="px-5 py-3">{cliente.datosCliente?.direccion}</td>
                                <td className="px-5 py-3">
                                    {cliente.vivienda ? (
                                        <span className="inline-block rounded-full bg-green-100 text-green-800 px-3 py-1 text-xs font-semibold">
                                            {`Mz ${cliente.vivienda.manzana} - Casa ${cliente.vivienda.numeroCasa}`}
                                        </span>
                                    ) : (
                                        <span className="inline-block rounded-full bg-red-100 text-red-800 px-3 py-1 text-xs font-semibold">No asignada</span>
                                    )}
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap text-right relative">
                                    <Menu as="div" className="relative inline-block text-left">
                                        <Menu.Button className="inline-flex justify-center w-full rounded-full p-2 text-sm font-medium text-gray-500 hover:bg-gray-200"><MoreVertical size={20} /></Menu.Button>
                                        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                            <Menu.Items className="absolute right-0 bottom-0 mr-10 w-40 origin-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 focus:outline-none">
                                                <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onEdit(cliente)} className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Pencil className="w-5 h-5 mr-2" /> Editar</button>)}</Menu.Item></div>
                                                <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onDelete(cliente)} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Trash className="w-5 h-5 mr-2" /> Eliminar</button>)}</Menu.Item></div>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center py-10 text-gray-500">No se encontraron clientes con los filtros actuales.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TablaClientes;