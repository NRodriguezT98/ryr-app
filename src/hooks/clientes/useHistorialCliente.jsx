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

    // Para otros casos, mantenemos la lógica anterior si es necesario
    // o simplemente devolvemos el mensaje por defecto.
    // Por ahora, devolvemos el mensaje por defecto para todos los demás.
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
            console.log("🔍 [DEBUG] Buscando historial para clienteId:", clienteId);
            const logs = await getAuditLogsForCliente(clienteId);
            console.log("🔍 [DEBUG] Logs obtenidos de la base de datos:", logs);
            const historialFiltrado = logs.filter(log => log.details.action !== 'EDIT_NOTE');
            console.log("🔍 [DEBUG] Historial después de filtrar:", historialFiltrado);
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