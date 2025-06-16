import React, { useEffect, useState } from "react";
import { Trash } from "lucide-react";
import AnimatedPage from "../../components/AnimatedPage";

const ListarClientes = () => {
    const [clientes, setClientes] = useState([]);
    const [claveAEliminar, setClaveAEliminar] = useState(null);
    const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
    const [mensajeEliminado, setMensajeEliminado] = useState(false);
    const [animandoFila, setAnimandoFila] = useState(null);

    useEffect(() => {
        const dataClientes = JSON.parse(localStorage.getItem("clientes")) || [];
        const viviendas = JSON.parse(localStorage.getItem("viviendas")) || [];

        // Asociar vivienda completa a cada cliente según clienteId
        const clientesConVivienda = dataClientes.map((cliente) => {
            const viviendaAsignada = viviendas.find((v) => v.clienteId === cliente.id);
            return {
                ...cliente,
                vivienda: viviendaAsignada || null,
            };
        });

        const ordenados = clientesConVivienda.sort((a, b) => a.nombre.localeCompare(b.nombre));
        setClientes(ordenados);
    }, []);

    const obtenerClave = (cliente) => `${cliente.nombre}-${cliente.id}`;

    const iniciarEliminacion = (clave) => {
        setClaveAEliminar(clave);
        setMostrarConfirmacionEliminar(true);
    };

    const confirmarEliminar = () => {
        setAnimandoFila(claveAEliminar);

        setTimeout(() => {
            const clienteEliminado = clientes.find((c) => obtenerClave(c) === claveAEliminar);
            const nuevosClientes = clientes.filter((c) => obtenerClave(c) !== claveAEliminar);
            setClientes(nuevosClientes);
            localStorage.setItem("clientes", JSON.stringify(nuevosClientes));

            // Liberar vivienda asignada
            const viviendas = JSON.parse(localStorage.getItem("viviendas")) || [];
            const viviendasActualizadas = viviendas.map((v) =>
                v.clienteId === clienteEliminado.id ? { ...v, clienteId: null } : v
            );
            localStorage.setItem("viviendas", JSON.stringify(viviendasActualizadas));

            setMostrarConfirmacionEliminar(false);
            setMensajeEliminado(true);
            setClaveAEliminar(null);
            setTimeout(() => setMensajeEliminado(false), 3000);
        }, 300);
    };


    return (
        <>
            <AnimatedPage>
                <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-md mt-10 relative">
                    <h2 className="text-2xl font-bold mb-4 text-[#c62828] text-center">
                        👥 Clientes Registrados
                    </h2>

                    {mensajeEliminado && (
                        <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300">
                            ✅ Cliente eliminado correctamente
                        </div>
                    )}

                    {clientes.length === 0 ? (
                        <p className="text-center text-gray-600">No hay clientes registrados.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table-auto w-full border text-sm text-center">
                                <thead className="bg-[#c62828] text-white">
                                    <tr>
                                        <th className="px-4 py-2">Nombre</th>
                                        <th className="px-4 py-2">Identificación</th>
                                        <th className="px-4 py-2">Teléfono</th>
                                        <th className="px-4 py-2">Vivienda</th>
                                        <th className="px-4 py-2">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientes.map((c) => {
                                        const clave = obtenerClave(c);
                                        return (
                                            <tr key={clave} className={`border-b ${animandoFila === clave ? "animate-fade-out" : "animate-fade-in"}`}>
                                                <td className="px-4 py-2">{c.nombre}</td>
                                                <td className="px-4 py-2">{c.cedula}</td>
                                                <td className="px-4 py-2">{c.telefono}</td>
                                                <td className="px-4 py-2">
                                                    {c.vivienda ? `${c.vivienda.manzana}-${c.vivienda.numeroCasa}` : "No asignada"}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <button
                                                        onClick={() => iniciarEliminacion(clave)}
                                                        className="inline-flex items-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-400 shadow-sm font-semibold px-4 py-1.5 rounded-full transition"
                                                    >
                                                        <Trash size={16} strokeWidth={2} />
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </AnimatedPage>

            {/* Modal confirmación eliminar */}
            {mostrarConfirmacionEliminar && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
                        <h3 className="text-lg font-semibold text-center mb-4 text-red-600">¿Eliminar cliente?</h3>
                        <p className="text-center mb-6 text-gray-700">Esta acción no se puede deshacer.</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setMostrarConfirmacionEliminar(false);
                                    setClaveAEliminar(null);
                                }}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarEliminar}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ListarClientes;
