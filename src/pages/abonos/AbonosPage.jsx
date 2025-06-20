import React, { useEffect, useState, useMemo, useCallback } from "react";
import Select from "react-select"; // Necesario para futuras fases, lo mantenemos importado
// No necesitamos useForm, NumericFormat, EditarAbono, Trash, Pencil aún en esta fase
import { useToast } from "../../components/ToastContext";
import AnimatedPage from "../../components/AnimatedPage";
import { getViviendas, getClientes, getAbonos } from "../../utils/storage"; // Solo funciones de lectura por ahora

// Función de utilidad para formatear la fecha
const formatFriendlyDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
};

const AbonosPage = () => {
    console.log("FASE 2: AbonosPage se está renderizando."); // DEBUG
    const { showToast } = useToast();

    const [allViviendasData, setAllViviendasData] = useState([]);
    const [allAbonosData, setAllAbonosData] = useState([]);

    // Estados para controlar la visibilidad de la sección de registro (no se usan en esta fase, pero los inicializamos)
    const [showRegisterAbonoSection, setShowRegisterAbonoSection] = useState(false);
    // Estados relacionados con edición/eliminación (no se usan en esta fase, pero los inicializamos)
    const [abonoEditando, setAbonoEditando] = useState(null);
    const [isEditAbonoModalOpen, setIsEditAbonoModalOpen] = useState(false);
    const [shouldRenderEditAbonoModal, setShouldRenderEditAbonoModal] = useState(false);
    const [abonoAEliminar, setAbonoAEliminar] = useState(null);
    const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);


    // Función principal para cargar todos los datos desde storage y setear estados
    const loadAllData = useCallback(() => {
        console.log("FASE 2: loadAllData - Cargando todos los datos desde storage."); // DEBUG
        const viviendasFromStorage = getViviendas();
        const clientesFromStorage = getClientes();
        const abonosFromStorage = getAbonos();

        const viviendasConCliente = viviendasFromStorage.map(v => ({
            ...v,
            cliente: clientesFromStorage.find(c => c.id === v.clienteId) || null,
        }));
        setAllViviendasData(viviendasConCliente);
        setAllAbonosData(abonosFromStorage);

        console.log("FASE 2: loadAllData - allViviendasData set to:", viviendasConCliente); // DEBUG
        console.log("FASE 2: loadAllData - allAbonosData set to:", abonosFromStorage); // DEBUG
        return { viviendas: viviendasConCliente, abonos: abonosFromStorage }; // Devolvemos los datos por si se necesitan inmediatamente
    }, []);

    // Este useEffect se encarga de cargar los datos iniciales una única vez al montar el componente
    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    // Últimos N abonos para el historial general
    const latestAbonos = useMemo(() => {
        console.log("FASE 2: useMemo - Calculando últimos abonos para display. allAbonosData.length:", allAbonosData.length); // DEBUG
        // Ordenamos los abonos por ID (asumiendo que ID es un timestamp) y tomamos los últimos 10
        return [...allAbonosData]
            .sort((a, b) => b.id - a.id)
            .slice(0, 10)
            .map(abono => {
                // Para mostrar la vivienda y el cliente en la tabla
                const viviendaInfo = allViviendasData.find(v => v.id === abono.viviendaId);
                const viviendaLabel = viviendaInfo ? `Manzana ${viviendaInfo.manzana} - Casa ${viviendaInfo.numeroCasa}` : 'Vivienda Desconocida';
                const clienteNombre = viviendaInfo?.cliente?.nombre || 'Cliente Desconocido';
                return {
                    ...abono,
                    viviendaLabel: viviendaLabel,
                    clienteNombre: clienteNombre
                };
            });
    }, [allAbonosData, allViviendasData]); // Se recalcula si allAbonosData o allViviendasData cambian

    return (
        <AnimatedPage>
            <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-md mt-10 animate-fade-in">
                {/* Título principal de la página de Abonos */}
                <h2 className="text-3xl font-extrabold text-[#1976d2] uppercase text-center pb-4 mb-10">
                    <span className="inline-flex items-center gap-4">
                        <span role="img" aria-label="abono">💰</span> Gestión de Abonos
                    </span>
                </h2>

                {/* Botón para desplegar/ocultar la sección de Registro de Abono */}
                <div className="mb-6 text-center">
                    <button
                        onClick={() => setShowRegisterAbonoSection(!showRegisterAbonoSection)}
                        className="bg-[#1976d2] hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-all duration-200 inline-flex items-center gap-2"
                    >
                        {showRegisterAbonoSection ? 'Ocultar Formulario' : 'Registrar Nuevo Abono'}
                        {showRegisterAbonoSection ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Esta sección estará vacía por ahora en la Fase 2, se llenará en fases posteriores */}
                {showRegisterAbonoSection && (
                    <div className="animate-fade-in transition-all duration-300 ease-out">
                        <hr className="my-8 border-gray-200" />
                        <p className="text-center text-gray-600">Formulario de registro se mostrará aquí en la Fase 3.</p>
                    </div>
                )}

                <hr className="my-10 border-gray-200" />

                {/* Sección: Últimos Abonos Registrados (Tabla) */}
                <h3 className="text-xl font-bold mb-4 text-gray-800">Últimos Abonos Realizados</h3>
                {latestAbonos.length === 0 ? (
                    <p className="text-center text-gray-600 mt-4 mb-10">No hay abonos registrados en el sistema.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg shadow-lg mb-10">
                        <table className="min-w-full table-auto border-collapse text-center">
                            <thead className="bg-slate-700 text-white">
                                <tr className="uppercase tracking-wide text-xs font-semibold">
                                    <th className="px-4 py-2 rounded-tl-lg text-center">Fecha</th>
                                    <th className="px-4 py-2 text-center">Monto</th>
                                    <th className="px-4 py-2 text-center">Método de Pago</th>
                                    <th className="px-4 py-2 text-center">Vivienda</th>
                                    <th className="px-4 py-2 text-center">Cliente</th>
                                    {/* <th className="px-4 py-2 rounded-tr-lg text-center">Acciones</th> NO en esta fase aún */}
                                </tr>
                            </thead>
                            <tbody>
                                {latestAbonos.map((abono, index) => (
                                    <tr key={abono.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                        <td className="px-4 py-2 text-neutral-800 text-sm text-center">{formatFriendlyDate(abono.fechaPago)}</td>
                                        <td className="px-4 py-2 text-neutral-800 text-sm font-semibold text-center">
                                            {abono.monto.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}
                                        </td>
                                        <td className="px-4 py-2 text-neutral-800 text-sm text-center">{abono.metodoPago}</td>
                                        <td className="px-4 py-2 text-neutral-800 text-sm text-center">{abono.viviendaLabel}</td>
                                        <td className="px-4 py-2 text-neutral-800 text-sm text-center">{abono.clienteNombre}</td>
                                        {/* Acciones se añadirán en Fase 6 */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Las secciones de "Resumen de Pagos" e "Historial de Abonos de esta Vivienda" 
                    se añadirán y serán condicionales en fases posteriores */ }

            </div>
        </AnimatedPage>
    );
};

export default AbonosPage;