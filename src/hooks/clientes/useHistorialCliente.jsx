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
        // Devolvemos el contenido de la nota en lugar del mensaje genérico
        // Usamos '|| message' como fallback por si un registro antiguo no tuviera el campo 'nota'
        return details.nota || message;
    }

    // Caso 1: Es una actualización de cliente CON cambios detallados
    if (details?.action === 'UPDATE_CLIENT' && details.cambios?.length > 0) {

        // Creamos una línea de detalle para cada cambio
        const cambiosDetallados = details.cambios.map(c =>
            `• ${c.campo}: ${c.anterior} → ${c.actual}`
        ).join('\n'); // Unimos cada cambio con un salto de línea

        // Retornamos el mensaje completo y multilínea
        return `Se realizaron los siguientes cambios:\n${cambiosDetallados}`;
    }

    if (details?.action === 'TRANSFER_CLIENT') {
        const planAntiguo = details.snapshotAntiguoPlanFinanciero;
        const planNuevo = details.snapshotNuevoPlanFinanciero;

        const viviendaAnterior = viviendas.find(v => v.id === details.viviendaAnterior);
        const viviendaAnteriorNombre = viviendaAnterior ? `Mz ${viviendaAnterior.manzana} - Casa ${viviendaAnterior.numeroCasa}` : 'N/A';
        const viviendaNuevaNombre = details.viviendaNueva?.ubicacion || 'N/A';

        const nuevaVivienda = viviendas.find(v => v.id === details.viviendaNueva?.id);
        const valorAntiguaVivienda = viviendaAnterior?.valorTotal || 0;
        const valorNuevaVivienda = nuevaVivienda?.valorTotal || 0;

        const fuentesAntiguas = formatFuentesDePago(planAntiguo);
        const totalRecursosAntiguos = (planAntiguo?.cuotaInicial?.monto ?? 0) + (planAntiguo?.credito?.monto ?? 0) + (planAntiguo?.subsidioVivienda?.monto ?? 0) + (planAntiguo?.subsidioCaja?.monto ?? 0);

        const fuentesNuevas = formatFuentesDePago(planNuevo);
        const totalRecursosNuevos = (planNuevo?.cuotaInicial?.monto ?? 0) + (planNuevo?.credito?.monto ?? 0) + (planNuevo?.subsidioVivienda?.monto ?? 0) + (planNuevo?.subsidioCaja?.monto ?? 0);

        const motivoTraslado = details.motivo ? `Motivo del traslado: "${details.motivo}"\n\n` : '';

        // Reconstruimos el mensaje final con la nueva estructura
        return `Cliente ${details.clienteNombre} fue transferido de vivienda.\n` +
            `De: ${viviendaAnteriorNombre}\n` +
            `A: ${viviendaNuevaNombre}\n\n` +
            `${motivoTraslado}` +
            `Antiguo Plan Financiero (${viviendaAnteriorNombre}):\n` +
            `${fuentesAntiguas.length > 0 ? fuentesAntiguas.join('\n') : '• Sin datos.'}\n` +
            `• Total Recursos Antigua Vivienda: ${formatCurrency(totalRecursosAntiguos)}\n` +
            `• Valor Total Antigua Vivienda: ${formatCurrency(valorAntiguaVivienda)}\n\n` +
            `Nuevo Plan Financiero (${viviendaNuevaNombre}):\n` +
            `${fuentesNuevas.length > 0 ? fuentesNuevas.join('\n') : '• Sin datos.'}\n` +
            `• Total Recursos Nueva Vivienda: ${formatCurrency(totalRecursosNuevos)}\n` +
            `• Valor Total Nueva Vivienda: ${formatCurrency(valorNuevaVivienda)}`;
        // --- FIN DE LA MODIFICACIÓN ---
    }

    if (details?.action === 'VOID_ABONO') {
        const abono = details.abono || {};
        const clienteNombre = details.cliente?.nombre || 'N/A';
        const motivo = abono.motivo ? `, motivo: "${abono.motivo}"` : '';

        return `Anuló el abono N°${abono.consecutivo || 'N/A'} realizado en la fecha ${abono.fechaPago || 'N/A'} del cliente: ${clienteNombre} por valor de ${abono.monto || '$0'}${motivo}.`;
    }


    return message; // Mensaje por defecto para todas las demás acciones
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