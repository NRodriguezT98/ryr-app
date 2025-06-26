import React, { Fragment } from 'react';
import { Trash, Pencil, ArrowDown, ArrowUp, MoreVertical, Info } from "lucide-react";
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
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const TablaViviendas = ({ viviendas = [], onEdit, onDelete, onSort, sortConfig }) => {
    const SortIndicator = ({ columnKey }) => {
        if (!sortConfig || sortConfig.key !== columnKey) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1 inline" /> : <ArrowDown size={14} className="ml-1 inline" />;
    };

    return (
        // CAMBIO CRÍTICO: Se elimina 'overflow-hidden' para permitir que el menú sea visible.
        <div className="border border-gray-200 rounded-lg">
            <table className="min-w-full w-full table-fixed text-sm">
                <thead className="bg-slate-700 text-white">
                    <tr className="uppercase tracking-wide text-xs font-semibold text-center">
                        <th className="px-2 py-3 w-12">
                            <button onClick={() => onSort('manzana')} className="flex items-center justify-center w-full">Mz<SortIndicator columnKey='manzana' /></button>
                        </th>
                        <th className="px-2 py-3 w-12">
                            <button onClick={() => onSort('numeroCasa')} className="flex items-center justify-center w-full">Casa<SortIndicator columnKey='numeroCasa' /></button>
                        </th>
                        <th className="px-2 py-3 w-28">Matrícula</th>
                        <th className="px-2 py-3">Nomenclatura</th>
                        <th className="px-2 py-3 w-32">
                            <button onClick={() => onSort('valorFinal')} className="flex items-center justify-center w-full">Valor Final<SortIndicator columnKey='valorFinal' /></button>
                        </th>
                        <th className="px-2 py-3 w-32">
                            <button onClick={() => onSort('totalAbonado')} className="flex items-center justify-center w-full">Abonado<SortIndicator columnKey='totalAbonado' /></button>
                        </th>
                        <th className="px-2 py-3 w-32">
                            <button onClick={() => onSort('saldoPendiente')} className="flex items-center justify-center w-full">Saldo<SortIndicator columnKey='saldoPendiente' /></button>
                        </th>
                        <th className="px-2 py-3">
                            <button onClick={() => onSort('cliente')} className="flex items-center justify-center w-full">Cliente Asignado<SortIndicator columnKey='cliente' /></button>
                        </th>
                        {/* CAMBIO CLAVE: Se aumenta el ancho para que el título 'ACCIONES' quepa. */}
                        <th className="px-2 py-3 w-20">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {viviendas.length > 0 ? (
                        viviendas.map((vivienda) => (
                            <tr key={vivienda.id} className="bg-white hover:bg-gray-50 text-center">
                                <td className="px-2 py-3 align-middle">{vivienda.manzana}</td>
                                <td className="px-2 py-3 align-middle">{vivienda.numeroCasa}</td>
                                <td className="px-2 py-3 align-middle">{vivienda.matricula}</td>
                                <td className="px-2 py-3 align-middle truncate" title={vivienda.nomenclatura}>
                                    {vivienda.nomenclatura}
                                </td>
                                <td className="px-2 py-3 font-semibold align-middle">
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
                                <td className="px-2 py-3 text-green-600 font-semibold align-middle">{formatCurrency(vivienda.totalAbonado)}</td>
                                <td className="px-2 py-3 text-red-600 font-semibold align-middle">{formatCurrency(vivienda.saldoPendiente)}</td>
                                <td className="px-2 py-3 align-middle">
                                    {vivienda.cliente ? (
                                        <div className="truncate" title={toTitleCase(`${vivienda.cliente.datosCliente?.nombres || ''} ${vivienda.cliente.datosCliente?.apellidos || ''}`)}>
                                            <span className="inline-block rounded-full bg-green-100 text-green-800 px-3 py-1 text-xs font-semibold">
                                                {toTitleCase(`${vivienda.cliente.datosCliente?.nombres || ''} ${vivienda.cliente.datosCliente?.apellidos || ''}`)}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="inline-block rounded-full bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-semibold">
                                            Disponible
                                        </span>
                                    )}
                                </td>
                                <td className="px-2 py-3 text-center relative align-middle">
                                    <Menu as="div" className="relative inline-block text-left">
                                        <Menu.Button className="inline-flex justify-center w-full rounded-full p-2 text-sm font-medium text-gray-500 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                                            <MoreVertical size={20} />
                                        </Menu.Button>
                                        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                            <Menu.Items className="absolute right-0 bottom-full mb-2 w-40 origin-bottom-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 focus:outline-none">
                                                <div className="px-1 py-1 ">
                                                    <Menu.Item>{({ active }) => (<button onClick={() => onEdit(vivienda)} className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}> <Pencil className="w-5 h-5 mr-2" /> Editar </button>)}</Menu.Item>
                                                    <Menu.Item>{({ active }) => (<button onClick={() => onDelete(vivienda)} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}> <Trash className="w-5 h-5 mr-2" /> Eliminar </button>)}</Menu.Item>
                                                </div>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" className="text-center py-10 text-gray-500">
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
