import { useMemo } from 'react';
import { useForm } from '../useForm.jsx';
import toast from 'react-hot-toast';
// --- INICIO DE LA CORRECCIÓN ---
import { addAbono } from '../../utils/storage'; // Se cambia el nombre de la función importada
// --- FIN DE LA CORRECCIÓN ---
import { validateAbono } from '../../utils/validation.js';
import { formatCurrency, getTodayString } from '../../utils/textFormatters.js';
import { FUENTE_PROCESO_MAP } from '../../utils/procesoConfig.js';

export const useAbonoForm = ({ fuente, titulo, saldoPendiente, vivienda, cliente, onAbonoRegistrado }) => {

    const initialAbonoFormState = useMemo(() => ({
        monto: '',
        fechaPago: getTodayString(),
        observacion: '',
        urlComprobante: null,
        metodoPago: titulo
    }), [titulo]);

    const form = useForm({
        initialState: initialAbonoFormState,
        validate: (data) => {
            const pasoConfig = FUENTE_PROCESO_MAP[fuente];
            const fechaDeInicio = cliente?.fechaInicioProceso || cliente?.datosCliente?.fechaIngreso;
            return validateAbono(data, { saldoPendiente }, fechaDeInicio, cliente?.proceso, pasoConfig);
        },
        onSubmit: async (data) => {
            const nuevoAbono = {
                fechaPago: data.fechaPago,
                monto: parseInt(String(data.monto).replace(/\D/g, ''), 10) || 0,
                metodoPago: data.metodoPago,
                fuente: fuente,
                observacion: data.observacion.trim(),
                urlComprobante: data.urlComprobante,
                viviendaId: vivienda.id,
                clienteId: vivienda.clienteId,
            };

            try {
                // --- INICIO DE LA CORRECCIÓN ---
                // Se llama a la función con el nombre correcto 'addAbono'
                await addAbono(nuevoAbono, cliente);
                // --- FIN DE LA CORRECCIÓN ---
                toast.success("Abono registrado y proceso actualizado con éxito.");
                form.resetForm();
                onAbonoRegistrado(true);
            } catch (error) {
                if (error.message === 'SOLICITUD_PENDIENTE') {
                    toast.error("El paso de solicitud de desembolso aún no está completado en el proceso.");
                } else {
                    toast.error("No se pudo registrar el abono.");
                }
            }
        }
    });

    return form;
};