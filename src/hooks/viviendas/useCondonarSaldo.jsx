import { useMemo, useState } from 'react';
import { useForm } from '../useForm';
import { addAbono } from '../../utils/storage';
import toast from 'react-hot-toast';
import { getTodayString } from '../../utils/textFormatters';

export const useCondonarSaldo = (fuenteData, onSave, onClose) => {
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
            if (!fuenteData || fuenteData.saldoPendiente <= 0) {
                toast.error("No hay saldo pendiente en esta fuente para condonar.");
                return;
            }

            const condonacionAbono = {
                fechaPago: getTodayString(),
                monto: fuenteData.saldoPendiente,
                metodoPago: 'Condonación de Saldo',
                fuente: fuenteData.fuente, // Se usa la fuente correcta (ej: 'cuotaInicial')
                observacion: data.motivo.trim(),
                urlComprobante: data.urlSoporte,
                viviendaId: fuenteData.vivienda.id,
                clienteId: fuenteData.cliente.id,
                clienteNombre: `${fuenteData.cliente.datosCliente.nombres} ${fuenteData.cliente.datosCliente.apellidos}`.trim(),
                estadoProceso: 'activo'
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