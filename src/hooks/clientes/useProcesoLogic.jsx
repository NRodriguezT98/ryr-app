import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';
import { updateCliente, createNotification, anularCierreProceso } from '../../utils/storage';
import { parseDateAsUTC, formatDisplayDate, getTodayString, formatCurrency, toTitleCase } from '../../utils/textFormatters';
import { useAuth } from '../../context/AuthContext';


export const useProcesoLogic = (cliente, onSave, onDatosRecargados) => {
    const { userData } = useAuth();
    const userName = userData ? toTitleCase(`${userData.nombres} ${userData.apellidos}`) : 'Usuario Desconocido';

    const [procesoState, setProcesoState] = useState(cliente.proceso || {});
    const [initialProcesoState, setInitialProcesoState] = useState(cliente.proceso || {});

    const [pasoAReabrir, setPasoAReabrir] = useState(null);
    const [pasoAEditarFecha, setPasoAEditarFecha] = useState(null);
    const [cierreAAnular, setCierreAAnular] = useState(false);
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
                fechaUltimaModificacion: getTodayString()
            }
        }));
        setPasoAEditarFecha(null);
        toast.success("Fecha y motivo actualizados.");
    }, []);

    const cancelarEdicionFecha = useCallback(() => setPasoAEditarFecha(null), []);

    const iniciarAnulacionCierre = useCallback(() => {
        setCierreAAnular(true);
    }, []);

    const cancelarAnulacionCierre = useCallback(() => {
        setCierreAAnular(false);
    }, []);

    const confirmarAnulacionCierre = useCallback(async () => {
        try {
            await anularCierreProceso(cliente.id);
            toast.success("¡Cierre anulado! El último paso ha sido reabierto.");
            onDatosRecargados();
        } catch (error) {
            console.error("Error al anular el cierre:", error);
            toast.error("No se pudo anular el cierre del proceso.");
        } finally {
            setCierreAAnular(false);
        }
    }, [cliente.id, onDatosRecargados]);

    const { pasosRenderizables, validationErrors, progreso, hayPasoEnReapertura, procesoCompletado } = useMemo(() => {
        const errores = {};
        const fechaDeInicio = cliente.fechaInicioProceso || cliente.datosCliente.fechaIngreso;
        const fechaInicioProceso = parseDateAsUTC(fechaDeInicio);
        const hoy = parseDateAsUTC(getTodayString());

        const pasosAplicables = PROCESO_CONFIG.filter(paso => paso.aplicaA(cliente.financiero || {}));

        pasosAplicables.forEach(pasoConfig => {
            const pasoActual = procesoState[pasoConfig.key];
            if (pasoActual?.completado) {
                const todasEvidenciasPresentes = pasoConfig.evidenciasRequeridas.every(
                    ev => pasoActual.evidencias?.[ev.id]?.url
                );
                if (!todasEvidenciasPresentes) {
                    errores[pasoConfig.key] = "Faltan evidencias requeridas en este paso completado.";
                }

                if (pasoActual.fecha) {
                    const fechaSeleccionada = parseDateAsUTC(pasoActual.fecha);
                    if (fechaSeleccionada > hoy && !errores[pasoConfig.key]) {
                        errores[pasoConfig.key] = "La fecha no puede ser futura.";
                    } else if (fechaSeleccionada < fechaInicioProceso && !errores[pasoConfig.key]) {
                        errores[pasoConfig.key] = `La fecha no puede ser anterior al inicio del proceso (${formatDisplayDate(fechaDeInicio)}).`;
                    }
                } else if (!errores[pasoConfig.key]) {
                    errores[pasoConfig.key] = "Se requiere una fecha para este paso completado.";
                }
            }
        });

        let ultimaFechaValida = fechaDeInicio;
        pasosAplicables.forEach(pasoConfig => {
            const pasoActual = procesoState[pasoConfig.key];
            if (pasoActual?.completado && pasoActual.fecha && !errores[pasoConfig.key]) {
                if (parseDateAsUTC(pasoActual.fecha) > parseDateAsUTC(ultimaFechaValida)) {
                    ultimaFechaValida = pasoActual.fecha;
                }
            }
        });


        const algunPasoEnReapertura = pasosAplicables.some(pasoConfig => {
            const estadoInicial = initialProcesoState[pasoConfig.key];
            const estadoActual = procesoState[pasoConfig.key];
            return estadoInicial?.completado === true && estadoActual?.completado === false;
        });

        let previousStepCompleted = true;
        let primerPasoIncompletoEncontrado = false;

        const isStepValidAndCompletedGlobal = (key) => procesoState[key]?.completado && !errores[key];
        const allPreviousStepsForInvoiceCompleted = pasosAplicables.filter(p => p.key !== 'facturaVenta').every(p => isStepValidAndCompletedGlobal(p.key));

        const fechaBoletaRegistro = isStepValidAndCompletedGlobal('pagoBoletaRegistro') ? procesoState['pagoBoletaRegistro'].fecha : null;

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
            const isStepValidAndCompleted = (key) => procesoState[key]?.completado && !errores[key];

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

            let ultimoHitoIndex = -1;
            for (let i = pasosAplicables.length - 1; i >= 0; i--) {
                const paso = pasosAplicables[i];
                if (paso.esHito && procesoState[paso.key]?.completado && procesoState[paso.key]?.fecha) {
                    ultimoHitoIndex = i;
                    break;
                }
            }
            const isPermanentlyLocked = ultimoHitoIndex !== -1 && index <= ultimoHitoIndex;

            let esSiguientePaso = false;
            if (!isLocked && !pasoData.completado && !primerPasoIncompletoEncontrado) {
                esSiguientePaso = true;
                primerPasoIncompletoEncontrado = true;
            }

            const todasEvidenciasSubidas = pasoConfig.evidenciasRequeridas.every(ev => pasoData.evidencias?.[ev.id]?.url);
            const puedeCompletarse = todasEvidenciasSubidas && !pasoData.completado && !isLocked;

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

        const pasosCompletados = resultado.filter(p => p.data?.completado && !p.error).length;
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

    // 🔽 NUEVO: bloquear Guardar si hay cambios en pasos aún no completados
    const hayCambiosPendientesPorCompletar = useMemo(() => {
        const pasosAplicables = PROCESO_CONFIG.filter(p => p.aplicaA(cliente.financiero || {}));
        return pasosAplicables.some(paso => {
            const prev = initialProcesoState[paso.key] || {};
            const curr = procesoState[paso.key] || {};
            const changed = JSON.stringify(curr) !== JSON.stringify(prev);
            return changed && !curr.completado; // cambios pero el paso no está completado aún
        });
    }, [procesoState, initialProcesoState, cliente.financiero]);

    const isSaveDisabled = useMemo(() => {
        if (Object.keys(validationErrors).length > 0) return true;
        if (hayPasoEnReapertura) return true; // bloqueo existente
        if (hayCambiosPendientesPorCompletar) return true; // 🔽 NUEVA REGLA
        if (!hayCambiosSinGuardar) return true;
        return false;
    }, [validationErrors, hayPasoEnReapertura, hayCambiosPendientesPorCompletar, hayCambiosSinGuardar]);

    const tooltipMessage = useMemo(() => {
        if (isSaveDisabled) {
            if (Object.keys(validationErrors).length > 0) {
                return "Hay errores en el proceso. Revisa los pasos marcados en rojo.";
            }
            if (hayPasoEnReapertura) {
                return "Hay un paso reabierto que debe ser completado antes de guardar.";
            }
            if (hayCambiosPendientesPorCompletar) {
                return "Hay cambios en pasos aún no completados. Marca el paso como 'Completado' antes de guardar.";
            }
            return 'No hay cambios para guardar.';
        }
        return 'Guardar los cambios realizados';
    }, [isSaveDisabled, validationErrors, hayPasoEnReapertura, hayCambiosPendientesPorCompletar]);

    const handleSaveChanges = async () => {
        if (isSaveDisabled) {
            toast.error(tooltipMessage);
            return;
        }
        try {
            await onSave(procesoState, userName);

            PROCESO_CONFIG.forEach(paso => {
                const estadoAnterior = initialProcesoState[paso.key];
                const estadoNuevo = procesoState[paso.key];
                if (paso.esHito && !estadoAnterior?.completado && estadoNuevo?.completado) {
                    const nombreCliente = toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`);
                    createNotification('hito', `¡Hito alcanzado! ${paso.label} para ${nombreCliente}.`, `/clientes/detalle/${cliente.id}`);
                }
            });

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
        cierreAAnular,
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
            iniciarAnulacionCierre,
            cancelarAnulacionCierre,
            confirmarAnulacionCierre,
            handleSaveChanges,
        }
    };
};
