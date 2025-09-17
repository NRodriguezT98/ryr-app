import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';
import { generarActividadProceso, updateClienteProceso, anularCierreProceso, getClienteProceso } from "../../services/clienteService";
import { createNotification } from "../../services/notificationService";
import { parseDateAsUTC, formatDisplayDate, getTodayString, formatCurrency, toTitleCase } from '../../utils/textFormatters';
import { useAuth } from '../../context/AuthContext';

// 🔽 COPIA Y PEGA ESTE BLOQUE COMPLETO 🔽

const getPasosAplicables = (cliente) => PROCESO_CONFIG.filter(paso => paso.aplicaA(cliente.financiero || {}));

const validarPasos = (procesoState, pasosAplicables, cliente) => {
    const errores = {};
    const fechaDeInicio = cliente.fechaInicioProceso || cliente.datosCliente.fechaIngreso;
    const fechaInicioProceso = parseDateAsUTC(fechaDeInicio);
    const hoy = parseDateAsUTC(getTodayString());

    // Primera pasada: Validaciones individuales de cada paso
    pasosAplicables.forEach(pasoConfig => {
        const pasoActual = procesoState[pasoConfig.key];
        if (!pasoActual?.completado) return;

        const todasEvidenciasPresentes = pasoConfig.evidenciasRequeridas.every(
            ev => pasoActual.evidencias?.[ev.id]?.url
        );
        if (!todasEvidenciasPresentes) {
            errores[pasoConfig.key] = "Faltan evidencias requeridas.";
            return;
        }

        if (!pasoActual.fecha) {
            errores[pasoConfig.key] = "Se requiere una fecha.";
            return;
        }

        const fechaSeleccionada = parseDateAsUTC(pasoActual.fecha);
        if (fechaSeleccionada > hoy) {
            errores[pasoConfig.key] = "La fecha no puede ser futura.";
        } else if (fechaSeleccionada < fechaInicioProceso) {
            errores[pasoConfig.key] = `La fecha no puede ser anterior al inicio (${formatDisplayDate(fechaDeInicio)}).`;
        }
    });

    // Segunda pasada: Validación de consistencia cronológica entre pasos
    pasosAplicables.forEach((pasoConfig, index) => {
        const pasoActual = procesoState[pasoConfig.key];

        if (pasoActual?.completado && pasoActual.fecha && !errores[pasoConfig.key]) {
            let fechaMinimaReal = fechaDeInicio;
            let labelPasoAnterior = "inicio del proceso";
            const isSolicitudParalela = ['solicitudDesembolsoCredito', 'solicitudDesembolsoMCY', 'solicitudDesembolsoCaja'].includes(pasoConfig.key);

            if (isSolicitudParalela) {
                fechaMinimaReal = procesoState['pagoBoletaRegistro']?.fecha || fechaDeInicio;
                labelPasoAnterior = 'Pago de Boleta de Registro';
            } else {
                for (let i = index - 1; i >= 0; i--) {
                    const pasoPrevio = procesoState[pasosAplicables[i].key];
                    if (pasoPrevio?.completado && pasoPrevio?.fecha) {
                        fechaMinimaReal = pasoPrevio.fecha;
                        labelPasoAnterior = pasosAplicables[i].label;
                        break;
                    }
                }
            }

            if (parseDateAsUTC(pasoActual.fecha) < parseDateAsUTC(fechaMinimaReal)) {
                errores[pasoConfig.key] = `La fecha no puede ser anterior al paso "${labelPasoAnterior}" (${formatDisplayDate(fechaMinimaReal)}).`;
            }
        }
    });

    return errores;
};

