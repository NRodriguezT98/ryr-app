import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Select from "react-select";
import { useToast } from "../../components/ToastContext";
import { useForm } from "../../hooks/useForm.jsx";
import { getClientes, saveClientes, getViviendas, saveViviendas } from "../../utils/storage";
import { validateCliente } from "./clienteValidation.js";
import isEqual from 'lodash.isequal';

const inputFilters = {
    nombre: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/ },
    cedula: { regex: /^[0-9]*$/ },
    telefono: { regex: /^[0-9]*$/ },
};

const ANIMATION_DURATION_MS = 250;

const EditarCliente = ({ isOpen, onClose, onCierreFinalizado, onGuardar, clienteAEditar }) => {
    const { showToast } = useToast();

    const [showingModalPrincipal, setShowingModalPrincipal] = useState(false);
    const [isTransitioningPrincipal, setIsTransitioningPrincipal] = useState(false);
    const mainModalRef = useRef(null);

    const [showingConfirmacionConCambios, setShowingConfirmacionConCambios] = useState(false);
    const [showingConfirmacionSinCambios, setShowingConfirmacionSinCambios] = useState(false);
    const [isTransitioningConfirmacion, setIsTransitioningConfirmacion] = useState(false);
    const confirmModalRef = useRef(null);

    const [cambiosDetectados, setCambiosDetectados] = useState([]);
    const [viviendasDisponibles, setViviendasDisponibles] = useState([]);

    useEffect(() => {
        if (!clienteAEditar) return;
        const viviendas = getViviendas();
        const disponibles = viviendas.filter(
            (v) => v.clienteId === null || v.id === clienteAEditar?.viviendaId
        );
        setViviendasDisponibles(disponibles);
    }, [clienteAEditar]);

    const selectOptions = useMemo(() => {
        return viviendasDisponibles.map((v) => ({
            value: v.id,
            label: `Manzana ${v.manzana} - Casa ${v.numeroCasa}`,
        }));
    }, [viviendasDisponibles]);


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
        if (clienteAEditar) {
            return {
                id: clienteAEditar.id,
                nombre: clienteAEditar.nombre || "",
                cedula: clienteAEditar.cedula || "",
                telefono: clienteAEditar.telefono || "",
                correo: clienteAEditar.correo || "",
                direccion: clienteAEditar.direccion || "",
                viviendaId: clienteAEditar.vivienda?.id || "",
            };
        }
        return {
            id: null, nombre: "", cedula: "", telefono: "", correo: "", direccion: "", viviendaId: "",
        };
    }, [clienteAEditar]);

    const onSubmitLogic = useCallback((formData) => {
        const originalData = { ...initialFormDataForEdit };
        delete originalData.id;
        const currentData = { ...formData };
        delete currentData.id;

        const hasChanges = !isEqual(currentData, originalData);

        if (!hasChanges) {
            setShowingConfirmacionSinCambios(true);
        } else {
            const cambios = obtenerCambios(formData);
            setCambiosDetectados(cambios);
            setShowingConfirmacionConCambios(true);
        }
    }, [clienteAEditar, initialFormDataForEdit]);

    // La función validateCliente se pasa con isEditing = true.
    const validateFormForEdit = (formData) => validateCliente(formData, true); // Removido useCallback

    const {
        formData,
        errors,
        enviando,
        handleInputChange,
        handleSubmit,
        setFormData,
    } = useForm(initialFormDataForEdit, validateFormForEdit, onSubmitLogic, { inputFilters });


    const handleSelectChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            viviendaId: selectedOption ? selectedOption.value : ""
        }));
    };

    const obtenerCambios = (formDataActual) => {
        if (!clienteAEditar) return [];
        const cambiosDetectadosArr = [];
        const original = initialFormDataForEdit;

        const camposComparables = [
            { key: "nombre", label: "Nombre" },
            { key: "cedula", label: "Cédula" },
            { key: "telefono", label: "Teléfono" },
            { key: "correo", label: "Correo" },
            { key: "direccion", label: "Dirección" },
            { key: "viviendaId", label: "Vivienda Asignada", esVivienda: true },
        ];

        camposComparables.forEach(campo => {
            let valorAnterior = original[campo.key];
            let valorActual = formDataActual[campo.key];

            if (campo.key === "viviendaId") {
                const oldViviendaLabel = selectOptions.find(opt => opt.value === valorAnterior)?.label || 'Ninguna';
                const newViviendaLabel = selectOptions.find(opt => opt.value === valorActual)?.label || 'Ninguna';

                if (oldViviendaLabel !== newViviendaLabel) {
                    cambiosDetectadosArr.push({
                        campo: campo.label,
                        anterior: oldViviendaLabel,
                        actual: newViviendaLabel,
                    });
                }
            } else if (String(valorAnterior) !== String(valorActual)) {
                cambiosDetectadosArr.push({
                    campo: campo.label,
                    anterior: valorAnterior || <i>Vacío</i>,
                    actual: valorActual || <i>Vacío</i>,
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
            const updatedCliente = { ...formData, id: clienteAEditar.id };

            let clientes = getClientes();
            const clienteIndex = clientes.findIndex((c) => c.id === updatedCliente.id);

            if (clienteIndex > -1) {
                const oldClienteData = clientes[clienteIndex];

                if (oldClienteData.viviendaId && oldClienteData.viviendaId !== updatedCliente.viviendaId) {
                    let viviendas = getViviendas();
                    const oldVivienda = viviendas.find(v => v.id === oldClienteData.viviendaId);
                    if (oldVivienda) {
                        oldVivienda.clienteId = null;
                        saveViviendas(viviendas);
                    }
                }

                clientes[clienteIndex] = updatedCliente;
                saveClientes(clientes);

                if (updatedCliente.viviendaId) {
                    let viviendas = getViviendas();
                    const newVivienda = viviendas.find(v => v.id === updatedCliente.viviendaId);
                    if (newVivienda) {
                        const clienteConViviendaAsignada = clientes.find(c => c.viviendaId === newVivienda.id);
                        if (clienteConViviendaAsignada && clienteConViviendaAsignada.id !== updatedCliente.id) {
                            clienteConViviendaAsignada.viviendaId = null;
                        }
                        newVivienda.clienteId = updatedCliente.id;
                        saveViviendas(viviendas);
                    }
                }

                showToast("✅ Cliente actualizado exitosamente.", "success");
                if (onGuardar) onGuardar(updatedCliente);
            } else {
                showToast("❌ Error: Cliente no encontrado para actualizar.", "error");
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
    if (!clienteAEditar) {
        return (
            <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50`}>
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">Cargando cliente...</div>
            </div>
        );
    }

    return (
        <>
            <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-[${ANIMATION_DURATION_MS}ms] ${showingModalPrincipal ? "opacity-100" : "opacity-0"}`} ref={mainModalRef}>
                <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 mx-4 transition-all ease-in-out duration-[${ANIMATION_DURATION_MS}ms] ${showingModalPrincipal ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                    <h2 className="text-3xl font-bold text-[#1976d2] text-center mb-8">
                        ✏️ Editar Cliente
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6" noValidate>
                        <div>
                            <label className="block font-semibold mb-1" htmlFor="nombre">Nombre <span className="text-red-600">*</span></label>
                            <input id="nombre" name="nombre" type="text" value={formData.nombre} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.nombre ? "border-red-600" : "border-gray-300"}`} />
                            {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1" htmlFor="cedula">Cédula <span className="text-red-600">*</span></label>
                            <input id="cedula" name="cedula" type="text" value={formData.cedula} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.cedula ? "border-red-600" : "border-gray-300"}`} />
                            {errors.cedula && <p className="text-red-600 text-sm mt-1">{errors.cedula}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1" htmlFor="telefono">Teléfono <span className="text-red-600">*</span></label>
                            <input id="telefono" name="telefono" type="text" value={formData.telefono} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.telefono ? "border-red-600" : "border-gray-300"}`} />
                            {errors.telefono && <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1" htmlFor="correo">Correo <span className="text-red-600">*</span></label>
                            <input id="correo" name="correo" type="email" value={formData.correo} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.correo ? "border-red-600" : "border-gray-300"}`} />
                            {errors.correo && <p className="text-red-600 text-sm mt-1">{errors.correo}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block font-semibold mb-1" htmlFor="direccion">Dirección <span className="text-red-600">*</span></label>
                            <input id="direccion" name="direccion" type="text" value={formData.direccion} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.direccion ? "border-red-600" : "border-gray-300"}`} />
                            {errors.direccion && <p className="text-red-600 text-sm mt-1">{errors.direccion}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block font-semibold mb-1">Vivienda a asignar <span className="text-red-600">*</span></label>
                            <Select
                                options={selectOptions}
                                onChange={handleSelectChange}
                                placeholder="Buscar vivienda disponible..."
                                isClearable
                                value={selectOptions.find(op => op.value === formData.viviendaId) || null}
                            />
                            {errors.viviendaId && <p className="text-red-600 text-sm mt-1">{errors.viviendaId}</p>}
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button type="button" onClick={cerrarAnimadoPrincipal} className="px-5 py-2.5 rounded-full transition text-gray-700 bg-gray-200 hover:bg-gray-300">Cancelar</button>
                            <button type="submit" disabled={enviando} className={`px-5 py-2.5 rounded-full transition text-white ${enviando ? "bg-gray-400 cursor-not-allowed" : "bg-[#1976d2] hover:bg-blue-700"}`}>
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
                                            <span className="text-red-600 bg-red-100 px-2 py-1 rounded">{c.anterior || <i>Vacío</i>}</span>
                                            <span className="font-bold">&rarr;</span>{" "}
                                            <span className="text-green-600">{c.actual || <i>Vacío</i>}</span>
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

export default EditarCliente;