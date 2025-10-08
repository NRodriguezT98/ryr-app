// En src/hooks/clientes/useHistorialCliente.jsx

import { useState, useEffect, useCallback, useMemo } from 'react';
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


export const useHistorialCliente = (clienteId) => {
    const { viviendas } = useData();
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistorial = useCallback(async () => {
        if (!clienteId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const logs = await getAuditLogsForCliente(clienteId);
            const historialFiltrado = logs.filter(log => log.details.action !== 'EDIT_NOTE');
            setHistorial(historialFiltrado);
        } catch (err) {
            console.error("Error al cargar el historial:", err);
            // Considera añadir un estado de error aquí si lo deseas
        } finally {
            setLoading(false);
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
        fetchHistorial // Lo devolvemos para poder recargar si es necesario
    };
};