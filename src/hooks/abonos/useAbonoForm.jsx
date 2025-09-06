// src/hooks/abonos/useAbonoForm.jsx

import { useMemo } from 'react';
import { useForm } from '../useForm.jsx';
import toast from 'react-hot-toast';
import { addAbonoAndUpdateProceso } from "../../services/abonoService";
import { validateAbono } from '../../utils/validation.js';
import { formatCurrency, getTodayString } from '../../utils/textFormatters.js';
import { FUENTE_PROCESO_MAP } from '../../utils/procesoConfig.js';
import { useData } from '../../context/DataContext.jsx'; // <-- 1. Importamos useData
import { useAuth } from '../../context/AuthContext.jsx';

export const useAbonoForm = ({ fuente, titulo, saldoPendiente, montoPactado, vivienda, cliente, proyecto, onAbonoRegistrado }) => {
    const { clientes } = useData(); // <-- 2. Obtenemos la lista FRESCA de clientes
    const { user } = useAuth();

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

            // 👇 3. Buscamos la última versión del cliente desde useData
            const clienteFresco = clientes.find(c => c.id === cliente.id);
            const fechaDeInicio = clienteFresco?.fechaInicioProceso || clienteFresco?.datosCliente?.fechaIngreso;

            const resumenPago = {
                saldoPendiente: saldoPendiente,
                montoPactado: montoPactado // Ahora el hook tiene este dato.
            };

            // Pasamos los datos frescos a la validación
            return validateAbono(data, resumenPago, fechaDeInicio, clienteFresco?.proceso, pasoConfig);
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
                clienteId: cliente.id,
            };
            try {
                const userName = user?.displayName || 'Sistema';
                await addAbonoAndUpdateProceso(nuevoAbono, cliente, proyecto, userName);
                toast.success("Abono registrado y proceso actualizado con éxito.");
                form.resetForm();
                onAbonoRegistrado(true);
            } catch (error) {
                if (error.message === 'SOLICITUD_PENDIENTE') {
                    toast.error("El paso de solicitud de desembolso aún no está completado en el proceso.");
                } else {
                    toast.error(error.message || "No se pudo registrar el abono.");
                }
            }
        }
    });

    return form;
};