import { useState, useMemo, useEffect } from 'react';
import { useForm } from '../useForm.jsx';
import { updateVivienda } from '../../utils/storage.js';
import toast from 'react-hot-toast';
import { validateDescuento } from '../../utils/validation.js';
import { formatCurrency } from '../../utils/textFormatters.js';

export const useDescuentoModal = (vivienda, onSave, onClose) => {
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

    useEffect(() => {
        setFormData(initialState);
    }, [vivienda, initialState, setFormData]);

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
            return;
        }

        setCambios(cambiosDetectados);
        setIsConfirming(true);
    };

    const hayCambios = useMemo(() => {
        if (!initialData) return false;
        // Creamos copias para no mutar el estado original al borrar los errores
        const currentData = { ...formData };
        const originalData = { ...initialData };
        delete currentData.errors;
        delete originalData.errors;
        return JSON.stringify(currentData) !== JSON.stringify(originalData);
    }, [formData, initialData]);

    const valorFinalCalculado = useMemo(() => {
        const valorTotal = vivienda?.valorTotal || 0;
        const descuento = parseInt(String(formData.descuentoMonto).replace(/\D/g, ''), 10) || 0;
        return valorTotal - descuento;
    }, [vivienda, formData.descuentoMonto]);

    return {
        formData,
        errors,
        isSubmitting,
        isConfirming,
        setIsConfirming,
        cambios,
        hayCambios,
        valorFinalCalculado,
        handlers: {
            handleInputChange,
            handleValueChange,
            handleInitialSubmit,
            handleSubmit
        }
    };
};