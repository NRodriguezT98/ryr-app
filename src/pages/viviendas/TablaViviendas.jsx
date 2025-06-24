import React, { Fragment } from 'react';
import { Trash, Pencil, ArrowDown, ArrowUp, MoreVertical } from "lucide-react";
import { Menu, Transition } from '@headlessui/react';

const formatCurrency = (value) => {
    return (value || 0).toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    });
};

// Array de configuración para las cabeceras de la tabla.
// Facilita añadir, quitar o reordenar columnas.
const headers = [
    { key: 'manzana', label: 'Manzana', sortable: true, align: 'center' },
    { key: 'numeroCasa', label: 'Casa', sortable: true, align: 'center' },
    { key: 'matricula', label: 'Matrícula', sortable: false, align: 'center' },
    { key: 'nomenclatura', label: 'Nomenclatura', sortable: false, align: 'center' },
    { key: 'valorTotal', label: 'Valor Total', sortable: true, align: 'center' },
    { key: 'totalAbonado', label: 'Total Abonado', sortable: true, align: 'center' },
    { key: 'saldoPendiente', label: 'Saldo Pendiente', sortable: true, align: 'center' },
    { key: 'cliente', label: 'Cliente Asignado', sortable: true, align: 'center' },
    { key: 'acciones', label: 'Acciones', sortable: false, align: 'right' },
];

const TablaViviendas = ({ viviendas, onEdit, onDelete, onSort, sortConfig }) => {
    const SortIndicator = ({ columnKey }) => {
        if (!sortConfig || sortConfig.key !== columnKey) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1 inline" /> : <ArrowDown size={14} className="ml-1 inline" />;
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse text-center">
                <thead className="bg-slate-700 text-white">
                    <tr className="uppercase tracking-wide text-xs font-semibold">
                        {/* Cabecera generada dinámicamente para evitar errores de whitespace */}
                        {headers.map(header => (
                            <th key={header.key} className={`px-5 py-3 text-${header.align}`}>
                                {header.sortable ? (
                                    <button onClick={() => onSort(header.key)} className="flex items-center justify-center w-full">
                                        {header.label} <SortIndicator columnKey={header.key} />
                                    </button>
                                ) : (
                                    header.label
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {viviendas.length > 0 ? (
                        viviendas.map((vivienda) => (
                            <tr key={vivienda.id} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                                <td className="px-5 py-3">{vivienda.manzana}</td>
                                <td className="px-5 py-3">{vivienda.numeroCasa}</td>
                                <td className="px-5 py-3">{vivienda.matricula}</td>
                                <td className="px-5 py-3">{vivienda.nomenclatura}</td>
                                <td className="px-5 py-3 font-semibold">{formatCurrency(vivienda.valorTotal)}</td>
                                <td className="px-5 py-3 text-green-600 font-semibold">{formatCurrency(vivienda.totalAbonado)}</td>
                                <td className="px-5 py-3 text-red-600 font-semibold">{formatCurrency(vivienda.saldoPendiente)}</td>
                                <td className="px-5 py-3">
                                    {vivienda.cliente ? (
                                        <span className="inline-block rounded-full bg-green-100 text-green-800 px-3 py-1 text-xs font-semibold">{vivienda.cliente.nombre}</span>
                                    ) : (
                                        <span className="inline-block rounded-full bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-semibold">Disponible</span>
                                    )}
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap text-right relative">
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
                                                            <button onClick={() => onEdit(vivienda)} className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                                                                <Pencil className="w-5 h-5 mr-2" /> Editar
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button onClick={() => onDelete(vivienda)} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
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
                        ))
                    ) : (
                        <tr>
                            <td colSpan={headers.length} className="text-center py-10 text-gray-500">
                                No se encontraron viviendas con los filtros actuales.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TablaViviendas;