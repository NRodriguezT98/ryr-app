import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';
import { updateCliente } from '../../utils/storage';
import { parseDateAsUTC, formatDisplayDate, getTodayString, formatCurrency } from '../../utils/textFormatters';

export const useProcesoLogic = (cliente, onSave) => {
    const [procesoState, setProcesoState] = useState(cliente.proceso || {});
    const [initialProcesoState, setInitialProcesoState] = useState(cliente.proceso || {});

    const [pasoAReabrir, setPasoAReabrir] = useState(null);
    const [pasoAEditarFecha, setPasoAEditarFecha] = useState(null);
    const [justSaved, setJustSaved] = useState(false);

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
            return { ...prev, [pasoKey]: { ...pasoActual, evidencias: nuevasEvidencias } };
        });
    }, []);

    const handleCompletarPaso = useCallback((pasoKey, fecha) => {
        setProcesoState(prev => ({
            ...prev,
            [pasoKey]: { ...prev[pasoKey], completado: true, fecha }
        }));
    }, []);

    const iniciarReapertura = useCallback((pasoKey) => setPasoAReabrir(pasoKey), []);

    const confirmarReapertura = useCallback(() => {
        if (!pasoAReabrir) return;
        setProcesoState(prev => {
            const newState = { ...prev };
            newState[pasoAReabrir] = { ...newState[pasoAReabrir], completado: false, fecha: null, motivoUltimoCambio: 'Paso reabierto', fechaUltimaModificacion: getTodayString() };
            return newState;
        });
        setPasoAReabrir(null);
    }, [pasoAReabrir]);

    const cancelarReapertura = useCallback(() => setPasoAReabrir(null), []);

    const deshacerReapertura = useCallback((pasoKey) => {
        setProcesoState(prev => ({ ...prev, [pasoKey]: initialProcesoState[pasoKey] }));
        toast.success('Reapertura cancelada.');
    }, [initialProcesoState]);

    const iniciarEdicionFecha = useCallback((pasoKey) => setPasoAEditarFecha({ key: pasoKey, fecha: procesoState[pasoKey].fecha, motivo: '' }), [procesoState]);

    // --- INICIO DE LA MODIFICACIÓN ---
    const confirmarEdicionFecha = useCallback((pasoKey, nuevaFecha, motivo) => {
        if (!motivo.trim()) {
            toast.error("El motivo del cambio es obligatorio.");
            return;
        }
        setProcesoState(prev => ({
            ...prev,
            [pasoKey]: {
                ...prev[pasoKey],
                fecha: nuevaFecha,
                motivoUltimoCambio: motivo,
                fechaUltimaModificacion: getTodayString() // Guardamos la fecha de hoy como fecha de modificación
            }
        }));
        setPasoAEditarFecha(null);
        toast.success("Fecha y motivo actualizados.");
    }, []);
    // --- FIN DE LA MODIFICACIÓN ---

    const cancelarEdicionFecha = useCallback(() => setPasoAEditarFecha(null), []);

    const { pasosRenderizables, validationErrors, progreso, hayPasoEnReapertura, procesoCompletado } = useMemo(() => {
        const errores = {};
        const fechaDeInicio = cliente.fechaInicioProceso || cliente.datosCliente.fechaIngreso;
        let ultimaFechaValida = fechaDeInicio;
        const fechaInicioProceso = parseDateAsUTC(fechaDeInicio);
        const hoy = parseDateAsUTC(getTodayString());

        const pasosAplicables = PROCESO_CONFIG.filter(paso => paso.aplicaA(cliente.financiero || {}));
        const isStepValidAndCompletedGlobal = (key) => procesoState[key]?.completado && procesoState[key]?.fecha && !errores[key];

        const fechaBoletaRegistro = isStepValidAndCompletedGlobal('pagoBoletaRegistro') ? procesoState['pagoBoletaRegistro'].fecha : null;

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
            if (pasoActual?.completado && pasoActual.fecha) {
                const fechaSeleccionada = parseDateAsUTC(pasoActual.fecha);
                let fechaMinima = parseDateAsUTC(ultimaFechaValida);
                let etiquetaFechaMinima = `último paso válido (${formatDisplayDate(ultimaFechaValida)})`;

                if (['solicitudDesembolsoCredito', 'solicitudDesembolsoMCY', 'solicitudDesembolsoCaja'].includes(paso.key) && fechaBoletaRegistro) {
                    fechaMinima = parseDateAsUTC(fechaBoletaRegistro);
                    etiquetaFechaMinima = `boleta de registro (${formatDisplayDate(fechaBoletaRegistro)})`;
                }

                if (fechaSeleccionada > hoy) {
                    errores[paso.key] = "La fecha no puede ser futura.";
                } else if (fechaSeleccionada < fechaInicioProceso) {
                    errores[paso.key] = `La fecha no puede ser anterior al inicio del proceso (${formatDisplayDate(fechaDeInicio)}).`;
                } else if (fechaSeleccionada < fechaMinima) {
                    errores[paso.key] = `La fecha no puede ser anterior a la ${etiquetaFechaMinima}.`;
                } else {
                    ultimaFechaValida = pasoActual.fecha;
                }
            } else if (pasoActual?.completado && !pasoActual.fecha) {
                errores[paso.key] = "Se requiere una fecha.";
            }
        });

        let previousStepCompleted = true;
        let primerPasoIncompletoEncontrado = false;
        let algunPasoEnReapertura = false;

        const allPreviousStepsForInvoiceCompleted = pasosAplicables.filter(p => p.key !== 'facturaVenta').every(p => isStepValidAndCompletedGlobal(p.key));

        let maxDateBeforeInvoice = fechaDeInicio;
        pasosAplicables.forEach(paso => {
            if (paso.key !== 'facturaVenta' && isStepValidAndCompletedGlobal(paso.key)) {
                const fechaPaso = procesoState[paso.key]?.fecha;
                if (fechaPaso && parseDateAsUTC(fechaPaso) > parseDateAsUTC(maxDateBeforeInvoice)) {
                    maxDateBeforeInvoice = fechaPaso;
                }
            }
        });

        const resultado = pasosAplicables.map((pasoConfig, index) => {
            const pasoData = procesoState[pasoConfig.key] || { completado: false, fecha: null, evidencias: {} };
            const isStepValidAndCompleted = (key) => procesoState[key]?.completado && procesoState[key]?.fecha && !errores[key];

            let previousStepDate = fechaDeInicio;
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

            let isLocked = !previousStepCompleted;
            switch (pasoConfig.key) {
                case 'solicitudDesembolsoCredito': case 'solicitudDesembolsoMCY': case 'solicitudDesembolsoCaja':
                    isLocked = !isBoletaRegistroCompleted; break;
                case 'desembolsoCredito': isLocked = !isStepValidAndCompleted('solicitudDesembolsoCredito'); break;
                case 'desembolsoMCY': isLocked = !isStepValidAndCompleted('solicitudDesembolsoMCY'); break;
                case 'desembolsoCaja': isLocked = !isStepValidAndCompleted('solicitudDesembolsoCaja'); break;
                case 'facturaVenta': isLocked = !allPreviousStepsForInvoiceCompleted; break;
            }

            let facturaBloqueadaPorSaldo = false;
            if (pasoConfig.key === 'facturaVenta' && !isLocked) {
                const saldoPendiente = cliente.vivienda?.saldoPendiente ?? 1;
                if (saldoPendiente > 0) {
                    isLocked = true;
                    facturaBloqueadaPorSaldo = true;
                }
            }

            if (!isStepValidAndCompleted(pasoConfig.key) && !pasoConfig.esAutomatico) {
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

            const initialPasoData = initialProcesoState[pasoConfig.key] || {};
            if (puedeCompletarse && initialPasoData.completado === true) {
                algunPasoEnReapertura = true;
            }

            let minDateForStep = previousStepDate;
            if (['solicitudDesembolsoCredito', 'solicitudDesembolsoMCY', 'solicitudDesembolsoCaja'].includes(pasoConfig.key)) {
                minDateForStep = fechaBoletaRegistro || fechaDeInicio;
            }
            if (pasoConfig.key === 'facturaVenta') {
                minDateForStep = maxDateBeforeInvoice;
            }

            return {
                ...pasoConfig,
                data: pasoData,
                isLocked: isLocked || isPermanentlyLocked,
                isPermanentlyLocked,
                puedeCompletarse,
                esSiguientePaso,
                error: errores[pasoConfig.key],
                minDate: minDateForStep,
                maxDate: getTodayString(),
                facturaBloqueadaPorSaldo
            };
        });

        const pasosCompletados = resultado.filter(p => p.data?.completado && p.data?.fecha && !p.error).length;
        const procesoEstaCompleto = pasosCompletados === resultado.length && resultado.length > 0;

        return {
            pasosRenderizables: resultado,
            validationErrors: errores,
            progreso: { completados: pasosCompletados, total: resultado.length },
            hayPasoEnReapertura: algunPasoEnReapertura,
            procesoCompletado: procesoEstaCompleto,
        };
    }, [cliente, procesoState, initialProcesoState]);

    const hayCambiosSinGuardar = useMemo(() => {
        return JSON.stringify(procesoState) !== JSON.stringify(initialProcesoState);
    }, [procesoState, initialProcesoState]);

    const isSaveDisabled = useMemo(() => {
        if (Object.keys(validationErrors).length > 0) return true;
        if (!hayCambiosSinGuardar) return true;
        if (hayPasoEnReapertura) return true;
        return false;
    }, [validationErrors, hayCambiosSinGuardar, hayPasoEnReapertura]);

    const tooltipMessage = useMemo(() => {
        if (isSaveDisabled) {
            if (Object.keys(validationErrors).length > 0) return 'Hay fechas incorrectas o faltantes.';
            if (hayPasoEnReapertura) {
                const pasoPendiente = pasosRenderizables.find(p => p.puedeCompletarse);
                const nombrePaso = pasoPendiente.label.substring(pasoPendiente.label.indexOf('.') + 1).trim();
                return `Debes marcar el paso "${nombrePaso}" como completado o cancelar la reapertura.`;
            }

            const pasoFactura = pasosRenderizables.find(p => p.key === 'facturaVenta');
            if (pasoFactura?.isLocked && pasoFactura.esSiguientePaso) {
                const saldo = cliente.vivienda?.saldoPendiente ?? 0;
                if (saldo > 0) {
                    return `La vivienda debe estar 100% pagada para generar la factura. Saldo pendiente: ${formatCurrency(saldo)}`;
                }
            }

            return 'No hay cambios para guardar.';
        }
        return 'Guardar los cambios realizados';
    }, [isSaveDisabled, validationErrors, pasosRenderizables, hayPasoEnReapertura, cliente.vivienda]);

    const handleSaveChanges = async () => {
        if (isSaveDisabled) {
            toast.error(tooltipMessage);
            return;
        }
        try {
            await onSave(procesoState);
            toast.success("Proceso del cliente actualizado con éxito.");
            setInitialProcesoState(procesoState);
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 2000);
        } catch (error) {
            toast.error("No se pudo guardar los cambios en el proceso.");
            console.error("Error al guardar proceso:", error);
        }
    };

    return {
        pasosRenderizables,
        progreso,
        hayPasoEnReapertura,
        pasoAReabrir,
        pasoAEditarFecha,
        justSaved,
        isSaveDisabled,
        tooltipMessage,
        hayCambiosSinGuardar,
        procesoCompletado,
        handlers: {
            handleUpdateEvidencia,
            handleCompletarPaso,
            iniciarReapertura,
            confirmarReapertura,
            cancelarReapertura,
            deshacerReapertura,
            iniciarEdicionFecha,
            confirmarEdicionFecha,
            cancelarEdicionFecha,
            handleSaveChanges,
        }
    };
};