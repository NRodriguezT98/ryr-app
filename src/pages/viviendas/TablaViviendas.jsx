import React, { Fragment } from 'react';
import { Trash, Pencil, ArrowDown, ArrowUp, MoreVertical, Info, Tag } from "lucide-react";
import { Menu, Transition } from '@headlessui/react';

const formatCurrency = (value) => {
    return (value || 0).toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    });
};

const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const headers = [
    { key: 'manzana', label: 'Mz', sortable: true, width: 'w-[5%]' },
    { key: 'numeroCasa', label: 'Casa', sortable: true, width: 'w-[5%]' },
    { key: 'matricula', label: 'Matrícula', sortable: false, width: 'w-[12%]' },
    { key: 'nomenclatura', label: 'Nomenclatura', sortable: false, width: 'w-[20%]' },
    { key: 'valorFinal', label: 'Valor Final', sortable: true, width: 'w-[13%]' },
    { key: 'totalAbonado', label: 'Abonado', sortable: true, width: 'w-[13%]' },
    { key: 'saldoPendiente', label: 'Saldo', sortable: true, width: 'w-[12%]' },
    { key: 'cliente', label: 'Cliente', sortable: true, width: 'w-[15%]' },
    { key: 'acciones', label: 'Acciones', sortable: false, width: 'w-[5%]' },
];

const TablaViviendas = ({ viviendas, onEdit, onDelete, onApplyDiscount, onSort, sortConfig }) => {
    const SortIndicator = ({ columnKey }) => {
        if (!sortConfig || sortConfig.key !== columnKey) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1 inline" /> : <ArrowDown size={14} className="ml-1 inline" />;
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full table-fixed w-full border-collapse">
                <thead className="bg-slate-700 text-white">
                    <tr className="uppercase tracking-wide text-xs font-semibold text-center">
                        {headers.map(header => (
                            <th key={header.key} className={`px-2 py-3 ${header.width}`}>
                                {header.sortable ? (
                                    <button onClick={() => onSort(header.key)} className="flex items-center justify-center w-full whitespace-nowrap">
                                        {header.label} <SortIndicator columnKey={header.key} />
                                    </button>
                                ) : (
                                    <span className="flex items-center justify-center w-full">{header.label}</span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className='text-gray-700'>
                    {viviendas && viviendas.length > 0 ? (
                        viviendas.map((vivienda) => (
                            <tr key={vivienda.id} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                                <td className="px-2 py-3 align-middle text-center">{vivienda.manzana}</td>
                                <td className="px-2 py-3 align-middle text-center">{vivienda.numeroCasa}</td>
                                <td className="px-2 py-3 align-middle text-center whitespace-nowrap">{vivienda.matricula}</td>
                                <td className="px-2 py-3 align-middle text-left">{vivienda.nomenclatura}</td>
                                <td className="px-2 py-3 font-semibold align-middle text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1">
                                        <span>{formatCurrency(vivienda.valorFinal)}</span>
                                        {(vivienda.descuentoMonto || 0) > 0 && (
                                            <Info
                                                size={14}
                                                className="text-blue-500 cursor-pointer flex-shrink-0"
                                                data-tooltip-id="discount-tooltip"
                                                data-tooltip-html={`
                                                    <div style="text-align: left; padding: 2px;">
                                                        <p>Valor Lista: ${formatCurrency(vivienda.valorTotal)}</p>
                                                        <p>Descuento: -${formatCurrency(vivienda.descuentoMonto)}</p>
                                                        ${vivienda.descuentoMotivo ? `<p class='mt-1 pt-1 border-t border-slate-500'>Motivo: ${vivienda.descuentoMotivo}</p>` : ''}
                                                    </div>
                                                `}
                                            />
                                        )}
                                    </div>
                                </td>
                                <td className="px-2 py-3 text-green-600 font-semibold align-middle text-center whitespace-nowrap">{formatCurrency(vivienda.totalAbonado)}</td>
                                <td className="px-2 py-3 text-red-600 font-semibold align-middle text-center whitespace-nowrap">{formatCurrency(vivienda.saldoPendiente)}</td>
                                <td className="px-2 py-3 align-middle text-center">
                                    {vivienda.cliente ? (
                                        <span className="inline-block rounded-full bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold">
                                            {toTitleCase(`${vivienda.cliente.datosCliente?.nombres || ''} ${vivienda.cliente.datosCliente?.apellidos || ''}`)}
                                        </span>
                                    ) : (
                                        <span className="inline-block rounded-full bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-semibold">
                                            Disponible
                                        </span>
                                    )}
                                </td>
                                <td className="px-2 py-3 text-center relative align-middle">
                                    <Menu as="div" className="relative inline-block">
                                        <Menu.Button className="inline-flex justify-center rounded-full p-2 text-sm font-medium text-gray-500 hover:bg-gray-200">
                                            <MoreVertical size={20} />
                                        </Menu.Button>
                                        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                            <Menu.Items className="absolute right-0 bottom-0 mr-8 w-52 origin-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 focus:outline-none">
                                                <div className="px-1 py-1 ">
                                                    <Menu.Item>{({ active }) => (<button onClick={() => onEdit(vivienda)} className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Pencil className="w-5 h-5 mr-2" /> Editar Datos</button>)}</Menu.Item>
                                                    <Menu.Item>{({ active }) => (<button onClick={() => onApplyDiscount(vivienda)} className={`${active ? 'bg-purple-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Tag className="w-5 h-5 mr-2" /> Aplicar/Ver Descuento</button>)}</Menu.Item>
                                                    <Menu.Item>{({ active }) => (<button onClick={() => onDelete(vivienda)} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Trash className="w-5 h-5 mr-2" /> Eliminar</button>)}</Menu.Item>
                                                </div>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={headers.length} className="text-center py-10 text-gray-500">No se encontraron viviendas.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TablaViviendas;