const calcularEstadoYDependencias = (procesoState, pasosAplicables, validationErrors, cliente) => {
    let previousStepCompleted = true;
    let primerPasoIncompletoEncontrado = false;
    const fechaDeInicio = cliente.fechaInicioProceso || cliente.datosCliente.fechaIngreso;

    const isStepValidAndCompleted = (key) => procesoState[key]?.completado && !validationErrors[key];
    const allPreviousStepsForInvoiceCompleted = pasosAplicables.filter(p => p.key !== 'facturaVenta').every(p => isStepValidAndCompleted(p.key));
    const isBoletaRegistroCompleted = isStepValidAndCompleted('pagoBoletaRegistro');

    // Encontrar último hito completado para bloqueo permanente
    let ultimoHitoIndex = -1;
    for (let i = pasosAplicables.length - 1; i >= 0; i--) {
        const paso = pasosAplicables[i];
        if (paso.esHito && isStepValidAndCompleted(paso.key)) {
            ultimoHitoIndex = i;
            break;
        }
    }

    return pasosAplicables.map((pasoConfig, index) => {
        const pasoData = procesoState[pasoConfig.key] || { completado: false, fecha: null, evidencias: {} };
        const error = validationErrors[pasoConfig.key];

        // Lógica de bloqueo
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
            if ((cliente.vivienda?.saldoPendiente ?? 1) > 0) {
                isLocked = true;
                facturaBloqueadaPorSaldo = true;
            }
        }

        const isPermanentlyLocked = ultimoHitoIndex !== -1 && index <= ultimoHitoIndex;

        if (!isStepValidAndCompleted(pasoConfig.key) && !pasoConfig.esAutomatico) {
            previousStepCompleted = false;
        }

        // Lógica de "Siguiente Paso"
        let esSiguientePaso = false;
        if (!isLocked && !pasoData.completado && !primerPasoIncompletoEncontrado) {
            esSiguientePaso = true;
            primerPasoIncompletoEncontrado = true;
        }

        const todasEvidenciasSubidas = pasoConfig.evidenciasRequeridas.every(ev => pasoData.evidencias?.[ev.id]?.url);
        const puedeCompletarse = todasEvidenciasSubidas && !pasoData.completado && !isLocked;

        // Lógica de fechas
        let minDateForStep = fechaDeInicio;
        const isSolicitudParalela = ['solicitudDesembolsoCredito', 'solicitudDesembolsoMCY', 'solicitudDesembolsoCaja'].includes(pasoConfig.key);

        if (isSolicitudParalela) {
            // Para estas 3 solicitudes, la fecha mínima SIEMPRE es la de la boleta de registro.
            minDateForStep = procesoState['pagoBoletaRegistro']?.fecha || fechaDeInicio;
        } else {
            // Para todos los demás pasos, usamos la lógica lineal que ya teníamos.
            if (index > 0) {
                for (let i = index - 1; i >= 0; i--) {
                    const prevPasoKey = pasosAplicables[i].key;
                    if (isStepValidAndCompleted(prevPasoKey)) {
                        minDateForStep = procesoState[prevPasoKey].fecha;
                        break;
                    }
                }
            }
        }

        if (pasoConfig.key === 'facturaVenta') {
            let maxDateBeforeInvoice = fechaDeInicio;
            pasosAplicables.forEach(paso => {
                if (paso.key !== 'facturaVenta' && isStepValidAndCompleted(paso.key)) {
                    if (parseDateAsUTC(procesoState[paso.key].fecha) > parseDateAsUTC(maxDateBeforeInvoice)) {
                        maxDateBeforeInvoice = procesoState[paso.key].fecha;
                    }
                }
            });
            minDateForStep = maxDateBeforeInvoice;
        }

        // Calcular la fecha máxima basada en el siguiente paso completado.
        let maxDateForStep = getTodayString(); // Por defecto, el máximo es hoy.
        for (let i = index + 1; i < pasosAplicables.length; i++) {
            const nextPasoKey = pasosAplicables[i].key;
            if (isStepValidAndCompleted(nextPasoKey)) {
                // Encontramos el siguiente paso completado. Su fecha es nuestro máximo.
                maxDateForStep = procesoState[nextPasoKey].fecha;
                break; // No necesitamos seguir buscando.
            }
        }
        // Nos aseguramos de que la fecha máxima nunca sea mayor que hoy.
        if (parseDateAsUTC(maxDateForStep) > parseDateAsUTC(getTodayString())) {
            maxDateForStep = getTodayString();
        }

        let duracionDesdePasoAnterior = null;
        if (pasoData.completado && pasoData.fecha) {
            // Usamos la fecha mínima que ya habíamos calculado, que es la fecha
            // de finalización del último paso válido anterior.
            const fechaEstePaso = parseDateAsUTC(pasoData.fecha);
            const fechaPasoAnterior = parseDateAsUTC(minDateForStep);

            // Calculamos la diferencia en milisegundos y la convertimos a días
            const diffTime = Math.abs(fechaEstePaso - fechaPasoAnterior);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Solo mostramos la duración si es mayor a 0 días.
            if (diffDays > 0) {
                duracionDesdePasoAnterior = `${diffDays} día${diffDays > 1 ? 's' : ''}`;
            }
        }

        return {
            ...pasoConfig,
            data: pasoData,
            isLocked: isLocked || isPermanentlyLocked,
            isPermanentlyLocked,
            puedeCompletarse,
            esSiguientePaso,
            error,
            minDate: minDateForStep,
            maxDate: maxDateForStep,
            facturaBloqueadaPorSaldo,
            duracionDesdePasoAnterior,
            saldoPendiente: cliente.vivienda?.saldoPendiente ?? 0
        };
    });
};

