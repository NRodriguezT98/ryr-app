import { useMemo, useState } from 'react';
import { useForm } from '../useForm.jsx';
import { addAbono } from '../../utils/storage.js';
import toast from 'react-hot-toast';
import { getTodayString } from '../../utils/textFormatters.js';

export const useCondonarSaldo = (vivienda, onSave, onClose) => {
    const initialState = useMemo(() => ({
        motivo: '',
        urlSoporte: null,
    }), []);

    const {
        formData,
        handleInputChange,
        handleValueChange,
        handleSubmit,
        isSubmitting,
        errors,
    } = useForm({
        initialState,
        validate: (data) => {
            const newErrors = {};
            if (!data.motivo.trim()) {
                newErrors.motivo = "El motivo de la condonación es obligatorio.";
            }
            if (!data.urlSoporte) {
                newErrors.urlSoporte = "El soporte de aprobación es obligatorio.";
            }
            return newErrors;
        },
        onSubmit: async (data) => {
            if (!vivienda || vivienda.saldoPendiente <= 0) {
                toast.error("No hay saldo pendiente para condonar.");
                return;
            }

            const condonacionAbono = {
                fechaPago: getTodayString(),
                monto: vivienda.saldoPendiente,
                metodoPago: 'Condonación de Saldo',
                fuente: 'condonacion',
                observacion: data.motivo.trim(),
                urlComprobante: data.urlSoporte,
                viviendaId: vivienda.id,
                clienteId: vivienda.clienteId,
                clienteNombre: vivienda.clienteNombre,
                // --- INICIO DE LA CORRECCIÓN ---
                estadoProceso: 'activo' // Se añade el estado que faltaba
                // --- FIN DE LA CORRECCIÓN ---
            };

            try {
                await addAbono(condonacionAbono);
                toast.success('Saldo condonado y registrado como abono con éxito.');
                onSave();
                onClose();
            } catch (error) {
                toast.error('No se pudo registrar la condonación.');
                console.error("Error al condonar saldo:", error);
            }
        },
    });

    return {
        formData,
        errors,
        isSubmitting,
        handlers: {
            handleInputChange,
            handleValueChange,
            handleSubmit,
        }
    };
};