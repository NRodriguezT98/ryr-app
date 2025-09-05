import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';
import { generarActividadProceso, updateCliente, anularCierreProceso, getClienteProceso } from "../../services/clienteService";
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

export const useProcesoLogic = (cliente, onSave, onDatosRecargados) => {
    const { userData } = useAuth();
    const userName = userData ? toTitleCase(`${userData.nombres} ${userData.apellidos}`) : 'Usuario Desconocido';

    const [procesoState, setProcesoState] = useState(cliente.proceso || {});
    const [initialProcesoState, setInitialProcesoState] = useState(cliente.proceso || {});

    const [reaperturaInfo, setReaperturaInfo] = useState(null);
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
        if (isSaveDisabled) {
            toast.error(tooltipMessage);
            return;
        }
        try {
            // 1. Validación de Concurrencia (datos obsoletos)
            const procesoActualEnDB = await getClienteProceso(cliente.id);
            if (JSON.stringify(initialProcesoState) !== JSON.stringify(procesoActualEnDB)) {
                toast.error(
                    "⚠️ ¡Conflicto de datos! Alguien más ha guardado cambios. Por favor, recarga la página.",
                    { duration: 6000 }
                );
                return; // Detenemos el guardado
            }

            // 2. Generamos el estado final con el historial de actividad
            const procesoConActividad = generarActividadProceso(
                initialProcesoState,
                procesoState,
                userName
            );

            // 3. Guardamos la versión final y correcta
            await onSave(procesoConActividad, userName);

            // 4. Creamos notificaciones si se alcanzó un hito
            PROCESO_CONFIG.forEach(paso => {
                const estadoAnterior = initialProcesoState[paso.key];
                const estadoNuevo = procesoConActividad[paso.key];
                if (paso.esHito && !estadoAnterior?.completado && estadoNuevo?.completado) {
                    const nombreCliente = toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`);
                    createNotification('hito', `¡Hito alcanzado! ${paso.label} para ${nombreCliente}.`, `/clientes/detalle/${cliente.id}`);
                }
            });

            toast.success("Proceso del cliente actualizado con éxito.");

            // 5. Sincronizamos ambos estados locales para evitar bugs visuales
            setInitialProcesoState(procesoConActividad);
            setProcesoState(procesoConActividad);

            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 2000);

        } catch (error) {
            // Manejo de errores (ej. cliente no encontrado en la validación)
            if (error.message === 'CLIENT_NOT_FOUND') {
                toast.error("Error: No se pudo encontrar el cliente en la base de datos. Pudo haber sido eliminado.");
            } else {
                toast.error("No se pudo guardar los cambios en el proceso.");
            }
            console.error("Error al guardar proceso:", error);
        }
    };


    return {
        pasosRenderizables,
        progreso,
        hayPasoEnReapertura,
        reaperturaInfo,
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
