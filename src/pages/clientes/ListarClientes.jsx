import React, { useEffect, useState } from "react";
import { Trash, Pencil } from "lucide-react"; // Importamos Pencil
import AnimatedPage from "../../components/AnimatedPage";
import EditarCliente from "./EditarCliente";
import Toast from "../../components/Toast";
import { getClientes, saveClientes, getViviendas, saveViviendas } from "../../utils/storage"; // Importar funciones de storage

function formatID(cedula) {
    if (/^\d+$/.test(cedula)) {
        return Number(cedula).toLocaleString("es-CO");
    }
    return cedula;
}

const ListarClientes = () => {
    const [clientes, setClientes] = useState([]);
    const [viviendas, setViviendas] = useState([]); // Mantener si necesitas las viviendas en este componente para algo más

    const [selectedCliente, setSelectedCliente] = useState(null); // Cliente que se está editando
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Controla la visibilidad real del modal

    // Este es el estado clave para manejar la transición de salida del modal principal
    // Debe estar en el padre para decidir cuándo desmontar EditarCliente
    const [shouldRenderEditModal, setShouldRenderEditModal] = useState(false);

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success"
    });

    const [claveAEliminar, setClaveAEliminar] = useState(null);
    const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
    const [animandoFila, setAnimandoFila] = useState(null);

    // Función para cargar los clientes y viviendas con sus asignaciones
    const cargarDatosClientes = () => {
        const dataClientes = getClientes(); // Usa la función de storage
        const dataViviendas = getViviendas(); // Usa la función de storage

        const clientesConVivienda = dataClientes.map((cliente) => {
            const viviendaAsignada = dataViviendas.find((v) => v.clienteId === cliente.id);
            return {
                ...cliente,
                vivienda: viviendaAsignada || null,
            };
        });

        const ordenados = clientesConVivienda.sort((a, b) => a.nombre.localeCompare(b.nombre));
        setClientes(ordenados);
        setViviendas(dataViviendas); // Actualiza también el estado de viviendas si es necesario aquí
    };

    useEffect(() => {
        cargarDatosClientes();
    }, []);

    // Asegura que el modal de edición se monte/desmonte con animación
    useEffect(() => {
        if (isEditModalOpen) {
            setShouldRenderEditModal(true); // Monta el componente
        } else {
            // El desmontaje se retrasará por la animación dentro de EditarCliente.jsx
            // No hacemos nada aquí, ya que EditarCliente se desmontará solo cuando su animación interna termine
        }
    }, [isEditModalOpen]);


    const obtenerClave = (cliente) => `${cliente.nombre}-${cliente.id}`;

    // Abrir modal editar
    const abrirModalEditar = (clave) => {
        const cliente = clientes.find((c) => obtenerClave(c) === clave);
        setSelectedCliente(cliente);
        setIsEditModalOpen(true); // Esto activa la apertura del modal
    };

    // Guardar cambios desde modal editar (Simplificado porque la lógica de storage está en EditarCliente)
    const handleGuardarCliente = (datosActualizados) => {
        // La lógica de guardado y asignación/desasignación de viviendas ya se manejó en EditarCliente.
        cargarDatosClientes();

        setToast({
            show: true,
            message: "Se guardaron los cambios en el cliente",
            type: "success"
        });
        //setIsEditModalOpen(false); // Esto lo manejará la función onClose de EditarCliente
    };

    // ELIMINAR (Esta lógica ya la tienes y es funcional)
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
            saveClientes(nuevosClientes); // Usa saveClientes del storage

            // Liberar vivienda asignada
            let currentViviendas = getViviendas(); // Obtener las viviendas actuales
            const viviendasActualizadas = currentViviendas.map((v) =>
                v.clienteId === clienteEliminado.id ? { ...v, clienteId: null } : v
            );
            saveViviendas(viviendasActualizadas); // Usa saveViviendas del storage
            setViviendas(viviendasActualizadas); // Actualiza el estado local de viviendas

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

    const handleCerrarEditar = () => setIsEditModalOpen(false); // Directamente cierra el modal
    const handleCierreFinalizado = () => {
        setShouldRenderEditModal(false); // Solo entonces desmontamos completamente el componente
        setSelectedCliente(null); // Limpiar el cliente seleccionado
        cargarDatosClientes(); // Recargar datos para asegurarse de que la lista esté actualizada
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

                    {clientes.length === 0 ? (
                        <p className="text-center text-gray-600">No hay clientes registrados.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto border-collapse shadow-lg rounded-2xl overflow-hidden text-center">
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
                                                        <Pencil size={16} />
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

            {shouldRenderEditModal && (
                <EditarCliente
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModalRequest}
                    onCierreFinalizado={handleCierreFinalizado}
                    onGuardar={handleGuardarCliente}
                    clienteAEditar={selectedCliente} // Renombrado de 'cliente' a 'clienteAEditar' para consistencia
                />
            )}

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