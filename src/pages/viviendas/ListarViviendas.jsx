import React, { useEffect, useState } from "react";
import { Trash, Pencil } from "lucide-react";
import AnimatedPage from "../../components/AnimatedPage";
import EditarVivienda from "./EditarVivienda"; // Asegúrate de la ruta correcta
import Toast from "../../components/Toast";
import { getViviendas, saveViviendas, getClientes, saveClientes } from "../../utils/storage";

// Función para formatear valores numéricos (ej. cédulas) si es necesario,
// aunque para viviendas quizás no se use directamente, la mantengo si la tenías.
function formatID(num) {
    if (typeof num === 'number') {
        return num.toLocaleString("es-CO");
    }
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}


const ListarViviendas = () => {
    const [viviendas, setViviendas] = useState([]);
    const [clientes, setClientes] = useState([]); // Necesario para vincular viviendas con clientes

    // Estados para el modal de edición de VIVIENDA
    const [selectedVivienda, setSelectedVivienda] = useState(null);
    const [isEditViviendaModalOpen, setIsEditViviendaModalOpen] = useState(false);
    const [shouldRenderViviendaEditModal, setShouldRenderViviendaEditModal] = useState(false);

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success"
    });

    const [claveAEliminar, setClaveAEliminar] = useState(null);
    const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
    const [animandoFila, setAnimandoFila] = useState(null);

    // Función para cargar los datos de viviendas y vincularlos con clientes
    const cargarDatosViviendas = () => {
        const dataViviendas = getViviendas();
        const dataClientes = getClientes();

        const viviendasConCliente = dataViviendas.map(vivienda => {
            const clienteAsignado = dataClientes.find(c => c.viviendaId === vivienda.id);
            return {
                ...vivienda,
                cliente: clienteAsignado || null
            };
        });
        setViviendas(viviendasConCliente);
        setClientes(dataClientes); // Actualiza también el estado de clientes si lo usas en el componente
    };

    // Carga los datos al montar el componente
    useEffect(() => {
        cargarDatosViviendas();
    }, []);

    // Efecto para controlar el montaje/desmontaje del modal de edición de vivienda con animación
    useEffect(() => {
        if (isEditViviendaModalOpen) {
            setShouldRenderViviendaEditModal(true); // Monta el componente si debe estar abierto
        }
        // Si isEditViviendaModalOpen es false, el componente interno se encargará de su animación de salida
        // y luego llamará a handleViviendaEditModalAnimationFinished
    }, [isEditViviendaModalOpen]);

    // Función para obtener una clave única para cada fila de la tabla
    const obtenerClave = (vivienda) => `V${vivienda.manzana}-${vivienda.numeroCasa}-${vivienda.id}`;

    // Abre el modal de edición de vivienda
    const abrirModalEditarVivienda = (viviendaToEdit) => {
        setSelectedVivienda(viviendaToEdit);
        setIsEditViviendaModalOpen(true); // Activa la visualización del modal
    };

    // Maneja el guardado de los datos de vivienda actualizados desde el modal de edición
    const handleGuardarVivienda = (updatedVivienda) => {
        // La lógica de guardado en localStorage y de actualización de estados ya está en EditarViviendaContent
        // Aquí, simplemente recargamos los datos para reflejar los cambios en la tabla principal
        cargarDatosViviendas();
        setToast({
            show: true,
            message: "Vivienda actualizada correctamente",
            type: "success"
        });
    };

    // Función que se pasa a EditarVivienda para iniciar la animación de cierre
    const handleCloseViviendaEditModalRequest = () => {
        setIsEditViviendaModalOpen(false); // Le decimos al modal que inicie su animación de salida
    };

    // Función que se ejecuta DESPUÉS de que EditarVivienda termina su animación de salida
    const handleViviendaEditModalAnimationFinished = () => {
        setShouldRenderViviendaEditModal(false); // Desmonta el componente después de la animación
        setSelectedVivienda(null); // Limpia la vivienda seleccionada
        // Puedes volver a cargar los datos aquí si es necesario
        // cargarDatosViviendas();
    };

    // Inicia el proceso de eliminación de una vivienda
    const iniciarEliminacion = (clave) => {
        setClaveAEliminar(clave);
        setMostrarConfirmacionEliminar(true);
    };

    // Confirma y ejecuta la eliminación de una vivienda
    const confirmarEliminar = () => {
        setAnimandoFila(claveAEliminar); // Activa animación de salida de la fila
        setTimeout(() => {
            const viviendaEliminada = viviendas.find((v) => obtenerClave(v) === claveAEliminar);
            const nuevasViviendas = viviendas.filter((v) => obtenerClave(v) !== claveAEliminar);
            setViviendas(nuevasViviendas);
            saveViviendas(nuevasViviendas); // Guarda en localStorage

            // Desvincular cliente si la vivienda eliminada estaba asignada
            if (viviendaEliminada.cliente) {
                const updatedClientes = getClientes().map(c =>
                    c.viviendaId === viviendaEliminada.id ? { ...c, viviendaId: null } : c
                );
                saveClientes(updatedClientes); // Guarda clientes actualizados
                setClientes(updatedClientes); // Actualizar el estado local de clientes
            }

            setMostrarConfirmacionEliminar(false); // Cierra modal de confirmación
            setClaveAEliminar(null); // Resetea clave a eliminar

            setToast({
                show: true,
                message: "Vivienda eliminada correctamente",
                type: "success"
            });

            setTimeout(() => setAnimandoFila(null), 400); // Resetea animación de fila
        }, 300);
    };

    return (
        <>
            {/* Componente Toast para notificaciones */}
            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(t => ({ ...t, show: false }))}
            />

            <AnimatedPage>
                {/* Contenedor principal de la tabla con estilos modernizados */}
                <div className="w-fit mx-auto bg-white p-6 rounded-2xl shadow-2xl mt-10 relative">
                    {/* TÍTULO MODERNIZADO */}
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-extrabold text-[#c62828] uppercase inline-flex items-center gap-4 pb-4">
                            <span role="img" aria-label="viviendas">🏠</span>
                            Viviendas Registradas
                        </h2>
                        {/* Separador moderno */}
                        <div className="w-24 h-1 bg-[#c62828] mx-auto rounded-full mt-2"></div>
                    </div>

                    {viviendas.length === 0 ? (
                        <p className="text-center text-gray-600">No hay viviendas registradas.</p>
                    ) : (
                        <div className="overflow-x-auto"> {/* Para tablas grandes en pantallas pequeñas */}
                            {/* TABLA MODERNIZADA */}
                            <table className="min-w-full table-auto border-collapse rounded-2xl overflow-hidden text-center">
                                {/* Cabecera de la tabla */}
                                <thead className="bg-slate-700 text-white"> {/* Color de cabecera unificado y moderno */}
                                    <tr className="uppercase tracking-wide text-xs font-semibold">
                                        <th className="px-5 py-3 whitespace-nowrap rounded-tl-xl text-center">Manzana</th>
                                        <th className="px-5 py-3 whitespace-nowrap text-center">Número de Casa</th>
                                        <th className="px-5 py-3 whitespace-nowrap text-center">Matrícula</th>
                                        <th className="px-5 py-3 whitespace-nowrap text-center">Nomenclatura</th>
                                        <th className="px-5 py-3 whitespace-nowrap text-center">Valor Total</th>
                                        <th className="px-5 py-3 whitespace-nowrap text-center">Cliente Asignado</th>
                                        <th className="px-5 py-3 whitespace-nowrap rounded-tr-xl text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viviendas.map((v, idx) => {
                                        const clave = obtenerClave(v);
                                        return (
                                            <tr
                                                key={clave}
                                                className={`
                                                    ${animandoFila === clave ? "animate-fade-out" : "animate-fade-in"}
                                                    ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} {/* Filas alternas */}
                                                    hover:bg-yellow-50 transition /* Efecto hover */
                                                `}
                                            >
                                                <td className="px-5 py-3 whitespace-nowrap text-neutral-800 font-normal text-base text-center">{v.manzana}</td>
                                                <td className="px-5 py-3 whitespace-nowrap text-neutral-800 font-normal text-base text-center">{v.numeroCasa}</td>
                                                <td className="px-5 py-3 whitespace-nowrap text-neutral-800 font-normal text-base text-center">{v.matricula}</td>
                                                <td className="px-5 py-3 whitespace-nowrap text-neutral-800 font-normal text-base text-center">{v.nomenclatura}</td>
                                                <td className="px-5 py-3 whitespace-nowrap text-neutral-800 font-normal text-base text-center">
                                                    {Number(v.valorTotal).toLocaleString("es-CO", {
                                                        style: "currency",
                                                        currency: "COP",
                                                        minimumFractionDigits: 0,
                                                    })}
                                                </td>
                                                <td className="px-5 py-3 whitespace-nowrap text-neutral-800 font-normal text-base text-center">
                                                    {v.cliente
                                                        ? v.cliente.nombre
                                                        : (
                                                            <span className="inline-block rounded-lg bg-red-50 text-red-700 px-2 py-0.5 text-xs font-semibold">
                                                                No hay cliente asignado
                                                            </span>
                                                        )}
                                                </td>
                                                {/* BOTONES DE ACCIÓN MEJORADOS */}
                                                <td className="px-5 py-3 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() => abrirModalEditarVivienda(v)}
                                                        className="inline-flex items-center gap-2
                                                                   bg-yellow-500 text-white
                                                                   hover:bg-yellow-600 hover:shadow-md
                                                                   px-4 py-2
                                                                   text-sm font-semibold
                                                                   rounded-full transition-all duration-200"
                                                    >
                                                        <Pencil size={16} />
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => iniciarEliminacion(clave)}
                                                        className="inline-flex items-center gap-2
                                                                   bg-red-600 text-white
                                                                   hover:bg-red-700 hover:shadow-md
                                                                   px-4 py-2
                                                                   text-sm font-semibold
                                                                   rounded-full transition-all duration-200
                                                                   ml-2"
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

            {/* Modal de edición de vivienda (se renderiza condicionalmente) */}
            {shouldRenderViviendaEditModal && selectedVivienda && (
                <EditarVivienda
                    isOpen={isEditViviendaModalOpen}
                    onClose={handleCloseViviendaEditModalRequest}
                    onCierreFinalizado={handleViviendaEditModalAnimationFinished}
                    onGuardar={handleGuardarVivienda}
                    vivienda={selectedVivienda}
                />
            )}

            {/* Modal de confirmación de eliminación (con estilos existentes) */}
            {mostrarConfirmacionEliminar && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white p-7 rounded-2xl shadow-2xl max-w-sm w-full">
                        <h3 className="text-xl font-bold text-center mb-2 text-red-600 font-montserrat">¿Eliminar vivienda?</h3>
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

export default ListarViviendas;