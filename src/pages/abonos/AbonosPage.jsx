import React, { useEffect, useState, useMemo, useCallback } from "react";
import Select from "react-select";
import toast from 'react-hot-toast'; // --> 1. USAMOS LA NUEVA LIBRERÍA
import AnimatedPage from "../../components/AnimatedPage";
import ResumenAbonos from './ResumenAbonos.jsx';
import HistorialAbonos from './HistorialAbonos.jsx';
import FormularioAbono from './FormularioAbono.jsx';
import EditarAbonoModal from "./EditarAbonoModal"; // Asegúrate que la ruta a tu modal de edición sea correcta
import ModalConfirmacion from "../../components/ModalConfirmacion.jsx";
import { getViviendas, getClientes, getAbonos, deleteAbono } from "../../utils/storage";

const AbonosPage = () => {
    // --> 2. ELIMINAMOS const { showToast } = useToast();
    const [allAbonos, setAllAbonos] = useState([]);
    const [allViviendas, setAllViviendas] = useState([]);
    const [selectedViviendaId, setSelectedViviendaId] = useState(null);
    const [abonoAEditar, setAbonoAEditar] = useState(null);
    const [abonoAEliminar, setAbonoAEliminar] = useState(null);

    const loadData = useCallback(() => {
        const viviendasData = getViviendas();
        const clientesData = getClientes();
        const abonosData = getAbonos();
        const viviendasConCliente = viviendasData.map(v => ({
            ...v,
            cliente: clientesData.find(c => c.id === v.clienteId) || null,
        }));
        setAllViviendas(viviendasConCliente);
        setAllAbonos(abonosData);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const viviendaOptions = useMemo(() =>
        allViviendas
            .filter(v => v.clienteId)
            .map(v => ({
                value: v.id,
                label: `Manzana ${v.manzana} - Casa ${v.numeroCasa} (${v.cliente?.nombre || 'N/A'})`,
            })),
        [allViviendas]
    );

    const viviendaSeleccionada = useMemo(() =>
        allViviendas.find(v => v.id === selectedViviendaId),
        [allViviendas, selectedViviendaId]
    );

    const datosViviendaSeleccionada = useMemo(() => {
        if (!viviendaSeleccionada) return null;
        const historial = allAbonos
            .filter(a => a.viviendaId === viviendaSeleccionada.id)
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));
        const totalAbonado = historial.reduce((sum, abono) => sum + (abono.monto || 0), 0);
        const valorTotal = viviendaSeleccionada.valorTotal;
        return {
            historial,
            resumen: {
                valorTotal,
                totalAbonado,
                saldoPendiente: valorTotal - totalAbonado,
            },
        };
    }, [allAbonos, viviendaSeleccionada]);

    const handleSelectVivienda = (option) => {
        setSelectedViviendaId(option ? option.value : null);
    };

    const confirmarEliminarAbono = useCallback(() => {
        if (abonoAEliminar) {
            deleteAbono(abonoAEliminar.id);
            // --> 3. USAMOS LA NUEVA SINTAXIS DE TOAST
            toast.success("Abono eliminado correctamente.");
            setAbonoAEliminar(null);
            loadData();
        }
    }, [abonoAEliminar, loadData]);

    return (
        <AnimatedPage>
            <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-md mt-10">
                <h2 className="text-3xl font-extrabold text-[#1976d2] uppercase text-center pb-4 mb-10">
                    <span className="inline-flex items-center gap-4">💰 Gestión de Abonos</span>
                </h2>

                <div className="mb-8">
                    <label className="block font-semibold mb-2" htmlFor="select-vivienda">Seleccionar Vivienda</label>
                    <Select
                        id="select-vivienda"
                        options={viviendaOptions}
                        onChange={handleSelectVivienda}
                        placeholder="Buscar o seleccionar vivienda..."
                        isClearable
                        value={viviendaOptions.find(opt => opt.value === selectedViviendaId) || null}
                        noOptionsMessage={() => "No hay viviendas con clientes asignados."}
                    />
                </div>

                {viviendaSeleccionada && datosViviendaSeleccionada && (
                    <div className="animate-fade-in">
                        <ResumenAbonos resumen={datosViviendaSeleccionada.resumen} />
                        <FormularioAbono
                            vivienda={viviendaSeleccionada}
                            resumenPago={datosViviendaSeleccionada.resumen}
                            onAbonoRegistrado={loadData}
                        />
                        <HistorialAbonos
                            titulo="Historial de Abonos de esta Vivienda"
                            abonos={datosViviendaSeleccionada.historial}
                            onEdit={setAbonoAEditar}
                            onDelete={setAbonoAEliminar}
                        />
                    </div>
                )}
            </div>

            {/* Modales */}
            {abonoAEditar && (
                <EditarAbonoModal
                    isOpen={!!abonoAEditar}
                    onClose={() => setAbonoAEditar(null)}
                    onSave={loadData}
                    abonoAEditar={abonoAEditar}
                />
            )}
            {abonoAEliminar && (
                <ModalConfirmacion
                    isOpen={!!abonoAEliminar}
                    onClose={() => setAbonoAEliminar(null)}
                    onConfirm={confirmarEliminarAbono}
                    titulo="¿Eliminar Abono?"
                    mensaje="¿Estás seguro de que quieres eliminar este abono? Esta acción es irreversible."
                />
            )}
        </AnimatedPage>
    );
};

export default AbonosPage;