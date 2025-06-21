// --- VERSIÓN FINAL Y ULTRA-LIMPIA DE ABONOSPAGE.JSX ---

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Select from "react-select";

import ModalConfirmacion from '../../components/ModalConfirmacion.jsx'; // Ajusta la ruta si es necesario
import { useToast } from "../../components/ToastContext";
import AnimatedPage from "../../components/AnimatedPage";
import ResumenAbonos from './ResumenAbonos.jsx';
import HistorialAbonos from './HistorialAbonos.jsx';
import FormularioAbono from './FormularioAbono.jsx';
import EditarAbonoModal from './EditarAbonoModal.jsx';
import { getViviendas, getClientes, getAbonos, addAbono, deleteAbono } from "../../utils/storage";

const AbonosPage = () => {
    const { showToast } = useToast();

    const [allViviendasData, setAllViviendasData] = useState([]);
    const [allAbonosData, setAllAbonosData] = useState([]);
    const [selectedViviendaId, setSelectedViviendaId] = useState(null);

    const [abonoEditando, setAbonoEditando] = useState(null);
    const [abonoAEliminar, setAbonoAEliminar] = useState(null);

    const loadAllData = useCallback(() => {
        const viviendas = getViviendas();
        const clientes = getClientes();
        const abonos = getAbonos();
        const viviendasConCliente = viviendas.map(v => ({
            ...v,
            cliente: clientes.find(c => c.id === v.clienteId) || null,
        }));
        setAllViviendasData(viviendasConCliente);
        setAllAbonosData(abonos);
    }, []);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    const viviendaOptions = useMemo(() =>
        allViviendasData
            .filter(v => v.clienteId)
            .map(v => ({
                value: v.id,
                label: `Manzana ${v.manzana} - Casa ${v.numeroCasa} (${v.cliente?.nombre || 'No Asignada'})`,
            })),
        [allViviendasData]
    );

    const datosViviendaSeleccionada = useMemo(() => {
        if (!selectedViviendaId) return null;
        const vivienda = allViviendasData.find(v => v.id === selectedViviendaId);
        if (!vivienda) return null;

        const historial = allAbonosData
            .filter(a => a.viviendaId === selectedViviendaId)
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));

        const totalAbonado = historial.reduce((sum, abono) => sum + (abono.monto || 0), 0);

        return {
            vivienda,
            historial,
            resumen: {
                valorTotal: vivienda.valorTotal,
                totalAbonado: totalAbonado,
                saldoPendiente: vivienda.valorTotal - totalAbonado,
            }
        };
    }, [selectedViviendaId, allViviendasData, allAbonosData]);

    const confirmarEliminarAbono = () => {
        if (abonoAEliminar) {
            deleteAbono(abonoAEliminar.id);
            showToast("🗑️ Abono eliminado correctamente.", "success");
            loadAllData();
            setAbonoAEliminar(null);
        }
    };

    return (
        <AnimatedPage>
            <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-md mt-10">
                <h2 className="text-3xl font-extrabold text-[#1976d2] uppercase text-center pb-4 mb-10">
                    💰 Gestión de Abonos
                </h2>

                <div className="mb-8">
                    <label className="block font-semibold mb-2" htmlFor="select-vivienda">Seleccionar Vivienda <span className="text-red-600">*</span></label>
                    <Select
                        id="select-vivienda"
                        options={viviendaOptions}
                        onChange={(option) => setSelectedViviendaId(option ? option.value : null)}
                        value={viviendaOptions.find(opt => opt.value === selectedViviendaId) || null}
                        placeholder="Buscar o seleccionar vivienda..."
                        isClearable
                        noOptionsMessage={() => "No hay viviendas con clientes asignados."}
                    />
                </div>

                {datosViviendaSeleccionada && (
                    <div className="animate-fade-in">
                        <ResumenAbonos resumen={datosViviendaSeleccionada.resumen} />
                        <FormularioAbono
                            vivienda={datosViviendaSeleccionada.vivienda}
                            resumen={datosViviendaSeleccionada.resumen}
                            onAbonoRegistrado={loadAllData}
                        />
                        <HistorialAbonos
                            titulo="Historial de Abonos de esta Vivienda"
                            abonos={datosViviendaSeleccionada.historial}
                            onEdit={setAbonoEditando}
                            onDelete={setAbonoAEliminar}
                        />
                    </div>
                )}
            </div>
            {/* ... justo antes de </AnimatedPage> ... */}
            {abonoAEliminar && (
                <ModalConfirmacion
                    isOpen={!!abonoAEliminar}
                    onClose={() => setAbonoAEliminar(null)}
                    onConfirm={confirmarEliminarAbono}
                    titulo="¿Eliminar Abono?"
                    mensaje={
                        <p>
                            ¿Estás seguro de que quieres eliminar este abono?
                            <br />
                            <strong className="text-red-500">Esta acción no se puede deshacer.</strong>
                        </p>
                    }
                />
            )}

            {abonoEditando && (
                <EditarAbonoModal
                    isOpen={!!abonoEditando}
                    onClose={() => setAbonoEditando(null)}
                    onSave={loadAllData} // Pasamos loadAllData para que la lista se refresque al guardar
                    abonoAEditar={abonoEditando}
                />
            )}

        </AnimatedPage>
    );
};

export default AbonosPage;