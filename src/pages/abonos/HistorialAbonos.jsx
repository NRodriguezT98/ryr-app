import React from 'react';
import { Trash, Pencil } from "lucide-react";

// Movemos la función de formato de fecha aquí, ya que es una dependencia de este componente.
const formatFriendlyDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
};

/**
 * Componente reutilizable para mostrar una tabla con el historial de abonos.
 * @param {object} props
 * @param {string} props.titulo - El título que se mostrará sobre la tabla.
 * @param {Array} props.abonos - El array de objetos de abono para mostrar.
 * @param {Function} props.onEdit - La función a llamar cuando se hace clic en el botón de editar.
 * @param {Function} props.onDelete - La función a llamar cuando se hace clic en el botón de eliminar.
 */
const HistorialAbonos = ({ titulo, abonos, onEdit, onDelete }) => {
    return (
        <div className="mt-10">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{titulo}</h3>

            {/* Manejo del estado vacío: si no hay abonos, muestra un mensaje amigable. */}
            {abonos.length === 0 ? (
                <p className="text-center text-gray-600 mt-4">No hay abonos para mostrar.</p>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow-lg">
                    <table className="min-w-full table-auto border-collapse text-center">
                        <thead className="bg-slate-700 text-white">
                            <tr className="uppercase tracking-wide text-xs font-semibold">
                                <th className="px-4 py-2">Fecha</th>
                                <th className="px-4 py-2">Monto</th>
                                <th className="px-4 py-2">Método de Pago</th>
                                <th className="px-4 py-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {abonos.map((abono, index) => (
                                <tr key={abono.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="px-4 py-2">{formatFriendlyDate(abono.fechaPago)}</td>
                                    <td className="px-4 py-2 font-semibold">
                                        {(abono.monto ?? 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-4 py-2">
                                        {abono.metodoPago ?? 'No especificado'}
                                    </td>
                                    <td className="px-4 py-2">
                                        {/* Los botones ahora llaman a las funciones pasadas por props */}
                                        <button onClick={() => onEdit(abono)} className="p-2 text-yellow-500 hover:text-yellow-700"><Pencil size={16} /></button>
                                        <button onClick={() => onDelete(abono)} className="p-2 text-red-600 hover:text-red-800"><Trash size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default HistorialAbonos;