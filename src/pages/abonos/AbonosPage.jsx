import React, { useEffect, useState, useMemo, useCallback } from "react";
import Select from "react-select";
import { useToast } from "../../components/ToastContext";
import { useForm } from "../../hooks/useForm.jsx";
import AnimatedPage from "../../components/AnimatedPage";
import { getViviendas, getClientes, getAbonos, addAbono, deleteAbono } from "../../utils/storage";
import { NumericFormat } from "react-number-format";
import { validateAbono } from "./abonoValidation.js";
import EditarAbono from "./EditarAbono.jsx";
import { Trash, Pencil } from "lucide-react";

// Función de utilidad para formatear la fecha
const formatFriendlyDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
};

const AbonosPage = () => {
    const { showToast } = useToast();
    const [allViviendasData, setAllViviendasData] = useState([]);
    const [allAbonosData, setAllAbonosData] = useState([]);

    const [selectedViviendaId, setSelectedViviendaId] = useState(null);
    const [abonosVivienda, setAbonosVivienda] = useState([]);
    const [resumenPago, setResumenPago] = useState({
        valorTotal: 0,
        totalAbonado: 0,
        saldoPendiente: 0,
    });

    const [showRegisterAbonoSection, setShowRegisterAbonoSection] = useState(false);

    const [abonoEditando, setAbonoEditando] = useState(null);
    const [isEditAbonoModalOpen, setIsEditAbonoModalOpen] = useState(false);
    const [shouldRenderEditAbonoModal, setShouldRenderEditAbonoModal] = useState(false);

    const [abonoAEliminar, setAbonoAEliminar] = useState(null);
    const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);

    const inputFilters = {
        monto: { regex: /^[0-9]*$/ },
    };

    const initialAbonoState = useMemo(() => ({
        monto: "",
        metodoPago: "",
    }), []);

    const loadAllData = useCallback(() => {
        const viviendasFromStorage = getViviendas();
        const clientesFromStorage = getClientes();
        const abonosFromStorage = getAbonos();

        const viviendasConCliente = viviendasFromStorage.map(v => ({
            ...v,
            cliente: clientesFromStorage.find(c => c.id === v.clienteId) || null,
        }));
        setAllViviendasData(viviendasConCliente);
        setAllAbonosData(abonosFromStorage);
        return { viviendas: viviendasConCliente, abonos: abonosFromStorage };
    }, []);

    const updateDisplayedViviendaData = useCallback((viviendaIdToDisplay, currentAllViviendasData, currentAllAbonosData) => {
        const viviendaActual = currentAllViviendasData.find(v => v.id === viviendaIdToDisplay);
        if (viviendaActual) {
            const abonosParaEstaVivienda = currentAllAbonosData.filter(a => a.viviendaId === viviendaIdToDisplay);
            setAbonosVivienda(abonosParaEstaVivienda);

            const totalAbonado = abonosParaEstaVivienda.reduce((sum, abono) => sum + abono.monto, 0);
            const valorTotal = viviendaActual.valorTotal;
            const saldoPendiente = valorTotal - totalAbonado;

            setResumenPago({
                valorTotal,
                totalAbonado,
                saldoPendiente,
            });
        } else {
            setAbonosVivienda([]);
            setResumenPago({ valorTotal: 0, totalAbonado: 0, saldoPendiente: 0 });
        }
    }, []);

    const validateFormForAbono = useCallback((formDataToValidate) => {
        return validateAbono(formDataToValidate, selectedViviendaId, resumenPago, allViviendasData);
    }, [selectedViviendaId, resumenPago, allViviendasData]);

    const onSubmitAbonoLogic = useCallback(async (formDataSubmitted) => {
        if (!selectedViviendaId) {
            showToast("❌ Por favor, selecciona una vivienda antes de registrar un abono.", "error");
            return;
        }

        const viviendaSeleccionadaParaAbono = allViviendasData.find(v => v.id === selectedViviendaId);
        if (!viviendaSeleccionadaParaAbono || !viviendaSeleccionadaParaAbono.clienteId) {
            showToast("❌ La vivienda seleccionada no tiene un cliente asignado. No se puede registrar el abono.", "error");
            return;
        }

        const montoNumericoLimpio = parseInt(String(formDataSubmitted.monto).replace(/\./g, ''));

        const nuevoAbono = {
            id: Date.now(),
            viviendaId: selectedViviendaId,
            clienteId: viviendaSeleccionadaParaAbono.clienteId,
            fechaPago: new Date().toISOString().split('T')[0],
            monto: montoNumericoLimpio,
            metodoPago: formDataSubmitted.metodoPago,
        };

        addAbono(nuevoAbono);
        showToast("✅ Abono registrado exitosamente.", "success");

        const { viviendas, abonos } = loadAllData();
        updateDisplayedViviendaData(selectedViviendaId, viviendas, abonos);

        resetForm();
    }, [selectedViviendaId, allViviendasData, showToast, resetForm, loadAllData, updateDisplayedViviendaData]);

    // Usamos nuestro hook useForm, pasando las funciones de validación y submit
    const {
        formData,
        errors,
        enviando,
        handleInputChange,
        handleSubmit,
        resetForm,
        handleValueChange,
    } = useForm(initialAbonoState, validateFormForAbono, onSubmitAbonoLogic, { inputFilters });


    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    useEffect(() => {
        if (isEditAbonoModalOpen) {
            setShouldRenderEditAbonoModal(true);
        }
    }, [isEditAbonoModalOpen]);

    const viviendaOptions = useMemo(() => {
        return allViviendasData
            .filter(v => v.clienteId)
            .map(v => ({
                value: v.id,
                label: `Manzana ${v.manzana} - Casa ${v.numeroCasa} (${v.cliente ? v.cliente.nombre : 'No Asignada'})`,
            }));
    }, [allViviendasData]);

    const handleViviendaSelectChange = (selectedOption) => {
        const id = selectedOption ? selectedOption.value : null;
        setSelectedViviendaId(id);
        if (id) {
            updateDisplayedViviendaData(id, allViviendasData, allAbonosData);
        } else {
            setSelectedViviendaId(null);
            setAbonosVivienda([]);
            setResumenPago({ valorTotal: 0, totalAbonado: 0, saldoPendiente: 0 });
        }
    };

    const latestAbonos = useMemo(() => {
        return [...allAbonosData]
            .sort((a, b) => b.id - a.id)
            .slice(0, 10)
            .map(abono => {
                const viviendaInfo = allViviendasData.find(v => v.id === abono.viviendaId);
                const viviendaLabel = viviendaInfo ? `Manzana ${viviendaInfo.manzana} - Casa ${viviendaInfo.numeroCasa}` : 'Vivienda Desconocida';
                const clienteNombre = viviendaInfo?.cliente?.nombre || 'Cliente Desconocido';
                return {
                    ...abono,
                    viviendaLabel: viviendaLabel,
                    clienteNombre: clienteNombre
                };
            });
    }, [allAbonosData, allViviendasData]);

    const iniciarEdicionAbono = (abono) => {
        if (abono && abono.id) {
            setAbonoEditando(abono);
            setIsEditAbonoModalOpen(true);
        } else {
            console.error("Error: Abono inválido pasado a iniciarEdicionAbono.", abono);
            showToast("❌ No se pudo cargar el abono para editar. Faltan datos.", "error");
        }
    };

    const handleGuardarAbono = (datosActualizados) => {
        const { viviendas, abonos } = loadAllData();
        if (selectedViviendaId) {
            updateDisplayedViviendaData(selectedViviendaId, viviendas, abonos);
        }
        showToast("✅ Abono guardado correctamente.", "success");
    };

    const handleCloseEditAbonoModalRequest = () => {
        setIsEditAbonoModalOpen(false);
    };

    const handleEditAbonoModalAnimationFinished = () => {
        setShouldRenderEditAbonoModal(false);
        setAbonoEditando(null);
    };

    const iniciarEliminacionAbono = (abono) => {
        setAbonoAEliminar(abono);
        setMostrarConfirmacionEliminar(true);
    };

    const confirmarEliminarAbono = () => {
        if (abonoAEliminar && deleteAbono(abonoAEliminar.id)) {
            showToast("🗑️ Abono eliminado correctamente.", "success");
            const { viviendas, abonos } = loadAllData();
            if (selectedViviendaId) {
                updateDisplayedViviendaData(selectedViviendaId, viviendas, abonos);
            }
        } else {
            showToast("❌ Error al eliminar el abono.", "error");
        }
        setMostrarConfirmacionEliminar(false);
        setAbonoAEliminar(null);
    };

    return (
        <AnimatedPage>
            <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-md mt-10 animate-fade-in">
                <h2 className="text-3xl font-extrabold text-[#1976d2] uppercase text-center pb-4 mb-10">
                    <span className="inline-flex items-center gap-4">
                        <span role="img" aria-label="abono">💰</span> Gestión de Abonos
                    </span>
                </h2>

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

                {showRegisterAbonoSection && (
                    <div className="animate-fade-in transition-all duration-300 ease-out">
                        <hr className="my-8 border-gray-200" />
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Registrar Nuevo Abono</h3>
                        <p className="text-gray-600 mb-6">Selecciona una vivienda para registrar un nuevo abono.</p>

                        <div className="mb-8">
                            <label className="block font-semibold mb-2" htmlFor="select-vivienda">Seleccionar Vivienda <span className="text-red-600">*</span></label>
                            <Select
                                id="select-vivienda"
                                options={viviendaOptions}
                                onChange={handleViviendaSelectChange}
                                placeholder={viviendaOptions.length === 0 ? "No hay viviendas asignadas a clientes." : "Buscar o seleccionar vivienda..."}
                                isClearable
                                value={viviendaOptions.find(opt => opt.value === selectedViviendaId) || null}
                                noOptionsMessage={() => "No hay viviendas asignadas a clientes."}
                            />
                            {errors.viviendaId && <p className="text-red-600 text-sm mt-1">{errors.viviendaId}</p>}
                        </div>

                        {selectedViviendaId && ( // Solo muestra el resto si hay una vivienda seleccionada
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-center bg-gray-50 p-6 rounded-lg shadow-inner">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Valor Total Vivienda</p>
                                        <p className="text-lg font-bold text-gray-800">
                                            {resumenPago.valorTotal.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Abonado</p>
                                        <p className="text-lg font-bold text-green-700">
                                            {resumenPago.totalAbonado.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Saldo Pendiente</p>
                                        <p className="text-lg font-bold text-red-600">
                                            {resumenPago.saldoPendiente.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-blue-50 p-6 rounded-lg">
                                    <div>
                                        <label className="block font-semibold mb-1" htmlFor="monto">Monto del Abono <span className="text-red-600">*</span></label>
                                        <NumericFormat
                                            id="monto"
                                            name="monto"
                                            value={formData.monto}
                                            onValueChange={(values) => handleValueChange('monto', values.value)}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix="$ "
                                            allowNegative={false}
                                            decimalScale={0}
                                            className={`w-full border p-2 rounded-lg ${errors.monto ? "border-red-600" : "border-gray-300"}`}
                                        />
                                        {errors.monto && <p className="text-red-600 text-sm mt-1">{errors.monto}</p>}
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1" htmlFor="metodoPago">Método de Pago <span className="text-red-600">*</span></label>
                                        <select
                                            id="metodoPago"
                                            name="metodoPago"
                                            value={formData.metodoPago}
                                            onChange={handleInputChange}
                                            className={`w-full border p-2 rounded-lg ${errors.metodoPago ? "border-red-600" : "border-gray-300"}`}
                                        >
                                            <option value="">Selecciona un método</option>
                                            <option value="Consignación Bancaria">Consignación Bancaria</option>
                                            <option value="Crédito Hipotecario">Crédito Hipotecario</option>
                                            <option value="Subsidio de vivienda / Caja de compensación">Subsidio de vivienda / Caja de compensación</option>
                                            <option value="Cesantias">Cesantías</option>
                                            <option value="CDT">CDT</option>
                                            <option value="Efectivo">Efectivo</option>
                                        </select>
                                        {errors.metodoPago && <p className="text-red-600 text-sm mt-1">{errors.metodoPago}</p>}
                                    </div>
                                    <div className="md:col-span-2 flex justify-end">
                                        <button type="submit" disabled={enviando} className={`px-5 py-2.5 rounded-full transition text-white ${enviando ? "bg-gray-400 cursor-not-allowed" : "bg-[#1976d2] hover:bg-blue-700"}`}>
                                            {enviando ? "Registrando..." : "Registrar Abono"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                )}

                <hr className="my-10 border-gray-200" />

                <h3 className="text-xl font-bold mb-4 text-gray-800">Últimos Abonos Realizados</h3>
                {latestAbonos.length === 0 ? (
                    <p className="text-center text-gray-600 mt-4">No hay abonos registrados en el sistema.</p>
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
                                    <th className="px-4 py-2 rounded-tr-lg text-center">Acciones</th>
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
                                        <td className="px-4 py-2 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => iniciarEdicionAbono(abono)}
                                                className="inline-flex items-center gap-2
                                                           bg-yellow-500 text-white
                                                           hover:bg-yellow-600 hover:shadow-md
                                                           px-3 py-1.5
                                                           text-xs font-semibold
                                                           rounded-full transition-all duration-200"
                                            >
                                                <Pencil size={14} />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => iniciarEliminacionAbono(abono)}
                                                className="inline-flex items-center gap-2
                                                           bg-red-600 text-white
                                                           hover:bg-red-700 hover:shadow-md
                                                           px-3 py-1.5
                                                           text-xs font-semibold
                                                           rounded-full transition-all duration-200
                                                           ml-1"
                                            >
                                                <Trash size={14} />
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedViviendaId && !showRegisterAbonoSection && (
                    <>
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Historial de Abonos de esta Vivienda</h3>
                        {abonosVivienda.length === 0 ? (
                            <p className="text-center text-gray-600 mt-4">No hay abonos registrados para esta vivienda.</p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg shadow-lg">
                                <table className="min-w-full table-auto border-collapse text-center">
                                    <thead className="bg-slate-700 text-white">
                                        <tr className="uppercase tracking-wide text-xs font-semibold">
                                            <th className="px-4 py-2 rounded-tl-lg text-center">Fecha</th>
                                            <th className="px-4 py-2 text-center">Monto</th>
                                            <th className="px-4 py-2 text-center">Método de Pago</th>
                                            <th className="px-4 py-2 text-center">Cliente</th>
                                            <th className="px-4 py-2 rounded-tr-lg text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {abonosVivienda.map((abono, index) => (
                                            <tr key={abono.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                <td className="px-4 py-2 text-neutral-800 text-sm text-center">{formatFriendlyDate(abono.fechaPago)}</td>
                                                <td className="px-4 py-2 text-neutral-800 text-sm font-semibold text-center">
                                                    {abono.monto.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}
                                                </td>
                                                <td className="px-4 py-2 text-neutral-800 text-sm text-center">{abono.metodoPago}</td>
                                                <td className="px-4 py-2 text-neutral-800 text-sm text-center">{abono.viviendaLabel}</td>
                                                <td className="px-4 py-2 text-neutral-800 text-sm text-center">{abono.clienteNombre}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() => iniciarEdicionAbono(abono)}
                                                        className="inline-flex items-center gap-2
                                                                   bg-yellow-500 text-white
                                                                   hover:bg-yellow-600 hover:shadow-md
                                                                   px-3 py-1.5
                                                                   text-xs font-semibold
                                                                   rounded-full transition-all duration-200"
                                                    >
                                                        <Pencil size={14} />
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => iniciarEliminacionAbono(abono)}
                                                        className="inline-flex items-center gap-2
                                                                   bg-red-600 text-white
                                                                   hover:bg-red-700 hover:shadow-md
                                                                   px-3 py-1.5
                                                                   text-xs font-semibold
                                                                   rounded-full transition-all duration-200
                                                                   ml-1"
                                                    >
                                                        <Trash size={14} />
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

            {shouldRenderEditAbonoModal && abonoEditando && (
                <EditarAbono
                    isOpen={isEditAbonoModalOpen}
                    onClose={handleCloseEditAbonoModalRequest}
                    onCierreFinalizado={handleEditAbonoModalAnimationFinished}
                    onGuardar={handleGuardarAbono}
                    abonoAEditar={abonoEditando}
                />
            )}

            {mostrarConfirmacionEliminar && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white p-7 rounded-2xl shadow-2xl max-w-sm w-full">
                        <h3 className="text-xl font-bold text-center mb-2 text-red-600 font-montserrat">¿Eliminar Abono?</h3>
                        <p className="text-center mb-6 text-gray-700">
                            Estás a punto de eliminar el abono de <strong>
                                {abonoAEliminar?.monto.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}
                            </strong>
                            {' '}para la vivienda <strong>
                                {allViviendasData.find(v => v.id === abonoAEliminar?.viviendaId)?.manzana} - Casa {allViviendasData.find(v => v.id === abonoAEliminar?.viviendaId)?.numeroCasa}
                            </strong>
                            . Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setMostrarConfirmacionEliminar(false);
                                    setAbonoAEliminar(null);
                                }}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-5 py-2 rounded-full transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarEliminarAbono}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-full shadow transition"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AnimatedPage>
    );
};

export default AbonosPage;