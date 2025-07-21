import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';
import { updateCliente } from '../../utils/storage';
import { parseDateAsUTC, formatDisplayDate, getTodayString } from '../../utils/textFormatters';

export const useProcesoLogic = (cliente, onSave) => {
    const [procesoState, setProcesoState] = useState(cliente.proceso || {});
    const [initialProcesoState, setInitialProcesoState] = useState(cliente.proceso || {});

    useEffect(() => {
        setProcesoState(cliente.proceso || {});
        setInitialProcesoState(cliente.proceso || {});
    }, [cliente.proceso]);

    const handleUpdateEvidencia = useCallback((pasoKey, evidenciaId, url) => {
        setProcesoState(prev => {
            const pasoActual = prev[pasoKey] || { completado: false, fecha: null, evidencias: {} };
            const nuevasEvidencias = {
                ...pasoActual.evidencias,
                [evidenciaId]: { url, estado: url ? 'subido' : 'pendiente', fechaSubida: url ? getTodayString() : null }
            };
            const pasoActualizado = { ...pasoActual, evidencias: nuevasEvidencias };
            return { ...prev, [pasoKey]: pasoActualizado };
        });
    }, []);

    const handleCompletarPaso = useCallback((pasoKey, fecha) => {
        setProcesoState(prev => ({
            ...prev,
            [pasoKey]: { ...prev[pasoKey], completado: true, fecha: fecha }
        }));
    }, []);

    const handleDateChange = useCallback((pasoKey, nuevaFecha) => {
        setProcesoState(prev => {
            const newProceso = { ...prev };
            if (newProceso[pasoKey]) {
                newProceso[pasoKey].fecha = nuevaFecha;
                if (!nuevaFecha) {
                    newProceso[pasoKey].completado = false;
                }
            }
            return newProceso;
        });
    }, []);

    const handleReabrirPaso = useCallback((pasoKey) => {
        setProcesoState(prev => {
            const newProceso = { ...prev };
            if (newProceso[pasoKey]) {
                newProceso[pasoKey].completado = false;
                newProceso[pasoKey].fecha = null;
            }
            return newProceso;
        });
    }, []);

    const { pasosRenderizables, validationErrors, progreso } = useMemo(() => {
        const errores = {};
        let ultimaFechaValida = cliente.datosCliente.fechaIngreso;
        const fechaInicioProceso = parseDateAsUTC(cliente.datosCliente.fechaIngreso);
        const hoy = parseDateAsUTC(getTodayString());

        const pasosAplicables = PROCESO_CONFIG.filter(paso => paso.aplicaA(cliente.financiero || {}));

        let ultimoHitoIndex = -1;
        for (let i = pasosAplicables.length - 1; i >= 0; i--) {
            const paso = pasosAplicables[i];
            if (paso.esHito && procesoState[paso.key]?.completado && procesoState[paso.key]?.fecha) {
                ultimoHitoIndex = i;
                break;
            }
        }

        pasosAplicables.forEach(paso => {
            const pasoActual = procesoState[paso.key];
            if (pasoActual?.completado) {
                if (!pasoActual.fecha) {
                    errores[paso.key] = "Se requiere una fecha.";
                } else {
                    const fechaSeleccionada = parseDateAsUTC(pasoActual.fecha);
                    if (fechaSeleccionada > hoy) {
                        errores[paso.key] = "La fecha no puede ser futura.";
                    } else if (fechaSeleccionada < fechaInicioProceso) {
                        errores[paso.key] = `La fecha no puede ser anterior al inicio del proceso (${formatDisplayDate(cliente.datosCliente.fechaIngreso)}).`;
                    } else if (parseDateAsUTC(ultimaFechaValida) > fechaSeleccionada) {
                        errores[paso.key] = `La fecha no puede ser anterior al último paso válido (${formatDisplayDate(ultimaFechaValida)}).`;
                    } else {
                        ultimaFechaValida = pasoActual.fecha;
                    }
                }
            }
        });

        let previousStepCompleted = true;
        let primerPasoIncompletoEncontrado = false;

        const resultado = pasosAplicables.map((pasoConfig, index) => {
            const pasoData = procesoState[pasoConfig.key] || { completado: false, fecha: null, evidencias: {} };
            const isStepValidAndCompleted = (key) => procesoState[key]?.completado && procesoState[key]?.fecha && !errores[key];

            let previousStepDate = cliente.datosCliente.fechaIngreso;
            if (index > 0) {
                for (let i = index - 1; i >= 0; i--) {
                    const prevPasoKey = pasosAplicables[i].key;
                    if (isStepValidAndCompleted(prevPasoKey)) {
                        previousStepDate = procesoState[prevPasoKey].fecha;
                        break;
                    }
                }
            }

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

            const isPermanentlyLocked = ultimoHitoIndex !== -1 && index <= ultimoHitoIndex;

            let esSiguientePaso = false;
            if (!isLocked && !pasoData.completado && !primerPasoIncompletoEncontrado) {
                esSiguientePaso = true;
                primerPasoIncompletoEncontrado = true;
            }

            const todasEvidenciasSubidas = pasoConfig.evidenciasRequeridas.every(ev => pasoData.evidencias?.[ev.id]?.url);
            const puedeCompletarse = todasEvidenciasSubidas && !pasoData.completado && !isLocked;

            return {
                ...pasoConfig,
                data: pasoData,
                isLocked: isLocked || isPermanentlyLocked,
                isPermanentlyLocked,
                puedeCompletarse,
                esSiguientePaso,
                error: errores[pasoConfig.key],
                minDate: previousStepDate,
                maxDate: getTodayString()
            };
        });

        const pasosCompletados = resultado.filter(p => p.data?.completado && p.data?.fecha && !p.error).length;

        return {
            pasosRenderizables: resultado,
            validationErrors: errores,
            progreso: {
                completados: pasosCompletados,
                total: resultado.length
            }
        };
    }, [cliente, procesoState]);

    const isSaveDisabled = useMemo(() => {
        if (Object.keys(validationErrors).length > 0) return true;
        if (JSON.stringify(procesoState) === JSON.stringify(initialProcesoState)) return true;
        for (const paso of pasosRenderizables) {
            if (!paso.data?.completado) {
                const evidenciasSubidas = Object.values(paso.data?.evidencias || {}).filter(e => e.url).length;
                const evidenciasRequeridas = paso.evidenciasRequeridas.length;
                if (evidenciasSubidas > 0 && evidenciasSubidas < evidenciasRequeridas) {
                    return true;
                }
            }
        }
        return false;
    }, [procesoState, initialProcesoState, validationErrors, pasosRenderizables]);

    const tooltipMessage = useMemo(() => {
        if (isSaveDisabled) {
            if (Object.keys(validationErrors).length > 0) return 'Hay fechas incorrectas o faltantes.';
            for (const paso of pasosRenderizables) {
                const evidenciasSubidas = Object.values(paso.data?.evidencias || {}).filter(e => e.url).length;
                const evidenciasRequeridas = paso.evidenciasRequeridas.length;
                if (evidenciasSubidas > 0 && evidenciasSubidas < evidenciasRequeridas) {
                    return `El paso "${paso.label}" tiene evidencias pendientes.`;
                }
            }
            return 'No hay cambios para guardar.';
        }
        return 'Guardar los cambios realizados';
    }, [isSaveDisabled, validationErrors, pasosRenderizables, initialProcesoState, procesoState]);


    const handleSaveChanges = async () => {
        if (isSaveDisabled) {
            toast.error(tooltipMessage);
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
        handleDateChange,
        handleReabrirPaso,
        handleSaveChanges,
        isSaveDisabled,
        tooltipMessage,
        progreso
    };
};