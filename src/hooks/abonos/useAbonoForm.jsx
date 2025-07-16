import { useMemo } from 'react';
import { useForm } from '../useForm.jsx';
import toast from 'react-hot-toast';
import { addAbono, createNotification } from '../../utils/storage';
import { validateAbono } from '../../pages/abonos/abonoValidation.js';
import { formatCurrency } from '../../utils/textFormatters.js';

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
        validate: (data) => validateAbono(data, { saldoPendiente }, cliente?.datosCliente?.fechaIngreso),
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
                await addAbono(nuevoAbono);
                toast.success("Abono registrado con éxito.");

                const message = `Nuevo abono de ${formatCurrency(nuevoAbono.monto)} para la vivienda Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`;
                await createNotification('abono', message, `/viviendas/detalle/${nuevoAbono.viviendaId}`);

                form.resetForm();
                onAbonoRegistrado(true); // Pasamos 'true' para indicar que se debe cerrar el form
            } catch (error) {
                toast.error("No se pudo registrar el abono.");
            }
        }
    });

    return form;
};