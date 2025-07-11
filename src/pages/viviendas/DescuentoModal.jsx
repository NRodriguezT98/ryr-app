import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useForm } from '../../hooks/useForm.jsx';
import { updateVivienda } from '../../utils/storage.js';
import toast from 'react-hot-toast';
import { NumericFormat } from 'react-number-format';
import { validateDescuento } from './viviendaValidation.js';
import { Tooltip } from 'react-tooltip';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import { formatCurrency } from '../../utils/textFormatters.js';

const DescuentoModal = ({ isOpen, onClose, onSave, vivienda }) => {
    const [isConfirming, setIsConfirming] = useState(false);
    const [cambios, setCambios] = useState([]);

    const initialState = useMemo(() => ({
        descuentoMonto: vivienda?.descuentoMonto?.toString() || '0',
        descuentoMotivo: vivienda?.descuentoMotivo || ''
    }), [vivienda]);

    const {
        formData, setFormData, handleSubmit, handleInputChange,
        handleValueChange, errors, isSubmitting, initialData, setErrors
    } = useForm({
        initialState,
        onSubmit: async (data) => {
            const montoDescuento = parseInt(String(data.descuentoMonto).replace(/\D/g, ''), 10) || 0;
            const datosParaGuardar = {
                descuentoMonto: montoDescuento,
                descuentoMotivo: data.descuentoMotivo.trim()
            };
            try {
                await updateVivienda(vivienda.id, datosParaGuardar);
                toast.success('Descuento actualizado correctamente.');
                onSave();
                onClose();
            } catch (error) {
                toast.error('Error al guardar el descuento.');
                console.error("Error al aplicar descuento:", error);
            } finally {
                setIsConfirming(false);
            }
        },
        options: { resetOnSuccess: false }
    });

    const handleInitialSubmit = () => {
        const validationErrors = validateDescuento(formData, vivienda);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            toast.error("Por favor, corrige los errores del formulario.");
            return;
        }

        const cambiosDetectados = [];
        const montoAnterior = parseInt(initialData.descuentoMonto.replace(/\D/g, ''), 10) || 0;
        const montoActual = parseInt(formData.descuentoMonto.replace(/\D/g, ''), 10) || 0;

        if (montoAnterior !== montoActual) {
            cambiosDetectados.push({ campo: "Monto del Descuento", anterior: formatCurrency(montoAnterior), actual: formatCurrency(montoActual) });
        }
        if (initialData.descuentoMotivo.trim() !== formData.descuentoMotivo.trim()) {
            cambiosDetectados.push({ campo: "Motivo del Descuento", anterior: initialData.descuentoMotivo.trim(), actual: formData.descuentoMotivo.trim() });
        }

        if (cambiosDetectados.length === 0) {
            // Ya no mostramos el toast. El botón deshabilitado es la señal principal.
            return;
        }

        setCambios(cambiosDetectados);
        setIsConfirming(true);
    };

    useEffect(() => {
        setFormData(initialState);
    }, [vivienda, initialState, setFormData]);

    const hayCambios = useMemo(() => {
        if (!initialData) return false;
        const currentData = { ...formData, errors: null };
        const originalData = { ...initialData, errors: null };
        return JSON.stringify(currentData) !== JSON.stringify(originalData);
    }, [formData, initialData]);

    const valorFinalCalculado = useMemo(() => {
        const valorTotal = vivienda?.valorTotal || 0;
        const descuento = parseInt(String(formData.descuentoMonto).replace(/\D/g, ''), 10) || 0;
        return valorTotal - descuento;
    }, [vivienda, formData.descuentoMonto]);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg mx-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800">Gestionar Descuento</h2>
                        <p className="text-gray-500 mb-6">{`Vivienda: Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}</p>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block font-medium mb-1" htmlFor="descuentoMonto">Monto del Descuento</label>
                            <NumericFormat id="descuentoMonto" name="descuentoMonto" value={formData.descuentoMonto} onValueChange={(values) => handleValueChange('descuentoMonto', values.value)} className={`w-full border p-2.5 rounded-lg ${errors.descuentoMonto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                            {errors.descuentoMonto && <p className="text-red-600 text-sm mt-1">{errors.descuentoMonto}</p>}
                        </div>
                        <div>
                            <label className="block font-medium mb-1" htmlFor="descuentoMotivo">Motivo del Descuento (opcional si el monto es 0)</label>
                            <input type="text" id="descuentoMotivo" name="descuentoMotivo" value={formData.descuentoMotivo} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg ${errors.descuentoMotivo ? 'border-red-500' : 'border-gray-300'}`} />
                            {errors.descuentoMotivo && <p className="text-red-600 text-sm mt-1">{errors.descuentoMotivo}</p>}
                        </div>
                    </div>
                    <div className="bg-gray-50 border p-4 rounded-lg mt-8 space-y-2">
                        <div className="flex justify-between items-center"><span className="text-gray-600">Valor de Lista:</span><span className="font-medium">{formatCurrency(vivienda.valorTotal)}</span></div>
                        <div className="flex justify-between items-center"><span className="text-gray-600">Descuento Aplicado:</span><span className="font-medium text-red-500">- {formatCurrency(parseInt(String(formData.descuentoMonto).replace(/\D/g, ''), 10) || 0)}</span></div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2"><span>Valor Final:</span><span className="text-green-600">{formatCurrency(valorFinalCalculado)}</span></div>
                    </div>
                    <div className="flex justify-end mt-8 pt-6 border-t space-x-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold px-6 py-2 rounded-lg transition">Cancelar</button>
                        <button
                            type="button"
                            onClick={handleInitialSubmit}
                            disabled={!hayCambios || isSubmitting}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                            data-tooltip-id="save-discount-tooltip"
                            data-tooltip-content={!hayCambios ? "No hay cambios para guardar" : ''}
                        >
                            {isSubmitting ? 'Guardando...' : 'Guardar Descuento'}
                        </button>
                        {!hayCambios && <Tooltip id="save-discount-tooltip" />}
                    </div>
                </div>
            </div>

            {isConfirming && (
                <ModalConfirmacion
                    isOpen={isConfirming}
                    onClose={() => setIsConfirming(false)}
                    onConfirm={handleSubmit}
                    titulo="Confirmar Descuento"
                    cambios={cambios}
                    isSubmitting={isSubmitting}
                />
            )}
        </>
    );
};

export default DescuentoModal;