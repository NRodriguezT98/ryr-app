import React, { Fragment } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash, Pencil, MoreVertical } from "lucide-react";
import { Menu, Transition } from '@headlessui/react';

const TablaAbonos = ({ abonos, onEdit, onDelete }) => {
    const formatCurrency = (value) => {
        return (value || 0).toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Fecha inválida";
        try {
            // Al añadir T00:00:00, le indicamos al navegador que trate
            // la fecha como local y no como UTC.
            const date = new Date(dateString + 'T00:00:00');
            return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
        } catch (error) {
            return "Fecha inválida";
        }
    };

    return (
        <div className="overflow-x-auto">
            {/* --- ESTILOS DE TABLA UNIFICADOS --- */}
            <table className="min-w-full table-auto border-collapse rounded-2xl overflow-hidden text-center shadow-lg">
                <thead className="bg-slate-700 text-white">
                    <tr className="uppercase tracking-wide text-xs font-semibold">
                        <th className="px-5 py-3">Fecha</th>
                        <th className="px-5 py-3">Monto</th>
                        <th className="px-5 py-3">Método de Pago</th>
                        <th className="px-5 py-3">Cliente</th>
                        <th className="px-5 py-3">Vivienda</th>
                        <th className="px-5 py-3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {abonos.map((abono, idx) => (
                        <tr key={abono.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-50 border-b border-gray-200 transition-colors`}>
                            {/* --- CLASE AÑADIDA A LAS CELDAS --- */}
                            <td className="px-5 py-3 text-sm text-gray-700 whitespace-nowrap">{formatDate(abono.fechaPago)}</td>
                            <td className="px-5 py-3 font-semibold text-gray-800 whitespace-nowrap">{formatCurrency(abono.monto)}</td>
                            <td className="px-5 py-3 text-sm text-gray-700 whitespace-nowrap">{abono.metodoPago}</td>
                            <td className="px-5 py-3 text-sm text-gray-700 whitespace-nowrap">{abono.clienteNombre || 'N/A'}</td>
                            <td className="px-5 py-3 text-sm text-gray-700 whitespace-nowrap">{abono.viviendaLabel || 'N/A'}</td>
                            <td className="px-5 py-3 whitespace-nowrap text-center relative">
                                <Menu as="div" className="relative inline-block text-left">
                                    <div>
                                        <Menu.Button className="inline-flex justify-center w-full rounded-full p-2 text-sm font-medium text-gray-500 hover:bg-gray-200">
                                            <MoreVertical size={20} />
                                        </Menu.Button>
                                    </div>
                                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                        <Menu.Items className="absolute right-0 bottom-0 mr-10 w-40 origin-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 focus:outline-none">
                                            <div className="px-1 py-1 ">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button onClick={() => onEdit(abono)} className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                                                            <Pencil className="w-5 h-5 mr-2" /> Editar
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button onClick={() => onDelete(abono)} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                                                            <Trash className="w-5 h-5 mr-2" /> Eliminar
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TablaAbonos;