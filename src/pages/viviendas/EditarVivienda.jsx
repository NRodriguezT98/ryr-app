// Ruta: src/components/Viviendas/EditarVivienda.jsx

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { NumericFormat } from 'react-number-format';
import toast from 'react-hot-toast';

// Tus imports reales, manteniendo la buena práctica
import { useForm } from '../../hooks/useForm.jsx';
import { validateVivienda } from './viviendaValidation.js';
import { getViviendas, updateVivienda } from '../../utils/storage.js';

const INITIAL_VIVIENDA_STATE = {
    manzana: '', numero: '', matricula: '', nomenclatura: '',
    descuentoMonto: '0', descuentoMotivo: ''
};

const formatCurrency = (value) => {
    const numberValue = Number(String(value).replace(/\D/g, '')) || 0;
    return numberValue.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });
};

const fieldLabels = {
    manzana: "Manzana", numero: "Número", matricula: "Matrícula",
    nomenclatura: "Nomenclatura", descuentoMonto: "Monto del Descuento", descuentoMotivo: "Motivo del Descuento"
};

const EditarVivienda = ({ isOpen, onClose, onGuardar, vivienda }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [todasLasViviendas, setTodasLasViviendas] = useState([]);
    const [showDiscountSection, setShowDiscountSection] = useState(false);

    const initialFormState = useMemo(() => {
        if (!vivienda) return INITIAL_VIVIENDA_STATE;
        return {
            manzana: vivienda.manzana || '',
            numero: vivienda.numeroCasa?.toString() || '',
            matricula: vivienda.matricula || '',
            nomenclatura: vivienda.nomenclatura || '',
            descuentoMonto: vivienda.descuentoMonto?.toString() || '0',
            descuentoMotivo: vivienda.descuentoMotivo || ''
        };
    }, [vivienda]);

    useEffect(() => {
        if (isOpen) {
            const cargarDatosIniciales = async () => {
                setIsLoading(true);
                try {
                    const viviendasData = await getViviendas();
                    setTodasLasViviendas(viviendasData);
                } catch (error) { toast.error("No se pudieron cargar datos para validación."); }
                finally { setIsLoading(false); }
            };
            cargarDatosIniciales();
            setShowDiscountSection((parseInt(initialFormState.descuentoMonto, 10) || 0) > 0);
        }
    }, [isOpen, initialFormState]);

    // --- CAMBIO CLAVE: Lógica reestructurada para trabajar CON el hook ---

    // 1. Configuramos el hook useForm para que solo gestione el estado.
    //    Ya no le pasamos 'validate' ni 'onSubmit'. El componente controlará el flujo.
    const {
        formData, initialData, errors, setErrors, isSubmitting, setIsSubmitting, // Necesitamos setIsSubmitting
        handleInputChange, handleValueChange
    } = useForm({
        initialState: initialFormState,
    });

    // 2. Esta es la función FINAL, la que guarda en la base de datos.
    const handleActualUpdate = useCallback(async (data) => {
        setIsSubmitting(true); // El proceso de envío real comienza aquí
        const datosActualizados = {
            manzana: data.manzana.trim(),
            numeroCasa: parseInt(data.numero, 10) || 0,
            matricula: data.matricula.trim(),
            nomenclatura: data.nomenclatura.trim(),
            descuentoMonto: parseInt(String(data.descuentoMonto).replace(/\D/g, ''), 10) || 0,
            descuentoMotivo: data.descuentoMotivo.trim()
        };
        try {
            await updateVivienda(vivienda.id, datosActualizados);
            toast.success('Vivienda actualizada correctamente.');
            onGuardar();
            onClose();
        } catch (error) {
            toast.error('Error al actualizar la vivienda.');
            console.error("Error al guardar:", error);
        } finally {
            setIsSubmitting(false); // Finaliza el proceso de envío
        }
    }, [vivienda?.id, onGuardar, onClose, setIsSubmitting]);

    // 3. Esta es la función principal que se ejecuta al enviar el formulario.
    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Paso 1: Validar manualmente
        const validationErrors = validateVivienda(formData, todasLasViviendas, vivienda?.id);
        setErrors(validationErrors);

        // Si hay errores, no continuamos.
        if (Object.keys(validationErrors).length > 0) {
            toast.error("Por favor, corrige los errores del formulario.");
            return;
        }

        // Paso 2: Detectar cambios
        const cambios = Object.keys(formData).reduce((acc, key) => {
            const valorInicial = String(initialData[key] || '').trim();
            const valorActual = String(formData[key] || '').trim();

            if (key === 'descuentoMonto') {
                const montoInicialNum = parseInt(valorInicial.replace(/\D/g, ''), 10) || 0;
                const montoActualNum = parseInt(valorActual.replace(/\D/g, ''), 10) || 0;
                if (montoInicialNum !== montoActualNum) {
                    acc.push(`<li><strong>${fieldLabels[key]}:</strong> "${formatCurrency(montoInicialNum)}" → "${formatCurrency(montoActualNum)}"</li>`);
                }
            } else if (valorInicial !== valorActual) {
                acc.push(`<li><strong>${fieldLabels[key] || key}:</strong> "${valorInicial || 'vacío'}" → "${valorActual || 'vacío'}"</li>`);
            }
            return acc;
        }, []);

        // Paso 3: Si no hay cambios, notificar y detener.
        if (cambios.length === 0) {
            toast("No se han realizado cambios.", { icon: 'ℹ️' });
            return;
        }

        // Paso 4: Mostrar la notificación de confirmación
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-lg w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                    <p className="text-base font-semibold text-gray-900">Confirmar Cambios</p>
                    <div className="mt-2 text-sm text-gray-600">
                        <p>Se guardarán las siguientes modificaciones:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1" dangerouslySetInnerHTML={{ __html: cambios.join('') }} />
                    </div>
                </div>
                <div className="flex flex-col border-l border-gray-200">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            handleActualUpdate(formData); // Llamar a la función de guardado final
                        }}
                        className="w-full border-b border-gray-200 p-4 flex items-center justify-center text-sm font-medium text-green-600 hover:bg-green-50 focus:outline-none">
                        Confirmar
                    </button>
                    <button onClick={() => toast.dismiss(t.id)}
                        className="w-full p-4 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none">
                        Cancelar
                    </button>
                </div>
            </div>
        ), { duration: 10000 });
    };

    const valorDescuento = parseInt(String(formData.descuentoMonto).replace(/\D/g, ''), 10) || 0;
    const valorFinalConDescuento = (vivienda?.valorTotal || 0) - valorDescuento;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-[#c62828]">✏️ Editar Vivienda</h2>
                    <p className="text-lg text-gray-500 mt-1">
                        Valor de Lista: <span className="font-bold text-gray-800">{formatCurrency(vivienda?.valorTotal)}</span>
                    </p>
                </div>

                {isLoading ? (
                    <div className="text-center py-10 animate-pulse">Cargando datos...</div>
                ) : (
                    // 4. El formulario ahora usa nuestra función de control principal.
                    <form onSubmit={handleFormSubmit} noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-medium mb-1" htmlFor="manzana-edit">Manzana</label>
                                <select id="manzana-edit" name="manzana" value={formData.manzana} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg ${errors.manzana ? "border-red-600" : "border-gray-300"}`}>
                                    <option value="">Selecciona</option>
                                    {["A", "B", "C", "D", "E", "F"].map((m) => (<option key={m} value={m}>{m}</option>))}
                                </select>
                                {errors.manzana && <p className="text-red-600 text-sm mt-1">{errors.manzana}</p>}
                            </div>
                            <div>
                                <label className="block font-medium mb-1" htmlFor="numero-edit">Número</label>
                                <input id="numero-edit" name="numero" type="text" value={formData.numero} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg ${errors.numero ? "border-red-600" : "border-gray-300"}`} />
                                {errors.numero && <p className="text-red-600 text-sm mt-1">{errors.numero}</p>}
                            </div>
                            <div>
                                <label className="block font-medium mb-1" htmlFor="matricula-edit">Matrícula</label>
                                <input id="matricula-edit" name="matricula" type="text" value={formData.matricula} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg ${errors.matricula ? "border-red-600" : "border-gray-300"}`} />
                                {errors.matricula && <p className="text-red-600 text-sm mt-1">{errors.matricula}</p>}
                            </div>
                            <div>
                                <label className="block font-medium mb-1" htmlFor="nomenclatura-edit">Nomenclatura</label>
                                <input id="nomenclatura-edit" name="nomenclatura" type="text" value={formData.nomenclatura} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg ${errors.nomenclatura ? "border-red-600" : "border-gray-300"}`} />
                                {errors.nomenclatura && <p className="text-red-600 text-sm mt-1">{errors.nomenclatura}</p>}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t">
                            <button type="button" onClick={() => setShowDiscountSection(prev => !prev)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm w-full text-left p-2 -ml-2">
                                {showDiscountSection ? 'Ocultar sección de descuento' : 'Aplicar o Modificar Descuento...'}
                            </button>
                            {showDiscountSection && (
                                <div className="space-y-6 mt-4 animate-fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block font-medium mb-1" htmlFor="descuentoMonto">Monto del Descuento</label>
                                            <NumericFormat
                                                id="descuentoMonto"
                                                name="descuentoMonto"
                                                value={formData.descuentoMonto}
                                                onValueChange={(values) => handleValueChange('descuentoMonto', values.value)}
                                                className={`w-full border p-2.5 rounded-lg ${errors.descuentoMonto ? "border-red-600" : "border-gray-300"}`}
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                prefix="$ "
                                            />
                                            {errors.descuentoMonto && <p className="text-red-600 text-sm mt-1">{errors.descuentoMonto}</p>}
                                        </div>
                                        <div>
                                            <label className="block font-medium mb-1" htmlFor="descuentoMotivo">Motivo del Descuento</label>
                                            <input type="text" id="descuentoMotivo" name="descuentoMotivo" value={formData.descuentoMotivo} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg ${errors.descuentoMotivo ? "border-red-600" : "border-gray-300"}`} />
                                            {errors.descuentoMotivo && <p className="text-red-600 text-sm mt-1">{errors.descuentoMotivo}</p>}
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-dashed space-y-2">
                                        <div className="flex justify-between items-center text-gray-900 font-bold text-lg">
                                            <span>Valor Final (con Descuento):</span>
                                            <span className="text-green-600">{formatCurrency(valorFinalConDescuento)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end mt-8 pt-6 border-t space-x-4">
                            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold px-6 py-2 rounded-lg transition">Cancelar</button>
                            <button type="submit" disabled={isSubmitting} className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition disabled:bg-green-300">
                                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditarVivienda;
