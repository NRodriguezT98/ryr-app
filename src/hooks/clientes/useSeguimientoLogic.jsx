import { useState, useEffect, useMemo, useCallback } from 'react';
import { PASOS_SEGUIMIENTO_CONFIG } from '../../utils/seguimientoConfig';
import toast from 'react-hot-toast';

export const useSeguimientoLogic = (cliente, onSave) => {
    const [seguimiento, setSeguimiento] = useState(cliente.seguimiento || {});

    useEffect(() => {
        setSeguimiento(cliente.seguimiento || {});
    }, [cliente.seguimiento]);

    const handleUpdate = useCallback((pasoKey, newData) => {
        setSeguimiento(prev => ({
            ...prev,
            [pasoKey]: newData
        }));
    }, []);

    const { pasosRenderizables, isSaveDisabled } = useMemo(() => {
        const pasosAplicables = PASOS_SEGUIMIENTO_CONFIG.filter(paso =>
            paso.aplicaA(cliente.financiero || {})
        );

        let lastCompletedDate = cliente.datosCliente.fechaIngreso;
        const errors = {};

        const pasosConDatos = pasosAplicables.map((paso, index) => {
            let previousStepDate = cliente.datosCliente.fechaIngreso;
            if (index > 0) {
                for (let i = index - 1; i >= 0; i--) {
                    const prevPasoKey = pasosAplicables[i].key;
                    const prevPasoData = seguimiento[prevPasoKey];
                    if (prevPasoData?.completado && prevPasoData?.fecha) {
                        previousStepDate = prevPasoData.fecha;
                        break;
                    }
                }
            }
            return { ...paso, data: seguimiento[paso.key], minDate: cliente.datosCliente.fechaIngreso, previousStepDate };
        });

        let previousStepValid = true;
        pasosConDatos.forEach(paso => {
            const pasoActual = paso.data;
            const isStepCompleted = (key) => seguimiento[key]?.completado && seguimiento[key]?.fecha && !errors[key];

            if (pasoActual?.completado) {
                if (!pasoActual.fecha) {
                    errors[paso.key] = "Se requiere una fecha.";
                } else {
                    const fechaSeleccionada = new Date(pasoActual.fecha + 'T00:00:00');
                    if (new Date(lastCompletedDate) > fechaSeleccionada) {
                        errors[paso.key] = `La fecha no puede ser anterior al último paso válido (${new Date(lastCompletedDate).toLocaleDateString('es-ES')}).`;
                    } else {
                        lastCompletedDate = pasoActual.fecha;
                    }
                }
            }

            const isBoletaRegistroCompleted = isStepCompleted('pagoBoletaRegistro');
            const allPreviousStepsForInvoiceCompleted = pasosAplicables.filter(p => p.key !== 'facturaVenta').every(p => isStepCompleted(p.key));

            let isLocked = !previousStepValid;
            switch (paso.key) {
                case 'solicitudDesembolsoCredito': case 'solicitudDesembolsoMCY': case 'solicitudDesembolsoCaja':
                    isLocked = !isBoletaRegistroCompleted; break;
                case 'desembolsoCredito': isLocked = !isStepCompleted('solicitudDesembolsoCredito'); break;
                case 'desembolsoMCY': isLocked = !isStepCompleted('solicitudDesembolsoMCY'); break;
                case 'desembolsoCaja': isLocked = !isStepCompleted('solicitudDesembolsoCaja'); break;
                case 'facturaVenta': isLocked = !allPreviousStepsForInvoiceCompleted; break;
            }

            paso.isLocked = isLocked;
            paso.error = errors[paso.key];

            if (!isStepCompleted(paso.key) && ['solicitudDesembolsoCredito', 'solicitudDesembolsoMCY', 'solicitudDesembolsoCaja'].indexOf(paso.key) === -1) {
                previousStepValid = false;
            }
        });

        return {
            pasosRenderizables: pasosConDatos,
            isSaveDisabled: Object.keys(errors).length > 0,
        };

    }, [cliente, seguimiento]);

    const handleSave = () => {
        if (isSaveDisabled) {
            toast.error("Hay errores en el formulario. Por favor, corrígelos antes de guardar.");
            return;
        }
        onSave(seguimiento);
    };

    return {
        handleUpdate,
        pasosRenderizables,
        isSaveDisabled,
        handleSave,
    };
};