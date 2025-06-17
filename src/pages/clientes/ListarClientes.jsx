import React, { useEffect, useState } from "react";
import { Trash } from "lucide-react";
import AnimatedPage from "../../components/AnimatedPage";
import EditarCliente from "./EditarCliente";
import Toast from "../../components/Toast"; // <--- NUEVO

function formatID(cedula) {
    if (/^\d+$/.test(cedula)) {
        return Number(cedula).toLocaleString("es-CO");
    }
    return cedula;
}

const ListarClientes = () => {
    const [clientes, setClientes] = useState([]);
    const [viviendas, setViviendas] = useState([]);
    const [claveEditando, setClaveEditando] = useState(null);
    const [clienteEditando, setClienteEditando] = useState(null);
    const [desmontarEditarModal, setDesmontarEditarModal] = useState(false);

    // Toast state
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success"
    });

    const [claveAEliminar, setClaveAEliminar] = useState(null);
    const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
    const [animandoFila, setAnimandoFila] = useState(null);

    useEffect(() => {
        const dataClientes = JSON.parse(localStorage.getItem("clientes")) || [];
        const dataViviendas = JSON.parse(localStorage.getItem("viviendas")) || [];
        const clientesConVivienda = dataClientes.map((cliente) => {
            const viviendaAsignada = dataViviendas.find((v) => v.clienteId === cliente.id);
            return {
                ...cliente,
                vivienda: viviendaAsignada || null,
            };
        });

        const ordenados = clientesConVivienda.sort((a, b) => a.nombre.localeCompare(b.nombre));
        setClientes(ordenados);
        setViviendas(dataViviendas);
    }, []);

    const obtenerClave = (cliente) => `${cliente.nombre}-${cliente.id}`;

    // Abrir modal editar
    const abrirModalEditar = (clave) => {
        const cliente = clientes.find((c) => obtenerClave(c) === clave);
        setClienteEditando(cliente);
        setClaveEditando(clave);
        setDesmontarEditarModal(false);
    };

    // Guardar cambios desde modal editar
    const handleGuardarCliente = (datosActualizados) => {
        const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
        const viviendas = JSON.parse(localStorage.getItem("viviendas")) || [];

        const idxCliente = clientes.findIndex(c => c.id === datosActualizados.id);

        clientes[idxCliente] = {
            ...clientes[idxCliente],
            ...datosActualizados,
        };

        const viviendasActualizadas = viviendas.map((v) => {
            if (v.clienteId === datosActualizados.id && v.numeroCasa !== datosActualizados.viviendaId) {
                return { ...v, clienteId: null };
            }
            if (v.numeroCasa === datosActualizados.viviendaId) {
                return { ...v, clienteId: datosActualizados.id };
            }
            return v;
        });

        localStorage.setItem("clientes", JSON.stringify(clientes));
        localStorage.setItem("viviendas", JSON.stringify(viviendasActualizadas));

        const clientesConVivienda = clientes.map((c) => {
            const vivienda = viviendasActualizadas.find((v) => v.clienteId === c.id);
            return { ...c, vivienda: vivienda || null };
        });

        setClientes(clientesConVivienda);
        setViviendas(viviendasActualizadas);

        setToast({
            show: true,
            message: "Se guardaron los cambios en el cliente",
            type: "success"
        });
    };

    // ELIMINAR
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
            setViviendas(viviendasActualizadas);
            setMostrarConfirmacionEliminar(false);
            setClaveAEliminar(null);

            setToast({
                show: true,
                message: "Cliente eliminado correctamente",
                type: "success"
            });

            setTimeout(() => setAnimandoFila(null), 400);
        }, 300);
    };

    // Modal solo se desmonta después del fade-out
    const handleCerrarEditar = () => setDesmontarEditarModal(true);
    const handleCierreFinalizado = () => {
        setClaveEditando(null);
        setClienteEditando(null);
        setDesmontarEditarModal(false);
    };

    return (
        <>
            {/* TOAST */}
            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(t => ({ ...t, show: false }))}
            />

            <AnimatedPage>
                <div className="w-fit mx-auto bg-white p-6 rounded-2xl shadow-2xl mt-10 relative">
                    <h2 className="text-2xl font-bold mb-6 text-[#c62828] text-center font-montserrat">
                        <span className="inline-flex items-center gap-2">
                            <span role="img" aria-label="clientes">👥</span>
                            Clientes Registrados
                        </span>
                    </h2>

                    {/* NOTA: Eliminado el mensaje antiguo de éxito/eliminado */}

                    {clientes.length === 0 ? (
                        <p className="text-center text-gray-600">No hay clientes registrados.</p>
                    ) : (
                        <div className="w-fit mx-auto">
                            <table className="table-auto border-collapse shadow-lg rounded-2xl overflow-hidden text-center">
                                <thead className="bg-[#c62828] text-white">
                                    <tr className="uppercase tracking-wide text-xs font-semibold text-center">
                                        <th className="px-5 py-3 whitespace-nowrap rounded-tl-xl text-center">Nombre</th>
                                        <th className="px-5 py-3 whitespace-nowrap text-center">Identificación</th>
                                        <th className="px-5 py-3 whitespace-nowrap text-center">Teléfono</th>
                                        <th className="px-5 py-3 whitespace-nowrap text-center">Correo</th>
                                        <th className="px-5 py-3 whitespace-nowrap text-center">Dirección</th>
                                        <th className="px-5 py-3 whitespace-nowrap text-center">Vivienda Asignada</th>
                                        <th className="px-5 py-3 whitespace-nowrap rounded-tr-xl text-center">Acciones</th>
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
                                                <td className="px-5 py-3 whitespace-nowrap text-neutral-800 font-normal text-base text-center">{c.nombre}</td>
                                                <td className="px-5 py-3 whitespace-nowrap text-neutral-800 font-normal text-base text-center">
                                                    {formatID(c.cedula)}
                                                </td>
                                                <td className="px-5 py-3 whitespace-nowrap text-neutral-800 font-normal text-base text-center">{c.telefono}</td>
                                                <td className="px-5 py-3 whitespace-nowrap text-neutral-800 font-normal text-base text-center">{c.correo}</td>
                                                <td className="px-5 py-3 whitespace-nowrap text-neutral-800 font-normal text-base text-center">{c.direccion}</td>
                                                <td className="px-5 py-3 whitespace-nowrap text-neutral-800 font-normal text-base text-center">
                                                    {c.vivienda
                                                        ? `Manzana ${c.vivienda.manzana} - Casa ${c.vivienda.numeroCasa}`
                                                        : (
                                                            <span className="inline-block rounded-lg bg-green-50 text-green-700 px-2 py-0.5 text-xs font-semibold">
                                                                No asignada
                                                            </span>
                                                        )}
                                                </td>
                                                <td className="px-5 py-3 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() => abrirModalEditar(clave)}
                                                        className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300 px-3 py-1.5 text-sm rounded-full transition-all duration-200 hover:shadow-sm"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z" />
                                                        </svg>
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => iniciarEliminacion(clave)}
                                                        className="inline-flex items-center gap-2 bg-red-100 text-red-800 hover:bg-red-200 border border-red-300 px-3 py-1.5 text-sm rounded-full transition-all duration-200 hover:shadow-sm ml-2"
                                                    >
                                                        <Trash size={16} />
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

            {/* MODAL EDITAR CLIENTE */}
            {claveEditando && clienteEditando && !desmontarEditarModal && (
                <EditarCliente
                    isOpen={!!claveEditando}
                    onClose={handleCerrarEditar}
                    onCierreFinalizado={handleCierreFinalizado}
                    onGuardar={handleGuardarCliente}
                    cliente={clienteEditando}
                    viviendas={viviendas}
                />
            )}

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
