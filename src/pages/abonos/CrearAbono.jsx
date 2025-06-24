import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { NumericFormat } from "react-number-format";
import AnimatedPage from "../../components/AnimatedPage";
import toast from "react-hot-toast";
import { useForm } from "../../hooks/useForm.jsx";
import { getViviendas, getClientes, getAbonos, addAbono } from "../../utils/storage";
import { validateAbono } from "./abonoValidation.js";
import ResumenAbonos from "./ResumenAbonos.jsx";
import TablaAbonos from "./TablaAbonos.jsx";

const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const INITIAL_ABONO_STATE = {
    monto: "",
    metodoPago: "",
    fechaPago: getTodayString(),
};

const CrearAbono = () => {
    const navigate = useNavigate();
    const [isSuccess, setIsSuccess] = useState(false);

    const [viviendas, setViviendas] = useState([]);
    const [abonos, setAbonos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [selectedViviendaId, setSelectedViviendaId] = useState(null);

    const cargarDatos = useCallback(() => {
        const viviendasData = getViviendas();
        const clientesData = getClientes();
        const abonosData = getAbonos();
        const viviendasConCliente = viviendasData.map(v => ({ ...v, cliente: clientesData.find(c => c.id === v.clienteId) }));
        setViviendas(viviendasConCliente);
        setAbonos(abonosData);
        setClientes(clientesData);
    }, []);

    useEffect(() => { cargarDatos(); }, [cargarDatos]);

    const datosViviendaSeleccionada = useMemo(() => {
        if (!selectedViviendaId) return null;
        const viviendaActual = viviendas.find(v => v.id === selectedViviendaId);
        if (!viviendaActual) return null;

        const historial = abonos.filter(a => a.viviendaId === selectedViviendaId).map(abono => {
            const cliente = clientes.find(c => c.id === abono.clienteId);
            const vivienda = viviendas.find(v => v.id === abono.viviendaId);
            return { ...abono, clienteNombre: cliente?.nombre || 'Desconocido', viviendaLabel: vivienda ? `Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}` : 'Desconocida' };
        }).sort((a, b) => b.id - a.id);

        const totalAbonado = historial.reduce((sum, abono) => sum + (abono.monto || 0), 0);

        return {
            historial,
            resumen: {
                valorTotal: viviendaActual.valorTotal || 0,
                totalAbonado: totalAbonado,
                saldoPendiente: (viviendaActual.valorTotal || 0) - totalAbonado,
            }
        };
    }, [selectedViviendaId, abonos, viviendas, clientes]);

    const onSubmitLogic = useCallback((formData) => {
        const montoNumerico = parseInt(String(formData.monto).replace(/\D/g, ''));
        const viviendaSeleccionada = viviendas.find(v => v.id === selectedViviendaId);
        const nuevoAbono = { id: Date.now(), viviendaId: selectedViviendaId, clienteId: viviendaSeleccionada?.clienteId, fechaPago: formData.fechaPago, monto: montoNumerico, metodoPago: formData.metodoPago };
        addAbono(nuevoAbono);
        setIsSuccess(true);
    }, [viviendas, selectedViviendaId]);

    const { formData, errors, handleInputChange, handleValueChange, handleSubmit, isSubmitting } = useForm({
        initialState: INITIAL_ABONO_STATE,
        validate: (data) => validateAbono(data, datosViviendaSeleccionada?.resumen),
        onSubmit: onSubmitLogic,
        options: { resetOnSuccess: false }
    });

    useEffect(() => {
        if (isSuccess) {
            toast.success("Abono registrado exitosamente.");
            const timer = setTimeout(() => {
                setIsSuccess(false);
                cargarDatos();
                // Limpiamos la selección para que el formulario se resetee visualmente
                setSelectedViviendaId(null);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, cargarDatos]);

    const viviendaOptions = useMemo(() => viviendas.filter(v => v.clienteId).map(v => ({ value: v.id, label: `Mz ${v.manzana} - Casa ${v.numeroCasa} (${v.cliente?.nombre || 'N/A'})` })), [viviendas]);

    return (
        <AnimatedPage>
            <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                {isSuccess ? (
                    <div className="text-center py-10 animate-fade-in">
                        <div className="text-green-500 w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mt-6">¡Abono Registrado!</h2>
                        <p className="text-gray-500 mt-2">El historial ha sido actualizado.</p>
                    </div>
                ) : (
                    <>
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-[#1976d2] mb-2">Registrar Nuevo Abono</h2>
                            <p className="text-gray-500 mb-8">Selecciona una vivienda para ver su estado y añadir un pago.</p>
                        </div>

                        <div className="mb-8">
                            <label className="block font-semibold mb-2 text-gray-700">Seleccionar Vivienda</label>
                            <Select
                                options={viviendaOptions}
                                onChange={(option) => setSelectedViviendaId(option ? option.value : null)}
                                placeholder="Buscar vivienda por manzana, casa o cliente..."
                                noOptionsMessage={() => "No hay viviendas con cliente asignado."}
                                isClearable
                                value={viviendaOptions.find(op => op.value === selectedViviendaId) || null}
                            />
                        </div>

                        {selectedViviendaId && datosViviendaSeleccionada && (
                            <div className="animate-fade-in space-y-8">
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-xl font-bold mb-4 text-gray-800">Resumen Financiero</h3>
                                    <ResumenAbonos resumen={datosViviendaSeleccionada.resumen} />
                                </div>

                                <div className="pt-6 border-t">
                                    <h3 className="text-xl font-bold mb-4 text-gray-800">Registrar Pago</h3>
                                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block font-semibold mb-1" htmlFor="fechaPago">Fecha del Abono <span className="text-red-600">*</span></label>
                                            <input
                                                type="date"
                                                id="fechaPago"
                                                name="fechaPago"
                                                value={formData.fechaPago}
                                                onChange={handleInputChange}
                                                max={getTodayString()} /* <-- ¡LA LÍNEA MÁGICA! */
                                                className={`w-full border p-2 rounded-lg ${errors.fechaPago ? "border-red-600" : "border-gray-300"}`}
                                            />
                                            {errors.fechaPago && <p className="text-red-600 text-sm mt-1">{errors.fechaPago}</p>}
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-1" htmlFor="monto">Monto del Abono <span className="text-red-600">*</span></label>
                                            <NumericFormat name="monto" value={formData.monto} onValueChange={(values) => handleValueChange('monto', values.value)} className={`w-full border p-2 rounded-lg ${errors.monto ? "border-red-600" : "border-gray-300"}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                                            {errors.monto && <p className="text-red-600 text-sm mt-1">{errors.monto}</p>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block font-semibold mb-1">Método de Pago <span className="text-red-600">*</span></label>
                                            <select name="metodoPago" value={formData.metodoPago} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.metodoPago ? "border-red-600" : "border-gray-300"}`}>
                                                <option value="">Selecciona un método</option>
                                                <option value="Consignación Bancaria">Consignación Bancaria</option>
                                                <option value="Crédito Hipotecario">Crédito Hipotecario</option>
                                                <option value="Efectivo">Efectivo</option>
                                            </select>
                                            {errors.metodoPago && <p className="text-red-600 text-sm mt-1">{errors.metodoPago}</p>}
                                        </div>
                                        <div className="md:col-span-2 flex justify-end">
                                            <button type="submit" disabled={isSubmitting || !selectedViviendaId} className="px-5 py-2.5 rounded-full transition text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400">
                                                {isSubmitting ? "Registrando..." : "Registrar Abono"}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                <div className="pt-6 border-t">
                                    <h3 className="text-xl font-bold mb-4 text-gray-800">Historial de Abonos de esta Vivienda</h3>
                                    {datosViviendaSeleccionada.historial.length > 0 ? (
                                        <TablaAbonos abonos={datosViviendaSeleccionada.historial} />
                                    ) : (
                                        <p className="text-center text-gray-500 py-4">Esta vivienda aún no tiene abonos registrados.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AnimatedPage>
    );
};

export default CrearAbono;