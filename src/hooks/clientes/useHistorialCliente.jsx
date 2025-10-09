// En src/hooks/clientes/useHistorialCliente.jsx

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getAuditLogsForCliente } from '../../services/auditService';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/textFormatters';

// La función para generar el mensaje ahora vive dentro del hook

const formatFuentesDePago = (plan) => {
    if (!plan) return [];
    const fuentes = [];
    if (plan.aplicaCuotaInicial && plan.cuotaInicial?.monto > 0) {
        fuentes.push(`• Cuota Inicial: ${formatCurrency(plan.cuotaInicial.monto)}`);
    }
    if (plan.aplicaCredito && plan.credito?.monto > 0) {
        fuentes.push(`• Crédito Hipotecario: ${formatCurrency(plan.credito.monto)}`);
    }
    if (plan.aplicaSubsidioVivienda && plan.subsidioVivienda?.monto > 0) {
        fuentes.push(`• Subsidio Mi Casa Ya: ${formatCurrency(plan.subsidioVivienda.monto)}`);
    }
    if (plan.aplicaSubsidioCaja && plan.subsidioCaja?.monto > 0) {
        fuentes.push(`• Subsidio Caja (${plan.subsidioCaja.caja || 'N/A'}): ${formatCurrency(plan.subsidioCaja.monto)}`);
    }
    return fuentes;
};
const getDisplayMessage = (log, viviendas) => {
    const { details, message } = log;

    if (details?.action === 'ADD_NOTE') {
        return details.nota || log.message;
    }

    // Si es completar un paso del proceso, usar el mensaje de auditoría tal como viene
    if (details?.action === 'COMPLETE_PROCESS_STEP') {
        return log.message;
    }

    // Si es una actualización del proceso, usamos el mensaje de auditoría
    if (details?.action === 'UPDATE_PROCESO') {
        return log.message;
    }

    // Si es una actualización de cliente con cambios específicos, generamos mensaje detallado para TabHistorial
    if (details?.action === 'UPDATE_CLIENT' && details?.cambios && details.cambios.length > 0) {
        const cambios = details.cambios;
        const clienteNombre = details.clienteNombre || 'Cliente';
        const clienteId = details.clienteId || '';

        // Si solo hay un cambio, usar formato simplificado
        if (cambios.length === 1) {
            const cambio = cambios[0];

            // Mejorar el mensaje para archivos
            if (cambio.fileChange) {
                const tipo = cambio.fileChange.type;
                return `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${cambio.campo.toLowerCase()} del cliente ${clienteNombre} (C.C. ${clienteId})`;
            }

            // Para cambios normales (no archivos)
            return `Actualizó ${cambio.campo.toLowerCase()} del cliente ${clienteNombre} (C.C. ${clienteId}): de "${cambio.anterior}" → "${cambio.actual}"`;
        }

        // Si hay múltiples cambios, usar formato de lista
        const listaCambios = cambios.map(cambio => {
            // Mejorar el mensaje para archivos
            if (cambio.fileChange) {
                const tipo = cambio.fileChange.type;
                if (tipo === 'adjuntó') {
                    return `• ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${cambio.campo.toLowerCase()}`;
                } else if (tipo === 'eliminó') {
                    return `• ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${cambio.campo.toLowerCase()}`;
                } else if (tipo === 'reemplazó') {
                    return `• ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${cambio.campo.toLowerCase()}`;
                }
            }
            // Para cambios normales (no archivos)
            return `• ${cambio.campo}: de "${cambio.anterior}" → "${cambio.actual}"`;
        }).join('\n');

        return `Actualizó múltiples datos del cliente ${clienteNombre} (C.C. ${clienteId}):\n${listaCambios}`;
    }

    // Para otros casos, mantenemos la lógica anterior si es necesario
    // o simplemente devolvemos el mensaje por defecto.
    return log.message;
};


export const useHistorialCliente = (clienteId, options = {}) => {
    const { viviendas } = useData();
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isLoadingRef = useRef(false);
    const lastClienteIdRef = useRef(null);

    const fetchHistorial = useCallback(async () => {
        if (!clienteId) {
            setLoading(false);
            return;
        }

        // Evitar múltiples llamadas simultáneas
        if (isLoadingRef.current) {
            return;
        }

        // Si es el mismo cliente, no recargar
        if (lastClienteIdRef.current === clienteId && historial.length > 0) {
            return;
        }

        try {
            isLoadingRef.current = true;
            setLoading(true);
            setError(null);

            // Usar la función original que funciona
            const logs = await getAuditLogsForCliente(clienteId);

            // Filtrar EDIT_NOTE y duplicados de proceso
            let historialFiltrado = logs.filter(log => log.details && log.details.action !== 'EDIT_NOTE');

            // Eliminar duplicados por completar pasos del proceso (mantener solo el más específico)
            historialFiltrado = historialFiltrado.filter((log, index, array) => {
                // Si es un log de UPDATE_PROCESO, verificar si hay un COMPLETE_PROCESS_STEP cercano
                if (log.details.action === 'UPDATE_PROCESO') {
                    const logTime = log.timestamp?.toDate?.() || new Date(log.timestamp);

                    // Buscar si hay un COMPLETE_PROCESS_STEP en un rango de 10 segundos
                    const hasSpecificStepLog = array.some(otherLog => {
                        if (otherLog.details.action === 'COMPLETE_PROCESS_STEP') {
                            const otherTime = otherLog.timestamp?.toDate?.() || new Date(otherLog.timestamp);
                            const timeDiff = Math.abs(logTime.getTime() - otherTime.getTime());
                            return timeDiff < 10000; // 10 segundos
                        }
                        return false;
                    });

                    // Si hay un log específico de completar paso, omitir este log general
                    return !hasSpecificStepLog;
                }
                return true; // Mantener todos los otros logs
            });

            setHistorial(historialFiltrado);
            lastClienteIdRef.current = clienteId;
        } catch (err) {
            console.error("Error al cargar el historial:", err);
            setError(err.message || 'Error desconocido');
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    }, [clienteId, historial.length]);

    // Resetear cuando cambie el clienteId
    useEffect(() => {
        if (lastClienteIdRef.current !== clienteId) {
            setHistorial([]);
            lastClienteIdRef.current = null;
        }
    }, [clienteId]);

    useEffect(() => {
        fetchHistorial();
    }, [fetchHistorial]);

    // Usamos useMemo para procesar los datos solo cuando el historial original cambia
    const processedHistorial = useMemo(() => {
        return historial.map(log => ({
            ...log,
            // Añadimos una nueva propiedad con el mensaje ya procesado
            displayMessage: getDisplayMessage(log, viviendas)
        }));
    }, [historial, viviendas]);

    return {
        historial: processedHistorial, // Devolvemos el historial ya procesado
        loading,
        error,
        fetchHistorial // Lo devolvemos para poder recargar si es necesario
    };
};