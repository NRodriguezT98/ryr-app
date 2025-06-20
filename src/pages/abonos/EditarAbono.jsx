import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Select from "react-select";
import { useToast } from "../../components/ToastContext";
import { useForm } from "../../hooks/useForm.jsx";
import { getAbonos, updateAbono, getViviendas, getClientes } from "../../utils/storage";
import { NumericFormat } from "react-number-format";
import isEqual from 'lodash.isequal'; // Importar isEqual

// Función de utilidad: formatFriendlyDate (DEFINIDA AQUÍ)
const formatFriendlyDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
};

const ANIMATION_DURATION_MS = 250;

const METODOS_PAGO = [
    { value: "Consignación Bancaria", label: "Consignación Bancaria" },
    { value: "Crédito Hipotecario", label: "Crédito Hipotecario" },
    { value: "Subsidio de vivienda / Caja de compensación", label: "Subsidio de vivienda / Caja de compensación" },
    { value: "Cesantias", label: "Cesantías" },
    { value: "CDT", label: "CDT" },
    { value: "Efectivo", label: "Efectivo" },
];

const EditarAbono = ({ isOpen, onClose, onCierreFinalizado, onGuardar, abonoAEditar }) => {
    const { showToast } = useToast();

    const [showingModalPrincipal, setShowingModalPrincipal] = useState(false);
    const [isTransitioningPrincipal, setIsTransitioningPrincipal] = useState(false);
    const mainModalRef = useRef(null);

    const [showingConfirmacionConCambios, setShowingConfirmacionConCambios] = useState(false);
    const [showingConfirmacionSinCambios, setShowingConfirmacionSinCambios] = useState(false);
    const [isTransitioningConfirmacion, setIsTransitioningConfirmacion] = useState(false);
    const confirmModalRef = useRef(null);

    const [cambiosDetectados, setCambiosDetectados] = useState([]);
    const [allViviendasData, setAllViviendasData] = useState([]);

    useEffect(() => {
        const viviendasFromStorage = getViviendas();
        const clientesFromStorage = getClientes();
        const viviendasConCliente = viviendasFromStorage.map(v => ({
            ...v,
            cliente: clientesFromStorage.find(c => c.id === v.clienteId) || null,
        }));
        setAllViviendasData(viviendasConCliente);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setIsTransitioningPrincipal(true);
            setShowingModalPrincipal(true);
        } else {
            setIsTransitioningPrincipal(true);
            setShowingModalPrincipal(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const node = mainModalRef.current;
        if (node) {
            const handleTransitionEnd = () => {
                if (!showingModalPrincipal) {
                    setIsTransitioningPrincipal(false);
                    if (onCierreFinalizado) onCierreFinalizado();
                }
            };
            node.addEventListener('transitionend', handleTransitionEnd);
            return () => {
                node.removeEventListener('transitionend', handleTransitionEnd);
            };
        }
    }, [showingModalPrincipal, onCierreFinalizado]);

    useEffect(() => {
        const node = confirmModalRef.current;
        if (node) {
            const handleTransitionEnd = () => {
                if (!showingConfirmacionConCambios && !showingConfirmacionSinCambios) {
                    setIsTransitioningConfirmacion(false);
                }
            };
            node.addEventListener('transitionend', handleTransitionEnd);
            return () => {
                node.removeEventListener('transitionend', handleTransitionEnd);
            };
        }
    }, [showingConfirmacionConCambios, showingConfirmacionSinCambios]);

    const initialFormDataForEdit = useMemo(() => {
        if (abonoAEditar) {
            return {
                id: abonoAEditar.id,
                monto: abonoAEditar.monto?.toString() || "",
                metodoPago: abonoAEditar.metodoPago || "",
                viviendaId: abonoAEditar.viviendaId,
                clienteId: abonoAEditar.clienteId,
                fechaPago: abonoAEditar.fechaPago || new Date().toISOString().split('T')[0],
            };
        }
        return {
            id: null, monto: "", metodoPago: "", viviendaId: null, clienteId: null, fechaPago: "",
        };
    }, [abonoAEditar]);

    const validateEditAbono = useCallback((formDataToValidate) => {
        const errors = {};
        const montoNumerico = parseFloat(String(formDataToValidate.monto).replace(/\./g, '').replace(',', '.'));

        if (isNaN(montoNumerico) || montoNumerico <= 0) {
            errors.monto = "El monto debe ser un número positivo.";
        }

        if (!formDataToValidate.metodoPago) {
            errors.metodoPago = "Debes seleccionar un método de pago.";
        }
        return errors;
    }, []);

    const onSubmitEditLogic = useCallback((formData) => {
        const originalData = {
            monto: abonoAEditar.monto?.toString() || "",
            metodoPago: abonoAEditar.metodoPago || "",
        };
        const currentData = {
            monto: String(formData.monto).replace(/\./g, ''),
            metodoPago: formData.metodoPago,
        };

        const hasChanges = !isEqual(currentData, originalData);

        if (!hasChanges) {
            setShowingConfirmacionSinCambios(true);
        } else {
            const cambios = obtenerCambios(formData);
            setCambiosDetectados(cambios);
            setShowingConfirmacionConCambios(true);
        }
    }, [abonoAEditar, showToast]);

    const {
        formData, errors, enviando, handleInputChange, handleSubmit, handleValueChange,
    } = useForm(initialFormDataForEdit, validateEditAbono, onSubmitEditLogic);

    const obtenerCambios = (formDataActual) => {
        if (!abonoAEditar) return [];
        const cambiosDetectadosArr = [];
        const original = initialFormDataForEdit;

        const camposComparables = [
            { key: "monto", label: "Monto", esMoneda: true },
            { key: "metodoPago", label: "Método de Pago" },
        ];

        camposComparables.forEach(campo => {
            let valorAnterior = original[campo.key];
            let valorActual = formDataActual[campo.key];

            if (campo.key === "monto") {
                valorAnterior = String(valorAnterior).replace(/\./g, '');
                valorActual = String(valorActual).replace(/\./g, '');
            }

            if (String(valorAnterior) !== String(valorActual)) {
                cambiosDetectadosArr.push({
                    campo: campo.label,
                    anterior: campo.esMoneda ? Number(original[campo.key]).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }) : original[campo.key] || 'Vacío',
                    actual: campo.esMoneda ? Number(formDataActual[campo.key]).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }) : formDataActual[campo.key] || 'Vacío',
                });
            }
        });

        return cambiosDetectadosArr;
    };

    const confirmarGuardar = async () => {
        setIsTransitioningConfirmacion(true);
        setShowingConfirmacionConCambios(false);
        setShowingConfirmacionSinCambios(false);

        setTimeout(() => {
            const montoNumericoLimpio = parseInt(String(formData.monto).replace(/\./g, '').replace(',', ''));

            const updatedAbono = {
                ...abonoAEditar,
                monto: montoNumericoLimpio,
                metodoPago: formData.metodoPago,
            };

            const success = updateAbono(updatedAbono);
            if (success) {
                showToast("✅ Abono actualizado exitosamente.", "success");
            } else {
                showToast("❌ Error al actualizar el abono.", "error");
            }

            setIsTransitioningPrincipal(true);
            setShowingModalPrincipal(false);
        }, ANIMATION_DURATION_MS);
    };

    const cerrarAnimadoPrincipal = () => {
        if (onClose) onClose();
    };

    const handleCerrarConfirmacion = () => {
        setIsTransitioningConfirmacion(true);
        setShowingConfirmacionConCambios(false);
        setShowingConfirmacionSinCambios(false);
    };

    if (!isOpen && !isTransitioningPrincipal) {
        return null;
    }
    if (!abonoAEditar) {
        return (
            <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50`}>
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">Cargando abono...</div>
            </div>
        );
    }

    const currentVivienda = allViviendasData.find(v => v.id === abonoAEditar.viviendaId);
    const viviendaLabel = currentVivienda ? `Manzana ${currentVivienda.manzana} - Casa ${currentVivienda.numeroCasa}` : 'Vivienda Desconocida';
    const clienteNombre = currentVivienda?.cliente?.nombre || 'Cliente Desconocido';

    return (
        <>
            <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-[${ANIMATION_DURATION_MS}ms] ${showingModalPrincipal ? "opacity-100" : "opacity-0"}`} ref={mainModalRef}>
                <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 mx-4 transition-all ease-in-out duration-[${ANIMATION_DURATION_MS}ms] ${showingModalPrincipal ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                    <h2 className="text-3xl font-bold text-[#1976d2] text-center mb-8">
                        ✏️ Editar Abono
                    </h2>
                    <div className="mb-6 text-center text-gray-700">
                        <p><strong>Vivienda:</strong> {viviendaLabel}</p>
                        <p><strong>Cliente:</strong> {clienteNombre}</p>
                        <p><strong>Fecha de Abono:</strong> {formatFriendlyDate(abonoAEditar.fechaPago)}</p>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6" noValidate>
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
                                {METODOS_PAGO.map(metodo => (
                                    <option key={metodo.value} value={metodo.value}>{metodo.label}</option>
                                ))}
                            </select>
                            {errors.metodoPago && <p className="text-red-600 text-sm mt-1">{errors.metodoPago}</p>}
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={cerrarAnimadoPrincipal}
                                className="px-5 py-2.5 rounded-full transition text-gray-700 bg-gray-200 hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={enviando}
                                className={`px-5 py-2.5 rounded-full transition text-white ${enviando ? "bg-gray-400 cursor-not-allowed" : "bg-[#1976d2] hover:bg-blue-700"}`}
                            >
                                {enviando ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* MODAL DE CONFIRMACIÓN CON CAMBIOS */}
            {(showingConfirmacionConCambios || isTransitioningConfirmacion) && (
                <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[60] transition-opacity duration-[${ANIMATION_DURATION_MS}ms] ${showingConfirmacionConCambios ? "opacity-100" : "opacity-0"}`} ref={confirmModalRef}>
                    <div className={`bg-white p-7 rounded-2xl shadow-2xl max-w-md w-full transition-all ease-in-out duration-[${ANIMATION_DURATION_MS}ms] ${showingConfirmacionConCambios ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                        <h3 className="text-xl font-bold text-center mb-4 text-gray-800">Confirmar Cambios</h3>
                        <p className="text-center mb-5 text-gray-600">¿Deseas guardar los siguientes cambios?</p>
                        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm max-h-48 overflow-y-auto">
                            <ul>
                                {cambiosDetectados.map(c => (
                                    <li key={c.campo} className="mb-2">
                                        <strong className="font-medium text-gray-700">{c.campo}:</strong>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-red-600 bg-red-100 px-2 py-1 rounded">{c.anterior || 'Vacío'}</span>
                                            <span className="font-bold text-gray-500 mx-2">→</span>
                                            <span className="text-green-700 bg-green-100 px-2 py-1 rounded">{c.actual || 'Vacío'}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button onClick={handleCerrarConfirmacion} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-5 py-2 rounded-full transition">Cancelar</button>
                            <button onClick={confirmarGuardar} disabled={enviando} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-full shadow transition">{enviando ? "Guardando..." : "Guardar"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMACIÓN SIN CAMBIOS */}
            {(showingConfirmacionSinCambios || isTransitioningConfirmacion) && (
                <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[60] transition-opacity duration-[${ANIMATION_DURATION_MS}ms] ${showingConfirmacionSinCambios ? "opacity-100" : "opacity-0"}`} ref={confirmModalRef}>
                    <div className={`bg-white p-7 rounded-2xl shadow-2xl max-w-sm w-full transition-all ease-in-out duration-[${ANIMATION_DURATION_MS}ms] ${showingConfirmacionSinCambios ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                        <h3 className="text-xl font-bold text-center mb-4 text-gray-800">Sin Cambios Detectados</h3>
                        <p className="text-center mb-6 text-gray-600">No has realizado ningún cambio. ¿Deseas guardar de todos modos?</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={handleCerrarConfirmacion} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-5 py-2 rounded-full transition">Cancelar</button>
                            <button onClick={confirmarGuardar} disabled={enviando} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-full shadow transition">{enviando ? "Guardando..." : "Sí, guardar"}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EditarAbono;