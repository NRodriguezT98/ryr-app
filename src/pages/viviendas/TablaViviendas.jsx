import React, { Fragment } from 'react';
import { Trash, Pencil, ArrowDown, ArrowUp, MoreVertical, Info, Tag } from "lucide-react";
import { Menu, Transition } from '@headlessui/react';
import { Tooltip } from 'react-tooltip';

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
    { key: 'manzana', label: 'Ubicación', sortable: true },
    { key: 'matricula', label: 'Matrícula', sortable: false },
    { key: 'nomenclatura', label: 'Nomenclatura', sortable: false },
    { key: 'valorFinal', label: 'Finanzas', sortable: true },
    { key: 'cliente', label: 'Cliente', sortable: true },
    { key: 'acciones', label: 'Acciones', sortable: false },
];

const TablaViviendas = ({ viviendas, onEdit, onDelete, onApplyDiscount, onSort, sortConfig }) => {
    const SortIndicator = ({ columnKey }) => {
        if (!sortConfig || sortConfig.key !== columnKey) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1 inline" /> : <ArrowDown size={14} className="ml-1 inline" />;
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full w-full border-collapse">
                <thead className="bg-slate-700 text-white">
                    <tr className="uppercase tracking-wide text-xs font-semibold text-center">
                        {headers.map(header => (
                            <th key={header.key} className="px-3 py-3">
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
                        viviendas.map((vivienda, index) => {

                            // --- LÓGICA MEJORADA PARA POSICIONAR EL MENÚ ---
                            // Si hay más de 4 filas y estamos en las últimas 2, abre hacia arriba.
                            // Si no, siempre abre hacia abajo.
                            const openUpwards = viviendas.length > 4 && index >= viviendas.length - 2;

                            return (
                                <tr key={vivienda.id} className="bg-white hover:bg-gray-50 border-b border-gray-200 text-sm">
                                    <td className="px-3 py-3 align-middle text-center font-semibold">{`Mz. ${vivienda.manzana} - ${vivienda.numeroCasa}`}</td>

                                    <td className="px-3 py-3 align-middle text-center whitespace-nowrap">{vivienda.matricula}</td>

                                    <td className="px-3 py-3 align-middle text-left max-w-xs truncate" title={vivienda.nomenclatura}>
                                        {vivienda.nomenclatura}
                                    </td>

                                    <td className="px-3 py-3 align-middle text-right">
                                        <div className='flex flex-col'>
                                            <div className='flex justify-between items-center gap-2'>
                                                <span className='text-xs text-gray-500'>Valor:</span>
                                                <span className='font-semibold flex items-center gap-1'>
                                                    {formatCurrency(vivienda.valorFinal)}
                                                    {(vivienda.descuentoMonto || 0) > 0 && (
                                                        <Info
                                                            size={13}
                                                            className="text-blue-500 cursor-pointer flex-shrink-0"
                                                            data-tooltip-id="discount-tooltip-main"
                                                            data-tooltip-html={`
                                                                <div>
                                                                    <p>Valor Lista: ${formatCurrency(vivienda.valorTotal)}</p>
                                                                    <p>Descuento: -${formatCurrency(vivienda.descuentoMonto)}</p>
                                                                    ${vivienda.descuentoMotivo ? `<p class='mt-1 pt-1 border-t border-slate-500'>Motivo: ${vivienda.descuentoMotivo}</p>` : ''}
                                                                </div>
                                                            `}
                                                        />
                                                    )}
                                                </span>
                                            </div>
                                            <div className='flex justify-between items-center gap-2'>
                                                <span className='text-xs text-gray-500'>Abonado:</span>
                                                <span className='font-semibold text-green-600'>{formatCurrency(vivienda.totalAbonado)}</span>
                                            </div>
                                            <div className='flex justify-between items-center gap-2 border-t mt-1 pt-1'>
                                                <span className='text-xs text-gray-500'>Saldo:</span>
                                                <span className='font-semibold text-red-600'>{formatCurrency(vivienda.saldoPendiente)}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-3 py-3 align-middle text-center" style={{ minWidth: '150px' }}>
                                        {vivienda.clienteId ? (
                                            <span className="font-semibold text-gray-800">
                                                {toTitleCase(vivienda.clienteNombre)}
                                            </span>
                                        ) : (
                                            <span className="inline-block rounded-full bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-semibold">
                                                Disponible
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-3 py-3 text-center relative align-middle">
                                        <Menu as="div" className="relative inline-block">
                                            <Menu.Button className="inline-flex justify-center rounded-full p-2 text-sm font-medium text-gray-500 hover:bg-gray-200">
                                                <MoreVertical size={20} />
                                            </Menu.Button>
                                            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                                {/* --- CLASES DE POSICIÓN Y ORIGEN DINÁMICAS --- */}
                                                <Menu.Items
                                                    className={`absolute right-0 w-56 bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-30 focus:outline-none 
                                                    ${openUpwards ? 'bottom-full origin-bottom-right mb-2' : 'top-full origin-top-right mt-2'}`}
                                                >
                                                    <div className="px-1 py-1">
                                                        <Menu.Item>{({ active }) => (<button onClick={() => onEdit(vivienda)} className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Pencil className="w-5 h-5 mr-2" /> Editar Datos</button>)}</Menu.Item>
                                                    </div>
                                                    <div className="px-1 py-1">
                                                        <Menu.Item>{({ active }) => (<button onClick={() => onApplyDiscount(vivienda)} className={`${active ? 'bg-purple-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Tag className="w-5 h-5 mr-2" /> Aplicar/Ver Descuento</button>)}</Menu.Item>
                                                    </div>
                                                    <div className="px-1 py-1">
                                                        <Menu.Item>{({ active }) => (<button onClick={() => onDelete(vivienda)} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Trash className="w-5 h-5 mr-2" /> Eliminar</button>)}</Menu.Item>
                                                    </div>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </td>
                                </tr>
                            )
                        })
                    ) : (
                        <tr><td colSpan={headers.length} className="text-center py-10 text-gray-500">No se encontraron viviendas con los filtros actuales.</td></tr>
                    )}
                </tbody>
            </table>
            <Tooltip id="discount-tooltip-main" style={{ backgroundColor: "#334155", color: "#ffffff", borderRadius: '8px', zIndex: 100, textAlign: 'left' }} />
        </div>
    );
};

export default TablaViviendas;