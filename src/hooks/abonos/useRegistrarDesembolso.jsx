import { useMemo, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useForm } from '../useForm';
import { registrarDesembolsoCredito, addAbonoAndUpdateProceso } from "../../services/abonoService";
import { getTodayString, formatDisplayDate, toTitleCase } from '../../utils/textFormatters';
import { FUENTE_PROCESO_MAP } from '../../utils/procesoConfig';
import { useAuth } from '../../context/AuthContext';

export const useRegistrarDesembolso = (fuenteData, isOpen, onSave, onClose) => {
    const { userData } = useAuth();
    const userName = userData ? toTitleCase(`${userData.nombres} ${userData.apellidos}`) : 'Usuario Desconocido';

    const initialState = useMemo(() => ({
        fechaPago: getTodayString(),
        urlComprobante: null,
        observacion: ''
    }), []);

    const {
        formData, setFormData, handleInputChange, handleSubmit,
        isSubmitting, errors, dispatch
    } = useForm({
        initialState,
        onSubmit: async (data) => {
            const validationErrors = {};
            if (!data.urlComprobante) {
                validationErrors.urlComprobante = "El comprobante es obligatorio.";
            }

            const { fuente, cliente, titulo, vivienda, proyecto } = fuenteData;
            const pasoConfig = FUENTE_PROCESO_MAP[fuente];
            const pasoSolicitud = cliente.proceso?.[pasoConfig.solicitudKey];

            if (!pasoSolicitud?.completado) {
                toast.error(`Primero debe completar el paso de "Solicitud de ${titulo}" en la pestaña de Proceso.`);
                return;
            }

            if (pasoSolicitud.fecha) {
                const fechaSolicitud = new Date(pasoSolicitud.fecha + 'T00:00:00');
                const fechaDesembolso = new Date(data.fechaPago + 'T00:00:00');
                if (fechaDesembolso < fechaSolicitud) {
                    validationErrors.fechaPago = `La fecha no puede ser anterior a la solicitud (${formatDisplayDate(pasoSolicitud.fecha)}).`;
                }
            }

            if (Object.keys(validationErrors).length > 0) {
                dispatch({ type: 'SET_ERRORS', payload: validationErrors });
                return;
            }

            const montoADesembolsar = fuenteData.montoPactado - fuenteData.abonos.reduce((sum, a) => sum + a.monto, 0);
            const abonoData = {
                ...data,
                monto: montoADesembolsar,
                fuente: fuenteData.fuente,
                metodoPago: `Desembolso ${fuenteData.titulo}`,
                clienteId: fuenteData.cliente.id,
                viviendaId: fuenteData.vivienda.id,
            };

            try {
                if (fuenteData.fuente === 'credito') {
                    await registrarDesembolsoCredito(cliente.id, vivienda.id, abonoData, proyecto, userName);
                } else {
                    await addAbonoAndUpdateProceso(abonoData, cliente, proyecto, userName);
                }

                toast.success(`¡Desembolso de ${fuenteData.titulo} registrado con éxito!`);
                onSave();
                onClose();

                // ✅ FIX: La sincronización en tiempo real ahora funciona usando serverTimestamp()
            } catch (error) {
                toast.error(error.message || `No se pudo registrar el desembolso.`);
                console.error("Error al registrar desembolso:", error);
            }
        },
        options: { resetOnSuccess: false }
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(initialState);
        }
    }, [isOpen, initialState, setFormData]);

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