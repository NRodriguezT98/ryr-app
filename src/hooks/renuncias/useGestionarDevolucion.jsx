import { useMemo } from 'react';
import { useForm } from '../useForm';
import toast from 'react-hot-toast';
import { marcarDevolucionComoPagada } from "../../services/renunciaService";
import { getTodayString, formatDisplayDate, parseDateAsUTC } from '../../utils/textFormatters';

export const useGestionarDevolucion = (renuncia, onSave, onClose) => {
    const initialState = useMemo(() => ({
        fechaDevolucion: getTodayString(),
        observacionDevolucion: '',
        urlComprobanteDevolucion: null
    }), []);

    const {
        formData,
        handleInputChange,
        handleValueChange,
        handleSubmit,
        isSubmitting,
        errors,
        setErrors
    } = useForm({
        initialState,
        // --- INICIO DE LA CORRECCIÓN ---
        // La lógica de validación se mueve a la función 'validate', que se ejecuta ANTES del onSubmit.
        validate: (data) => {
            const newErrors = {};
            const fechaDevolucion = parseDateAsUTC(data.fechaDevolucion);
            const fechaRenuncia = parseDateAsUTC(renuncia.fechaRenuncia);

            if (fechaDevolucion < fechaRenuncia) {
                newErrors.fechaDevolucion = `La fecha no puede ser anterior a la de la renuncia (${formatDisplayDate(renuncia.fechaRenuncia)}).`;
            }

            if (!data.urlComprobanteDevolucion) {
                newErrors.urlComprobanteDevolucion = "Adjuntar el soporte de devolución es obligatorio.";
            }
            return newErrors;
        },
        // 'onSubmit' ahora solo se ejecutará si la validación es exitosa.
        onSubmit: async (data) => {
            try {
                await marcarDevolucionComoPagada(renuncia.id, data);

                toast.success('Devolución registrada con éxito.');
                onSave();
                onClose();

                // ✅ Firestore sincronizará automáticamente
            } catch (error) {
                toast.error('No se pudo registrar la devolución.');
                console.error("Error al registrar devolución:", error);
            }
        },
        // --- FIN DE LA CORRECCIÓN ---
        options: { resetOnSuccess: true }
    });

    const handleUploadSuccess = (url) => {
        handleValueChange('urlComprobanteDevolucion', url);
    };

    const handleRemoveFile = () => {
        handleValueChange('urlComprobanteDevolucion', null);
    };

    return {
        formData,
        errors,
        isSubmitting,
        handlers: {
            handleInputChange,
            handleUploadSuccess,
            handleRemoveFile,
            handleSubmit
        }
    };
};