export const useProcesoLogic = (cliente, onSaveSuccess) => {
    const { userData } = useAuth();
    const userName = userData ? toTitleCase(`${userData.nombres} ${userData.apellidos}`) : 'Usuario Desconocido';

    const [procesoState, setProcesoState] = useState(cliente.proceso || {});
    const [initialProcesoState, setInitialProcesoState] = useState(cliente.proceso || {});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setProcesoState(cliente.proceso || {});
        setInitialProcesoState(cliente.proceso || {});
    }, [cliente.id]);

    const [reaperturaInfo, setReaperturaInfo] = useState(null);
    const [pasoAEditarFecha, setPasoAEditarFecha] = useState(null);
    const [cierreAAnular, setCierreAAnular] = useState(null);
    const [justSaved, setJustSaved] = useState(false);
    const [anulacionCierreInfo, setAnulacionCierreInfo] = useState(null);

    // 1. Añadimos estados internos para la carga y los datos procesados
    const [isLoading, setIsLoading] = useState(true);
    const [datosProcesados, setDatosProcesados] = useState({
        pasosRenderizables: [],
        progreso: { completados: 0, total: 0 },
        hayPasoEnReapertura: false,
        procesoCompletado: false,
        validationErrors: {}
    });

    useEffect(() => {
        // 2. Realizamos el cálculo pesado DENTRO de un useEffect
        const pasosAplicables = getPasosAplicables(cliente);
        const errores = validarPasos(procesoState, pasosAplicables, cliente);
        const resultado = calcularEstadoYDependencias(procesoState, pasosAplicables, errores, cliente);

        const pasosCompletados = resultado.filter(p => p.data?.completado && !p.error).length;
        const procesoEstaCompleto = pasosCompletados === resultado.length && resultado.length > 0;

        const algunPasoEnReapertura = pasosAplicables.some(pasoConfig => {
            const estadoInicial = initialProcesoState[pasoConfig.key];
            const estadoActual = procesoState[pasoConfig.key];
            return estadoInicial?.completado === true && estadoActual?.completado === false;
        });

        // 3. Actualizamos el estado con los datos ya procesados
        setDatosProcesados({
            pasosRenderizables: resultado,
            validationErrors: errores,
            progreso: { completados: pasosCompletados, total: resultado.length },
            hayPasoEnReapertura: algunPasoEnReapertura,
            procesoCompletado: procesoEstaCompleto,
        });

        setIsLoading(false); // 4. Marcamos la carga como finalizada

    }, [cliente, procesoState, initialProcesoState]);


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

    const iniciarReapertura = useCallback((pasoKey) => setReaperturaInfo({ key: pasoKey, motivo: '' }), []);

    const confirmarReapertura = useCallback((motivo) => {
        if (!reaperturaInfo?.key || !motivo.trim()) return;

        setProcesoState(prev => {
            const newState = { ...prev };
            const pasoKey = reaperturaInfo.key;
            newState[pasoKey] = {
                ...newState[pasoKey],
                completado: false,
                fecha: null,
                motivoReapertura: motivo, // <-- Aquí guardamos el motivo
                motivoUltimoCambio: 'Paso reabierto',
                fechaUltimaModificacion: getTodayString()
            };
            return newState;
        });
        setReaperturaInfo(null);
    }, [reaperturaInfo]);

    const cancelarReapertura = useCallback(() => setReaperturaInfo(null), []);

    const descartarCambiosEnPaso = useCallback((pasoKey) => {
        setProcesoState(prev => ({ ...prev, [pasoKey]: initialProcesoState[pasoKey] || { completado: false, fecha: null, evidencias: {} } }));
        toast('Cambios en el paso descartados.', { icon: '↩️' });
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
        setCierreAAnular({ type: 'anulacion' });
    }, []);

    const cancelarAnulacionCierre = useCallback(() => {
        setCierreAAnular(null);
    }, []);

    const confirmarAnulacionCierre = useCallback(async (motivo) => {
        if (!motivo || !motivo.trim()) {
            toast.error("El motivo es obligatorio.");
            return;
        }
        try {
            await anularCierreProceso(cliente.id, userName, motivo);
            toast.success("¡Cierre anulado! El último paso ha sido reabierto.");

            const procesoRefrescado = await getClienteProceso(cliente.id);
            setProcesoState(procesoRefrescado);
            setInitialProcesoState(procesoRefrescado);

            if (onSaveSuccess) onSaveSuccess();
        } catch (error) {
            console.error("Error al anular el cierre:", error);
            toast.error("No se pudo anular el cierre del proceso.");
        } finally {
            setCierreAAnular(null);
        }
    }, [cliente.id, onSaveSuccess, userName, procesoState]);

    // 🔽 REEMPLAZA EL useMemo ANTIGUO CON ESTE 🔽
    const { pasosRenderizables, validationErrors, progreso, hayPasoEnReapertura, procesoCompletado } = useMemo(() => {
        // 1. Obtener los pasos que aplican a este cliente específico
        const pasosAplicables = getPasosAplicables(cliente);

        // 2. Validar el estado actual del proceso
        const errores = validarPasos(procesoState, pasosAplicables, cliente);

        // 3. Calcular estados derivados (bloqueos, fechas, etc.)
        const resultado = calcularEstadoYDependencias(procesoState, pasosAplicables, errores, cliente);

        // 4. Calcular datos finales para la UI
        const pasosCompletados = resultado.filter(p => p.data?.completado && !p.error).length;
        const procesoEstaCompleto = pasosCompletados === resultado.length && resultado.length > 0;

        const algunPasoEnReapertura = pasosAplicables.some(pasoConfig => {
            const estadoInicial = initialProcesoState[pasoConfig.key];
            const estadoActual = procesoState[pasoConfig.key];
            return estadoInicial?.completado === true && estadoActual?.completado === false;
        });

        return {
            pasosRenderizables: resultado,
            validationErrors: errores,
            progreso: { completados: pasosCompletados, total: resultado.length },
            hayPasoEnReapertura: algunPasoEnReapertura,
            procesoCompletado: procesoEstaCompleto,
        };

    }, [cliente, procesoState, initialProcesoState]);
    //

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
        if (isSaveDisabled || isSubmitting) {
            toast.error(tooltipMessage);
            return;
        }

        setIsSubmitting(true);
        try {
            const procesoActualEnDB = await getClienteProceso(cliente.id);
            if (JSON.stringify(initialProcesoState) !== JSON.stringify(procesoActualEnDB)) {
                toast.error("⚠️ ¡Conflicto de datos! Alguien más ha guardado cambios. Por favor, recarga la página.", { duration: 6000 });
                setIsSubmitting(false);
                return;
            }

            const procesoConActividad = generarActividadProceso(initialProcesoState, procesoState, userName);

            const cambiosDetectados = [];
            let motivoReaperturaParaLog = null;

            PROCESO_CONFIG
                .filter(p => p.aplicaA(cliente.financiero || {}))
                .forEach(pasoConfig => {
                    const key = pasoConfig.key;
                    const estadoInicial = initialProcesoState[key] || {};
                    const estadoActual = procesoState[key] || {};

                    if (JSON.stringify(estadoInicial) !== JSON.stringify(estadoActual)) {
                        const nombrePaso = pasoConfig.label.substring(pasoConfig.label.indexOf('.') + 1).trim();
                        cambiosDetectados.push({
                            paso: nombrePaso,
                            key: key,
                            estadoInicial: estadoInicial,
                            estadoActual: estadoActual
                        });

                        if (estadoActual.motivoReapertura) {
                            motivoReaperturaParaLog = estadoActual.motivoReapertura;
                        }
                    }
                });

            const clienteNombre = toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`);
            let auditMessage;

            // --- INICIO DE LA SOLUCIÓN ---
            if (motivoReaperturaParaLog && cambiosDetectados.length > 0) {
                const cambio = cambiosDetectados[0];
                let accionesPosteriores = [];

                // Comprobamos si la fecha cambió
                if (cambio.estadoInicial.fecha !== cambio.estadoActual.fecha) {
                    accionesPosteriores.push(`se modificó la fecha de completado de ${formatDisplayDate(cambio.estadoInicial.fecha)} a ${formatDisplayDate(cambio.estadoActual.fecha)}`);
                }

                // Comprobamos si las evidencias cambiaron
                const evidenciasConfig = PROCESO_CONFIG.find(p => p.key === cambio.key)?.evidenciasRequeridas || [];
                const evidenciasCambiadas = [];
                evidenciasConfig.forEach(ev => {
                    const urlOriginal = cambio.estadoInicial.evidencias?.[ev.id]?.url;
                    const urlActual = cambio.estadoActual.evidencias?.[ev.id]?.url;
                    if (urlActual !== urlOriginal) {
                        evidenciasCambiadas.push(`se ${urlActual ? (urlOriginal ? 'reemplazó' : 'subió') : 'eliminó'} la evidencia '${ev.label}'`);
                    }
                });
                if (evidenciasCambiadas.length > 0) {
                    accionesPosteriores.push(evidenciasCambiadas.join(' y '));
                }

                // Construimos el mensaje final al pie de la letra
                auditMessage = `Se reabrió el paso y ${accionesPosteriores.join(' y ')}. El Motivo de la reapertura fue: "${motivoReaperturaParaLog}".`;

                // Si además de todo, se recompletó el paso, lo añadimos
                if (!cambio.estadoInicial.completado && cambio.estadoActual.completado) {
                    auditMessage += " Finalmente, se completó el paso.";
                }

            } else if (cambiosDetectados.length > 0) {
                const cambiosTexto = cambiosDetectados.map(c =>
                    `${c.estadoActual.completado ? 'Completó' : 'Reabrió'} el paso '${c.paso}'`
                ).join(', ');
                auditMessage = `Actualizó el proceso del cliente ${clienteNombre}. Cambios: ${cambiosTexto}.`;
            }
            // --- FIN DE LA SOLUCIÓN ---

            const auditDetails = {
                action: 'UPDATE_PROCESO',
                clienteId: cliente.id,
                clienteNombre: clienteNombre,
                cambios: cambiosDetectados.map(c => ({ paso: c.paso, accion: c.estadoActual.completado ? 'completó' : 'reabrió' })),
                motivo: motivoReaperturaParaLog
            };

            if (cambiosDetectados.length > 0) {
                await updateClienteProceso(cliente.id, procesoConActividad, auditMessage, auditDetails);
            }

            toast.success("Proceso del cliente actualizado con éxito.");

            const procesoRefrescado = await getClienteProceso(cliente.id);
            setInitialProcesoState(procesoRefrescado);
            setProcesoState(procesoRefrescado);

            if (onSaveSuccess) onSaveSuccess();

        } catch (error) {
            console.error("Error al guardar proceso:", error);
            toast.error("No se pudo guardar los cambios en el proceso.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isLoadingProceso: isLoading,
        pasosRenderizables: datosProcesados.pasosRenderizables,
        progreso: datosProcesados.progreso,
        hayPasoEnReapertura: datosProcesados.hayPasoEnReapertura,
        procesoCompletado: datosProcesados.procesoCompletado,
        validationErrors: datosProcesados.validationErrors,
        reaperturaInfo,
        pasoAEditarFecha,
        cierreAAnular,
        justSaved,
        isSaveDisabled,
        tooltipMessage,
        isSubmitting,
        hayCambiosSinGuardar,
        handlers: {
            handleUpdateEvidencia,
            handleCompletarPaso,
            iniciarReapertura,
            confirmarReapertura,
            cancelarReapertura,
            descartarCambiosEnPaso,
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
