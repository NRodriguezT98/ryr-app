import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';
import { updateCliente } from '../../utils/storage';

const getTodayString = () => new Date().toISOString().split('T')[0];

export const useProcesoLogic = (cliente, onSave) => {
    const [procesoState, setProcesoState] = useState(cliente.proceso || {});
    const [initialProcesoState, setInitialProcesoState] = useState(cliente.proceso || {});

    useEffect(() => {
        setProcesoState(cliente.proceso || {});
        setInitialProcesoState(cliente.proceso || {});
    }, [cliente.proceso]);

    const handleUpdateEvidencia = useCallback((pasoKey, evidenciaId, url) => {
        setProcesoState(prev => {
            const newProceso = JSON.parse(JSON.stringify(prev));
            // Aseguramos que el paso exista antes de modificarlo
            if (!newProceso[pasoKey]) {
                newProceso[pasoKey] = { completado: false, fecha: null, evidencias: {} };
            }
            if (!newProceso[pasoKey].evidencias) {
                newProceso[pasoKey].evidencias = {};
            }
            newProceso[pasoKey].evidencias[evidenciaId] = { url, estado: url ? 'subido' : 'pendiente' };
            return newProceso;
        });
    }, []);

    const handleCompletarPaso = useCallback((pasoKey, fecha) => {
        setProcesoState(prev => {
            const newProceso = JSON.parse(JSON.stringify(prev));
            if (newProceso[pasoKey]) {
                newProceso[pasoKey].completado = true;
                newProceso[pasoKey].fecha = fecha;
            }
            return newProceso;
        });
    }, []);

    const { pasosRenderizables, validationErrors } = useMemo(() => {
        const errores = {};
        let ultimaFechaValida = cliente.datosCliente.fechaIngreso;

        const pasosAplicables = PROCESO_CONFIG.filter(paso => paso.aplicaA(cliente.financiero || {}));

        pasosAplicables.forEach(paso => {
            const pasoActual = procesoState[paso.key];
            if (pasoActual?.completado) {
                if (!pasoActual.fecha) {
                    errores[paso.key] = "Se requiere una fecha.";
                } else {
                    const fechaSeleccionada = new Date(pasoActual.fecha + 'T00:00:00');
                    if (new Date(ultimaFechaValida) > fechaSeleccionada) {
                        errores[paso.key] = `La fecha no puede ser anterior al último paso válido (${new Date(ultimaFechaValida).toLocaleDateString('es-ES')}).`;
                    } else {
                        ultimaFechaValida = pasoActual.fecha;
                    }
                }
            }
        });

        let previousStepCompleted = true;
        const resultado = pasosAplicables.map(pasoConfig => {
            // --- SOLUCIÓN DEFINITIVA AQUÍ ---
            // Aseguramos que pasoData siempre tenga una estructura completa
            const pasoData = procesoState[pasoConfig.key] || { completado: false, fecha: null, evidencias: {} };

            const isStepValidAndCompleted = (key) => procesoState[key]?.completado && procesoState[key]?.fecha && !errores[key];
            const isBoletaRegistroCompleted = isStepValidAndCompleted('pagoBoletaRegistro');
            const allPreviousStepsForInvoiceCompleted = pasosAplicables.filter(p => p.key !== 'facturaVenta').every(p => isStepValidAndCompleted(p.key));

            let isLocked = !previousStepCompleted;
            switch (pasoConfig.key) {
                case 'solicitudDesembolsoCredito': case 'solicitudDesembolsoMCY': case 'solicitudDesembolsoCaja':
                    isLocked = !isBoletaRegistroCompleted; break;
                case 'desembolsoCredito': isLocked = !isStepValidAndCompleted('solicitudDesembolsoCredito'); break;
                case 'desembolsoMCY': isLocked = !isStepValidAndCompleted('solicitudDesembolsoMCY'); break;
                case 'desembolsoCaja': isLocked = !isStepValidAndCompleted('solicitudDesembolsoCaja'); break;
                case 'facturaVenta': isLocked = !allPreviousStepsForInvoiceCompleted; break;
            }

            if (!isStepValidAndCompleted(pasoConfig.key) && ['solicitudDesembolsoCredito', 'solicitudDesembolsoMCY', 'solicitudDesembolsoCaja'].indexOf(pasoConfig.key) === -1) {
                previousStepCompleted = false;
            }

            const todasEvidenciasSubidas = pasoConfig.evidenciasRequeridas.every(ev => pasoData.evidencias[ev.id]?.url);
            const puedeCompletarse = todasEvidenciasSubidas && !pasoData.completado && !isLocked;

            return { ...pasoConfig, data: pasoData, isLocked, puedeCompletarse, error: errores[pasoConfig.key] };
        });

        return {
            pasosRenderizables: resultado,
            validationErrors: errores
        };

    }, [cliente.financiero, cliente.datosCliente.fechaIngreso, procesoState]);

    const isSaveDisabled = useMemo(() => {
        if (Object.keys(validationErrors).length > 0) return true;
        if (JSON.stringify(procesoState) === JSON.stringify(initialProcesoState)) return true;
        return false;
    }, [procesoState, initialProcesoState, validationErrors]);

    const handleSaveChanges = async () => {
        if (isSaveDisabled) {
            toast.error("No hay cambios para guardar o existen errores.");
            return;
        }
        try {
            await onSave(procesoState);
            toast.success("Proceso del cliente actualizado con éxito.");
            setInitialProcesoState(procesoState);
        } catch (error) {
            toast.error("No se pudo guardar los cambios en el proceso.");
            console.error("Error al guardar proceso:", error);
        }
    };

    return {
        pasosRenderizables,
        handleUpdateEvidencia,
        handleCompletarPaso,
        handleSaveChanges,
        isSaveDisabled
    };
};