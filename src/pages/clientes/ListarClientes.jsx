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
            setTimeout(() => setAnimandoFila(null), 400);
        }, 300);
    };

    return (
        <>
            <AnimatedPage>
                <div className="w-fit mx-auto bg-white p-6 rounded-2xl shadow-2xl mt-10 relative">
                    <h2 className="text-2xl font-bold mb-6 text-[#c62828] text-center font-montserrat">
                        <span className="inline-flex items-center gap-2">
                            <span role="img" aria-label="clientes">👥</span>
                            Clientes Registrados
                        </span>
                    </h2>

                    {mensajeEliminado && (
                        <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 z-20">
                            ✅ Cliente eliminado correctamente
                        </div>
                    )}

                    {clientes.length === 0 ? (
                        <p className="text-center text-gray-600">No hay clientes registrados.</p>
                    ) : (
                        <div className="w-fit mx-auto">
                            <table className="table-auto border-collapse shadow-md">
                                <thead className="bg-[#c62828] text-white select-none">
                                    <tr>
                                        <th className="px-5 py-3 whitespace-nowrap font-semibold rounded-tl-xl text-base">Nombre</th>
                                        <th className="px-5 py-3 whitespace-nowrap font-semibold text-base">Identificación</th>
                                        <th className="px-5 py-3 whitespace-nowrap font-semibold text-base">Teléfono</th>
                                        <th className="px-5 py-3 whitespace-nowrap font-semibold text-base">Vivienda Asignada</th>
                                        <th className="px-5 py-3 whitespace-nowrap font-semibold text-base rounded-tr-xl">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientes.map((c, idx) => {
                                        const clave = obtenerClave(c);
                                        return (
                                            <tr
                                                key={clave}
                                                className={`
                                                    ${animandoFila === clave ? "animate-fade-out" : "animate-fade-in"}
                                                    ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                                    hover:bg-yellow-50 transition
                                                `}
                                            >
                                                {/* Fuente, tamaño y color exactamente igual que 'Cliente asignado' en viviendas */}
                                                <td className="px-5 py-2 whitespace-nowrap text-neutral-800 font-normal text-base">{c.nombre}</td>
                                                <td className="px-5 py-2 whitespace-nowrap text-neutral-800 font-normal text-base">{c.cedula}</td>
                                                <td className="px-5 py-2 whitespace-nowrap text-neutral-800 font-normal text-base">{c.telefono}</td>
                                                <td className="px-5 py-2 font-medium text-gray-800 whitespace-nowrap">
                                                    {c.vivienda
                                                        ? (
                                                            <span className="inline-block rounded-lg bg-green-50 text-green-700 px-2 py-0.5 text-xs font-semibold">
                                                                {c.vivienda.manzana}{c.vivienda.numeroCasa}
                                                            </span>
                                                        )
                                                        : (
                                                            <span className="inline-block rounded-lg bg-gray-100 text-gray-500 px-2 py-0.5 text-xs">
                                                                No asignada
                                                            </span>
                                                        )}
                                                </td>
                                                <td className="px-5 py-2 whitespace-nowrap">
                                                    <button
                                                        onClick={() => iniciarEliminacion(clave)}
                                                        className="inline-flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 border-none font-semibold px-4 py-1.5 rounded-full transition-all shadow-sm focus:outline-none"
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
                    <div className="bg-white p-7 rounded-2xl shadow-2xl max-w-sm w-full">
                        <h3 className="text-xl font-bold text-center mb-2 text-red-600 font-montserrat">¿Eliminar cliente?</h3>
                        <p className="text-center mb-6 text-gray-700">Esta acción no se puede deshacer.</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setMostrarConfirmacionEliminar(false);
                                    setClaveAEliminar(null);
                                }}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-5 py-2 rounded-full transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarEliminar}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-full shadow transition"
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
