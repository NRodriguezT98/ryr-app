/**
 * updateProceso.js
 * 
 * Función UNIFICADA para actualizar el proceso de un cliente.
 * Soporta ambos sistemas de auditoría (legacy y unificado).
 */

import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { createAuditLog } from '../../auditService';
import { detectarCambiosProceso } from './cambiosDetector';
import { crearAuditoriaLegacy } from './auditoriaSistemaLegacy';
import { crearAuditoriaUnificada } from './auditoriaSistemaUnificado';

/**
 * Actualiza el proceso de un cliente y genera auditoría.
 * 
 * @param {string} clienteId - ID del cliente
 * @param {Object} nuevoProceso - Nuevo estado del proceso
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.useUnifiedAudit - Usar sistema unificado (default: false)
 * @param {string} options.auditMessage - Mensaje de auditoría (solo legacy)
 * @param {Object} options.auditDetails - Detalles de auditoría (solo legacy)
 * 
 * @example
 * // Sistema legacy (actual)
 * await updateClienteProceso(clienteId, nuevoProceso, {
 *   auditMessage: 'Completó paso',
 *   auditDetails: { ... }
 * });
 * 
 * @example
 * // Sistema unificado (nuevo)
 * await updateClienteProceso(clienteId, nuevoProceso, {
 *   useUnifiedAudit: true
 * });
 */
export const updateClienteProceso = async (clienteId, nuevoProceso, options = {}) => {
    // Si options es un string, es el formato legacy: updateClienteProceso(id, proceso, message, details)
    // Convertir a nuevo formato
    let useUnifiedAudit = false;
    let auditMessage = null;
    let auditDetails = null;

    if (typeof options === 'string') {
        // Formato legacy: (clienteId, nuevoProceso, auditMessage, auditDetails)
        auditMessage = options;
        // El cuarto parámetro sería auditDetails, pero en esta función solo tenemos 3
        // Este caso se manejará cuando migremos las llamadas
    } else {
        // Formato nuevo con objeto options
        useUnifiedAudit = options.useUnifiedAudit || false;
        auditMessage = options.auditMessage || null;
        auditDetails = options.auditDetails || null;
    }

    // 1. Obtener estado original del cliente
    const clienteRef = doc(db, "clientes", String(clienteId));
    const clienteOriginalSnap = await getDoc(clienteRef);

    if (!clienteOriginalSnap.exists()) {
        throw new Error("El cliente no existe.");
    }

    const clienteOriginal = clienteOriginalSnap.data();
    const procesoOriginal = clienteOriginal.proceso || {};

    // 2. Actualizar el proceso en Firestore
    await updateDoc(clienteRef, {
        proceso: nuevoProceso,
        updatedAt: serverTimestamp()
    });

    // 3. Detectar cambios usando el detector unificado
    const cambios = detectarCambiosProceso(procesoOriginal, nuevoProceso);

    // 4. VALIDACIÓN: Si hay completación con reapertura, debe haber cambios reales
    cambios.forEach(cambio => {
        // Si es una reapertura (completación después de reabrir)
        if (cambio.tipo === 'reapertura') {
            const { huboCambioFecha, huboCambioEvidencias } = cambio.flags;

            // Si no hay cambio de fecha NI de evidencias, es un error
            if (!huboCambioFecha && !huboCambioEvidencias) {
                throw new Error(
                    `No se puede completar el paso "${cambio.pasoNombre}" después de reabrirlo sin realizar cambios. ` +
                    'Debes modificar la fecha o reemplazar evidencias.'
                );
            }
        }
    });

    // 5. Si no hay cambios, solo crear log general si se proporcionó
    if (cambios.length === 0) {
        if (auditMessage && auditDetails && !useUnifiedAudit) {
            await createAuditLog(auditMessage, auditDetails);
        }
        return;
    }

    // 6. Generar auditoría según el sistema elegido
    if (useUnifiedAudit) {
        await crearAuditoriaUnificada(cambios, clienteId, clienteOriginal);
    } else {
        await crearAuditoriaLegacy(cambios, clienteId, clienteOriginal, auditMessage, auditDetails);
    }
};

/**
 * Alias para mantener compatibilidad con código existente.
 * Esta función usa el sistema unificado de auditoría.
 * 
 * @deprecated Usar updateClienteProceso con useUnifiedAudit: true
 */
export const updateClienteProcesoUnified = async (clienteId, nuevoProceso, auditMessage, auditDetails) => {
    return updateClienteProceso(clienteId, nuevoProceso, {
        useUnifiedAudit: true,
        auditMessage,
        auditDetails
    });
};
