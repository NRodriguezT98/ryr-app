// src/hooks/viviendas/useCondonarSaldo.jsx (VERSIÓN FINAL)
import { useMemo } from 'react';
import { useForm } from '../useForm';
import { useModernToast } from '../useModernToast.jsx';
import { condonarSaldo } from "../../services/abonoService";
import { useAuth } from '../../context/AuthContext';
import { getTodayString, parseDateAsUTC, formatDisplayDate } from '../../utils/textFormatters';

export const useCondonarSaldo = (fuenteData, onSave, onClose) => {
    const { user } = useAuth();
    const userName = user?.displayName || 'Sistema';
    const toast = useModernToast();

    const initialState = useMemo(() => ({
        motivo: '',
        urlSoporte: null,
        fechaCondonacion: getTodayString(),
    }), []);

    const minDate = useMemo(() => {
        if (!fuenteData?.cliente) return null;
        const { cliente } = fuenteData;
        return cliente.fechaInicioProceso || cliente.datosCliente.fechaIngreso;
    }, [fuenteData]);

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
            if (!data.motivo.trim() || data.motivo.trim().length < 10) {
                newErrors.motivo = "El motivo debe tener al menos 10 caracteres.";
            }
            if (!data.urlSoporte) {
                newErrors.urlSoporte = "El soporte de aprobación es obligatorio.";
            }
            if (!data.fechaCondonacion) {
                newErrors.fechaCondonacion = "La fecha es obligatoria.";
            } else if (parseDateAsUTC(data.fechaCondonacion) < parseDateAsUTC(minDate)) {
                newErrors.fechaCondonacion = `La fecha no puede ser anterior al inicio del proceso (${formatDisplayDate(minDate)}).`;
            }
            return newErrors;
        },
        onSubmit: async (data) => {
            if (!fuenteData || fuenteData.saldoPendiente <= 0) {
                toast.error("No hay saldo pendiente para condonar.", {
                    title: "Sin Saldo Pendiente"
                });
                return;
            }

            const datosCondonacion = {
                vivienda: fuenteData.vivienda,
                cliente: fuenteData.cliente,
                proyecto: fuenteData.proyecto,
                monto: fuenteData.saldoPendiente,
                motivo: data.motivo.trim(),
                fechaCondonacion: data.fechaCondonacion,
                urlSoporte: data.urlSoporte,
                fuenteOriginal: fuenteData.fuente,         // ej: 'cuotaInicial'
                tituloFuenteOriginal: fuenteData.titulo // Guardamos el nombre legible de la fuente
            };

            try {
                await condonarSaldo(datosCondonacion, userName);
                toast.success('Saldo condonado con éxito.', {
                    title: "¡Condonación Exitosa!"
                });
                onSave();
                onClose();
            } catch (error) {
                toast.error('No se pudo registrar la condonación.', {
                    title: "Error de Condonación"
                });
                console.error("Error al condonar saldo:", error);
            }
        },
    });

    return {
        formData,
        errors,
        isSubmitting,
        minDate,
        handlers: {
            handleInputChange,
            handleValueChange,
            handleSubmit,
        }
    };
};