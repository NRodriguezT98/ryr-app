import { useMemo } from 'react';
import { useForm } from '../useForm.jsx';
import toast from 'react-hot-toast';
import { addAbonoAndUpdateProceso } from '../../utils/storage'; // Importamos la nueva función
import { validateAbono } from '../../utils/validation.js';
import { formatCurrency } from '../../utils/textFormatters.js';
import { FUENTE_PROCESO_MAP } from '../../utils/procesoConfig.js'; // Importamos el mapa

const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

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
        // --- INICIO DE LA MODIFICACIÓN ---
        validate: (data) => {
            const pasoConfig = FUENTE_PROCESO_MAP[fuente];
            // Pasamos el proceso del cliente a la función de validación
            return validateAbono(data, { saldoPendiente }, cliente?.datosCliente?.fechaIngreso, cliente?.proceso, pasoConfig);
        },
        // --- FIN DE LA MODIFICACIÓN ---
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
                // Usamos la nueva función que actualiza todo en una transacción
                await addAbonoAndUpdateProceso(nuevoAbono, cliente);
                toast.success("Abono registrado y proceso actualizado con éxito.");

                const message = `Nuevo abono de ${formatCurrency(nuevoAbono.monto)} para la vivienda Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`;
                // La notificación ahora se crea dentro de la función de storage para mayor consistencia

                form.resetForm();
                onAbonoRegistrado(true);
            } catch (error) {
                // Manejamos el error específico de validación que ahora puede venir de `storage`
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