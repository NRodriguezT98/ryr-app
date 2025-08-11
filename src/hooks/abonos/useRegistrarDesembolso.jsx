import { useMemo, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useForm } from '../useForm';
import { registrarDesembolsoCredito } from '../../utils/storage';
import { getTodayString, formatDisplayDate } from '../../utils/textFormatters';
import { FUENTE_PROCESO_MAP } from '../../utils/procesoConfig';

export const useRegistrarDesembolso = (fuenteData, isOpen, onSave, onClose) => {
    const initialState = useMemo(() => ({
        fechaPago: getTodayString(),
        urlComprobante: null,
        observacion: ''
    }), []);

    const {
        formData,
        setFormData,
        handleInputChange,
        handleSubmit,
        isSubmitting,
        errors,
        dispatch
    } = useForm({
        initialState,
        onSubmit: async (data) => {
            const validationErrors = {};
            if (!data.urlComprobante) {
                validationErrors.urlComprobante = "El comprobante es obligatorio.";
            }

            const pasoConfig = FUENTE_PROCESO_MAP['credito'];
            if (pasoConfig) {
                const pasoSolicitud = fuenteData.cliente.proceso?.[pasoConfig.solicitudKey];
                if (pasoSolicitud?.completado && pasoSolicitud.fecha) {
                    const fechaSolicitud = new Date(pasoSolicitud.fecha + 'T00:00:00');
                    const fechaDesembolso = new Date(data.fechaPago + 'T00:00:00');
                    if (fechaDesembolso < fechaSolicitud) {
                        validationErrors.fechaPago = `La fecha no puede ser anterior a la solicitud (${formatDisplayDate(pasoSolicitud.fecha)}).`;
                    }
                }
            }

            if (Object.keys(validationErrors).length > 0) {
                dispatch({ type: 'SET_ERRORS', payload: validationErrors });
                // Se elimina el toast.error para que solo se muestren los errores en el formulario.
                return;
            }

            try {
                await registrarDesembolsoCredito(fuenteData.cliente.id, fuenteData.vivienda.id, data);
                toast.success('¡Desembolso del crédito registrado con éxito!');
                onSave();
                onClose();
            } catch (error) {
                toast.error(error.message || 'No se pudo registrar el desembolso.');
                console.error("Error al registrar desembolso:", error);
            }
        },
        options: { resetOnSuccess: false } // Se asegura que el formulario no se borre en caso de error
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(initialState);
        }
    }, [isOpen]); // Se quitan dependencias para que solo se resetee al abrir

    const handleFileChange = useCallback((url) => {
        dispatch({ type: 'SET_ERRORS', payload: { urlComprobante: null } });
        handleInputChange({ target: { name: 'urlComprobante', value: url } });
    }, [dispatch, handleInputChange]);

    return {
        formData,
        isSubmitting,
        errors,
        handlers: {
            handleInputChange,
            handleSubmit,
            handleFileChange
        }
    };
};