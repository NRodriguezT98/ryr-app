import React from 'react';
import { Trash, Pencil } from "lucide-react";

/**
 * Componente de presentación que renderiza la tabla de viviendas.
 * @param {object} props
 * @param {Array} props.viviendas - La lista de viviendas a mostrar.
 * @param {Function} props.onEdit - Callback a ejecutar cuando se presiona el botón de editar.
 * @param {Function} props.onDelete - Callback a ejecutar cuando se presiona el botón de eliminar.
 */
const TablaViviendas = ({ viviendas, onEdit, onDelete }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse rounded-2xl overflow-hidden text-center">
                <thead className="bg-slate-700 text-white">
                    <tr className="uppercase tracking-wide text-xs font-semibold">
                        <th className="px-5 py-3">Manzana</th>
                        <th className="px-5 py-3">Casa</th>
                        <th className="px-5 py-3">Matrícula</th>
                        <th className="px-5 py-3">Nomenclatura</th>
                        <th className="px-5 py-3">Valor Total</th>
                        <th className="px-5 py-3">Cliente Asignado</th>
                        <th className="px-5 py-3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {viviendas.map((vivienda, idx) => (
                        <tr
                            key={vivienda.id}
                            className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-yellow-50 transition-colors duration-200`}
                        >
                            <td className="px-5 py-3">{vivienda.manzana}</td>
                            <td className="px-5 py-3">{vivienda.numeroCasa}</td>
                            <td className="px-5 py-3">{vivienda.matricula}</td>
                            <td className="px-5 py-3">{vivienda.nomenclatura}</td>
                            <td className="px-5 py-3">
                                {Number(vivienda.valorTotal).toLocaleString("es-CO", {
                                    style: "currency",
                                    currency: "COP",
                                    minimumFractionDigits: 0,
                                })}
                            </td>
                            <td className="px-5 py-3">
                                {vivienda.cliente ? (
                                    vivienda.cliente.nombre
                                ) : (
                                    <span className="inline-block rounded-lg bg-red-50 text-red-700 px-2 py-0.5 text-xs font-semibold">
                                        No asignado
                                    </span>
                                )}
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap">
                                <button
                                    onClick={() => onEdit(vivienda)}
                                    className="p-2 text-yellow-500 hover:text-yellow-700 transition-colors duration-200"
                                    aria-label="Editar"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => onDelete(vivienda)}
                                    className="p-2 text-red-600 hover:text-red-800 transition-colors duration-200"
                                    aria-label="Eliminar"
                                >
                                    <Trash size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TablaViviendas;