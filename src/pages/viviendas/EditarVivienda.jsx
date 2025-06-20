import { useState, useEffect, useMemo, useRef } from "react";
import { NumericFormat } from "react-number-format";
import { useForm } from "../../hooks/useForm.jsx";
import { createViviendaValidator } from "./viviendaValidation.js";
import { useToast } from "../../components/ToastContext";

const inputFilters = {
    numero: { regex: /^[0-9]*$/ },
    matricula: { regex: /^[0-9-]*$/ },
    nomenclatura: { regex: /^[a-zA-Z0-9\s#-]*$/ }
};

const formatCOP = (valor) => {
    if (!valor || isNaN(valor)) return "$ 0";
    return Number(valor).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });
};

// Duración de las animaciones (en ms), consistente con EditarCliente
const ANIMATION_DURATION_MS = 250;

// Este es el componente que contendrá la lógica del formulario y sus modales internas
const EditarViviendaContent = ({ isOpen, onClose, onGuardar, vivienda, onAnimationFinished }) => {
    const { showToast } = useToast();

    // Estados para el modal principal (Editar Vivienda)
    const [showingModalPrincipal, setShowingModalPrincipal] = useState(false);
    const [isTransitioningPrincipal, setIsTransitioningPrincipal] = useState(false);
    const mainModalRef = useRef(null); // Ref para el div principal del modal

    // Estados para las modales de confirmación
    const [showingConfirmacionConCambios, setShowingConfirmacionConCambios] = useState(false);
    const [showingConfirmacionSinCambios, setShowingConfirmacionSinCambios] = useState(false);
    const [isTransitioningConfirmacion, setIsTransitioningConfirmacion] = useState(false);
    const confirmModalRef = useRef(null); // Ref para los divs de las modales de confirmación

    const [cambiosDetectados, setCambiosDetectados] = useState([]);

    // EFECTO para manejar la entrada y salida del modal principal
    useEffect(() => {
        if (isOpen) {
            setIsTransitioningPrincipal(true);
            setShowingModalPrincipal(true);
        } else {
            setIsTransitioningPrincipal(true);
            setShowingModalPrincipal(false); // Inicia la animación de salida
        }
    }, [isOpen]);

    // Efecto para detectar el fin de la transición del modal principal
    useEffect(() => {
        const node = mainModalRef.current;
        if (node) {
            const handleTransitionEnd = () => {
                if (!showingModalPrincipal) { // Si el modal está terminando de salir
                    setIsTransitioningPrincipal(false);
                    // AQUÍ ESTÁ LA CORRECCIÓN: Llamar onAnimationFinished para notificar al wrapper
                    if (onAnimationFinished) onAnimationFinished();
                }
            };
            node.addEventListener('transitionend', handleTransitionEnd);
            return () => {
                node.removeEventListener('transitionend', handleTransitionEnd);
            };
        }
    }, [showingModalPrincipal, onAnimationFinished]); // Dependencia onAnimationFinished

    // Efecto para detectar el fin de la transición de las modales de confirmación
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


    const initialState = useMemo(() => ({
        manzana: vivienda.manzana || "",
        numero: vivienda.numeroCasa?.toString() || "",
        matricula: vivienda.matricula || "",
        nomenclatura: vivienda.nomenclatura || "",
        valor: vivienda.valorTotal?.toString() || "",
    }), [vivienda]);

    const validateVivienda = useMemo(() => createViviendaValidator(vivienda.id), [vivienda.id]);

    const onValidSubmit = (formData) => {
        const campos = [
            { key: 'manzana', label: 'Manzana' },
            { key: 'numero', label: 'Número', original: vivienda.numeroCasa?.toString() },
            { key: 'matricula', label: 'Matrícula' },
            { key: 'nomenclatura', label: 'Nomenclatura' },
            { key: 'valor', label: 'Valor', original: vivienda.valorTotal?.toString(), esMoneda: true },
        ];
        const cambios = campos.map(campo => {
            const vOriginal = campo.original || vivienda[campo.key] || "";
            const vActual = formData[campo.key] || "";
            if (String(vOriginal).trim() !== String(vActual).trim()) {
                return { campo: campo.label, anterior: campo.esMoneda ? formatCOP(vOriginal) : vOriginal, actual: campo.esMoneda ? formatCOP(vActual) : vActual };
            }
            return null;
        }).filter(Boolean);

        setCambiosDetectados(cambios); // Almacenar los cambios
        setIsTransitioningConfirmacion(true); // Inicia la transición de entrada para la confirmación

        if (cambios.length > 0) {
            setShowingConfirmacionConCambios(true);
        } else {
            setShowingConfirmacionSinCambios(true);
        }
    };

    const handleConfirmarGuardado = () => {
        setIsTransitioningConfirmacion(true); // Inicia animación de salida para confirmación
        setShowingConfirmacionConCambios(false);
        setShowingConfirmacionSinCambios(false);

        setTimeout(() => { // Espera a que la animación de la confirmación termine
            const viviendaActualizada = {
                ...vivienda,
                manzana: formData.manzana,
                numeroCasa: parseInt(formData.numero, 10),
                matricula: formData.matricula.trim(),
                nomenclatura: formData.nomenclatura.trim(),
                valorTotal: parseInt(formData.valor, 10),
            };
            onGuardar(viviendaActualizada);
            showToast("✅ Cambios guardados correctamente.", "success");

            setIsTransitioningPrincipal(true); // Inicia animación de salida para el modal principal
            setShowingModalPrincipal(false);
            // onAnimationFinished se llamará en el useEffect de transitionend del modal principal
        }, ANIMATION_DURATION_MS);
    };

    const {
        formData, errors, enviando, handleInputChange, handleValueChange, handleSubmit,
    } = useForm(initialState, validateVivienda, onValidSubmit, { inputFilters });

    const cerrarAnimadoPrincipal = () => {
        // Llama a onClose del componente padre (EditarVivienda), que a su vez pondrá isOpen a false
        // y este useEffect de isOpen se encargará de la animación de salida.
        if (onClose) onClose();
    };

    // Función para cerrar las modales de confirmación sin guardar
    const handleCerrarConfirmacion = () => {
        setIsTransitioningConfirmacion(true); // Inicia animación de salida
        setShowingConfirmacionConCambios(false);
        setShowingConfirmacionSinCambios(false);
        // El isTransitioningConfirmacion será reseteado por el useEffect cuando la animación termine
    };

    // Renderiza el contenido del modal solo si está abierto o está animando su salida
    if (!isOpen && !isTransitioningPrincipal) return null;

    return (
        <>
            {/* Modal Principal de Edición de Vivienda */}
            <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-[${ANIMATION_DURATION_MS}ms] ${showingModalPrincipal ? "opacity-100" : "opacity-0"}`} ref={mainModalRef}>
                <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 mx-4 transition-all ease-in-out duration-[${ANIMATION_DURATION_MS}ms] ${showingModalPrincipal ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                    <h2 className="text-3xl font-bold text-[#c62828] text-center mb-8">
                        ✏️ Editar Vivienda
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6" noValidate>
                        <div>
                            <label className="block font-medium mb-1" htmlFor="manzana">Manzana <span className="text-red-600">*</span></label>
                            <select name="manzana" id="manzana" value={formData.manzana} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[#c62828] ${errors.manzana ? "border-red-600" : "border-gray-300"}`}>
                                <option value="">Selecciona</option>
                                {["A", "B", "C", "D", "E", "F"].map((m) => (<option key={m} value={m}>{m}</option>))}
                            </select>
                            {errors.manzana && <p className="text-red-600 text-sm mt-1">{errors.manzana}</p>}
                        </div>
                        <div>
                            <label className="block font-medium mb-1" htmlFor="numero">Número <span className="text-red-600">*</span></label>
                            <input id="numero" name="numero" type="text" value={formData.numero} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[#c62828] ${errors.numero ? "border-red-600" : "border-gray-300"}`} />
                            {errors.numero && <p className="text-red-600 text-sm mt-1">{errors.numero}</p>}
                        </div>
                        <div>
                            <label className="block font-medium mb-1" htmlFor="matricula">Matrícula <span className="text-red-600">*</span></label>
                            <input id="matricula" name="matricula" type="text" value={formData.matricula} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[#c62828] ${errors.matricula ? "border-red-600" : "border-gray-300"}`} />
                            {errors.matricula && <p className="text-red-600 text-sm mt-1">{errors.matricula}</p>}
                        </div>
                        <div>
                            <label className="block font-medium mb-1" htmlFor="nomenclatura">Nomenclatura <span className="text-red-600">*</span></label>
                            <input id="nomenclatura" name="nomenclatura" type="text" value={formData.nomenclatura} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[#c62828] ${errors.nomenclatura ? "border-red-600" : "border-gray-300"}`} />
                            {errors.nomenclatura && <p className="text-red-600 text-sm mt-1">{errors.nomenclatura}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block font-medium mb-1" htmlFor="valor">Valor <span className="text-red-600">*</span></label>
                            <NumericFormat id="valor" value={formData.valor} onValueChange={(values) => handleValueChange('valor', values.value)} thousandSeparator="." decimalSeparator="," prefix="$ " className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[#c62828] ${errors.valor ? "border-red-600" : "border-gray-300"}`} />
                            {errors.valor && <p className="text-red-600 text-sm mt-1">{errors.valor}</p>}
                        </div>
                        <div className="md:col-span-2 flex justify-end mt-8 space-x-4">
                            <button type="button" onClick={cerrarAnimadoPrincipal} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-5 py-2.5 rounded-full transition">Cancelar</button>
                            <button type="submit" disabled={enviando} className={`bg-[#28a745] hover:bg-green-700 text-white px-5 py-2.5 rounded-full transition`}>{enviando ? "Guardando..." : "Guardar Cambios"}</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* MODAL DE CONFIRMACIÓN CON CAMBIOS (Ahora con transiciones fluidas) */}
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
                            <button onClick={handleConfirmarGuardado} disabled={enviando} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-full shadow transition">{enviando ? "Guardando..." : "Guardar"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMACIÓN SIN CAMBIOS (Ahora con transiciones fluidas) */}
            {(showingConfirmacionSinCambios || isTransitioningConfirmacion) && (
                <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[60] transition-opacity duration-[${ANIMATION_DURATION_MS}ms] ${showingConfirmacionSinCambios ? "opacity-100" : "opacity-0"}`} ref={confirmModalRef}>
                    <div className={`bg-white p-7 rounded-2xl shadow-2xl max-w-sm w-full transition-all ease-in-out duration-[${ANIMATION_DURATION_MS}ms] ${showingConfirmacionSinCambios ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                        <h3 className="text-xl font-bold text-center mb-4 text-gray-800">Sin Cambios Detectados</h3>
                        <p className="text-center mb-6 text-gray-600">No has realizado ningún cambio. ¿Deseas guardar de todos modos?</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={handleCerrarConfirmacion} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-5 py-2 rounded-full transition">Cancelar</button>
                            <button onClick={handleConfirmarGuardado} disabled={enviando} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-full shadow transition">{enviando ? "Guardando..." : "Sí, guardar"}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Componente Wrapper (punto de entrada original de EditarVivienda)
const EditarVivienda = ({ isOpen, onClose, onCierreFinalizado, onGuardar, vivienda }) => {
    // Este estado indica si el componente interno debe estar montado,
    // permitiendo su animación de salida incluso si isOpen es false.
    const [shouldRenderContent, setShouldRenderContent] = useState(false);

    // Usa useEffect para controlar el montaje/desmontaje con animación.
    useEffect(() => {
        if (isOpen) {
            setShouldRenderContent(true); // Si isOpen es true, monta el contenido.
        }
        // Si isOpen pasa a false, el contenido ya está animando su salida
        // y se desmontará cuando onContentAnimationFinished sea llamado.
    }, [isOpen]);

    // Esta función la llamará EditarViviendaContent cuando su animación de salida haya terminado.
    const handleContentAnimationFinished = () => {
        setShouldRenderContent(false); // Una vez que la animación de salida termina, desmonta.
        // CORRECCIÓN: Llama a onCierreFinalizado para notificar al padre (ListarViviendas)
        if (onCierreFinalizado) onCierreFinalizado();
    };

    // Renderiza el contenido solo si debe ser renderizado (está abierto o está animando su salida)
    if (!shouldRenderContent && !isOpen) {
        return null; // Si no debe renderizar y no está abierto, no renderizamos nada.
    }

    return (
        <EditarViviendaContent
            isOpen={isOpen} // Pasa el estado real de apertura/cierre al componente interno
            onClose={onClose} // Función para cerrar el modal desde el interior (llamará a setIsOpen(false) en ListarViviendas)
            onGuardar={onGuardar}
            vivienda={vivienda}
            onAnimationFinished={handleContentAnimationFinished} // Callback para cuando la animación de salida termina
        />
    );
};

export default EditarVivienda;