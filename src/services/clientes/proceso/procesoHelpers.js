/**
 * procesoHelpers.js
 * 
 * Funciones auxiliares para gestión de proceso de clientes
 * Extraído de clienteService.js durante refactorización
 */

import { db } from '../../../firebase/config';
import { doc, getDoc, updateDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { toTitleCase, formatDisplayDate, getTodayString } from '../../../utils/textFormatters';
import { PROCESO_CONFIG } from '../../../utils/procesoConfig';
import { createAuditLog } from '../../auditService';

/**
 * Obtiene el objeto proceso de un cliente
 * 
 * @param {string} clienteId - ID del cliente
 * @returns {Object} Objeto proceso o {} si no existe
 * @throws {Error} Si el cliente no existe
 */
export const getClienteProceso = async (clienteId) => {
    const clienteRef = doc(db, "clientes", String(clienteId));
    const clienteSnap = await getDoc(clienteRef);

    if (!clienteSnap.exists()) {
        throw new Error("CLIENT_NOT_FOUND");
    }

    return clienteSnap.data().proceso || {};
};

/**
 * Anula el cierre del proceso, reabriendo el paso de factura de venta
 * 
 * @param {string} clienteId - ID del cliente
 * @param {string} userName - Nombre del usuario que anula
 * @param {string} motivo - Motivo de la anulación
 */
export const anularCierreProceso = async (clienteId, userName, motivo) => {
    const clienteRef = doc(db, "clientes", clienteId);

    const clienteDocInicial = await getDoc(clienteRef);
    if (!clienteDocInicial.exists()) {
        throw new Error("El cliente no existe.");
    }

    const clienteDataInicial = clienteDocInicial.data();
    const clienteNombre = toTitleCase(
        `${clienteDataInicial.datosCliente.nombres} ${clienteDataInicial.datosCliente.apellidos}`
    );

    await runTransaction(db, async (transaction) => {
        const clienteDoc = await transaction.get(clienteRef);
        const clienteData = clienteDoc.data();
        const procesoActual = clienteData.proceso || {};

        if (procesoActual.facturaVenta && procesoActual.facturaVenta.completado) {
            const pasoFacturaVenta = procesoActual.facturaVenta;

            const nuevaEntradaHistorial = {
                mensaje: `Cierre anulado por el Administrador → ${userName}, se reabre el ultimo paso 'Factura de Venta' por el siguiente Motivo: "${motivo}"`,
                userName: userName,
                fecha: new Date()
            };

            const actividadExistente = pasoFacturaVenta.actividad || [];

            const nuevoProceso = {
                ...procesoActual,
                facturaVenta: {
                    ...pasoFacturaVenta,
                    completado: false,
                    fecha: null,
                    fechaUltimaModificacion: getTodayString(),
                    actividad: [...actividadExistente, nuevaEntradaHistorial]
                }
            };

            transaction.update(clienteRef, { proceso: nuevoProceso });
        } else {
            throw new Error("El proceso no se puede anular porque no está completado.");
        }
    });

    await createAuditLog(
        `Anuló el cierre del proceso para el cliente ${clienteNombre}`,
        {
            action: 'ANULAR_CIERRE_PROCESO',
            clienteId: clienteId,
            clienteNombre: clienteNombre,
        }
    );
};

/**
 * Reabre un paso del proceso que estaba completado
 * 
 * @param {string} clienteId - ID del cliente
 * @param {string} pasoKey - Clave del paso a reabrir
 * @param {string} motivoReapertura - Motivo de la reapertura
 * @returns {Object} Proceso actualizado
 */
export const reabrirPasoProceso = async (clienteId, pasoKey, motivoReapertura) => {
    const clienteRef = doc(db, "clientes", String(clienteId));

    const clienteSnap = await getDoc(clienteRef);
    if (!clienteSnap.exists()) {
        throw new Error("El cliente no existe.");
    }

    const clienteData = clienteSnap.data();
    const procesoActual = clienteData.proceso || {};
    const pasoActual = procesoActual[pasoKey] || {};

    // Obtener información del paso
    const pasoConfig = PROCESO_CONFIG.find(p => p.key === pasoKey);
    const pasoNombre = pasoConfig
        ? pasoConfig.label.substring(pasoConfig.label.indexOf('.') + 1).trim()
        : pasoKey;
    const clienteNombre = toTitleCase(
        `${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`
    );

    // Crear el nuevo estado del paso (reabierto)
    const nuevoPaso = {
        ...pasoActual,
        completado: false,
        fechaReapertura: new Date().toISOString(),
        motivoReapertura: motivoReapertura,
        estadoAnterior: {
            completado: pasoActual.completado,
            fecha: pasoActual.fecha,
            evidencias: pasoActual.evidencias || {}
        }
    };

    // Actualizar el proceso
    const procesoActualizado = {
        ...procesoActual,
        [pasoKey]: nuevoPaso
    };

    await updateDoc(clienteRef, {
        proceso: procesoActualizado,
        updatedAt: serverTimestamp()
    });

    // Crear log de auditoría para la reapertura
    const fechaOriginal = formatDisplayDate(pasoActual.fecha);
    const mensajeReapertura = `🔄 Reapertura de paso

📋 Paso: "${pasoNombre}"
⚠️  Motivo: ${motivoReapertura}
📅 Fecha original de completado: ${fechaOriginal}
🔓 El paso fue marcado como pendiente para su revisión`;

    await createAuditLog(mensajeReapertura, {
        action: 'REOPEN_PROCESS_STEP',
        category: 'clientes',
        clienteId: clienteId,
        clienteNombre: clienteNombre,
        pasoReabierto: pasoNombre,
        fechaOriginal: pasoActual.fecha,
        motivoReapertura: motivoReapertura,
        scenario: 'STEP_REOPENED'
    });

    return procesoActualizado;
};
