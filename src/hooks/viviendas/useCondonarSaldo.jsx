import { useMemo } from 'react';
import { useForm } from '../useForm';
import toast from 'react-hot-toast';
// --- INICIO DE LA CORRECCIÓN ---
import { addAbonoAndUpdateProceso } from '../../utils/storage'; // Se importa la función con el nombre correcto
// --- FIN DE LA CORRECCIÓN ---
import { getTodayString, parseDateAsUTC, formatDisplayDate } from '../../utils/textFormatters';
import { useData } from '../../context/DataContext';

export const useCondonarSaldo = (fuenteData, onSave, onClose) => {
    const { abonos } = useData();

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
            if (!data.motivo.trim()) {
                newErrors.motivo = "El motivo de la condonación es obligatorio.";
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
                toast.error("No hay saldo pendiente en esta fuente para condonar.");
                return;
            }

            const condonacionAbono = {
                fechaPago: data.fechaCondonacion,
                monto: fuenteData.saldoPendiente,
                metodoPago: 'Condonación de Saldo',
                fuente: fuenteData.fuente,
                observacion: data.motivo.trim(),
                urlComprobante: data.urlSoporte,
                viviendaId: fuenteData.vivienda.id,
                clienteId: fuenteData.cliente.id,
                clienteNombre: `${fuenteData.cliente.datosCliente.nombres} ${fuenteData.cliente.datosCliente.apellidos}`.trim(),
                estadoProceso: 'activo'
            };

            try {
                // --- INICIO DE LA CORRECCIÓN ---
                // Se llama a la función con el nombre correcto 'addAbonoAndUpdateProceso'
                await addAbonoAndUpdateProceso(condonacionAbono, fuenteData.cliente);
                // --- FIN DE LA CORRECCIÓN ---
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
        minDate,
        handlers: {
            handleInputChange,
            handleValueChange,
            handleSubmit,
        }
    };
};