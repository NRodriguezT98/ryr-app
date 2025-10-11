/**
 * clienteTransferencia.js
 * 
 * Módulo para gestión de transferencia de viviendas entre clientes.
 * Maneja la actualización de cliente, viviendas (original y nueva) y abonos asociados.
 */

import { doc, getDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { createAuditLog } from '../auditService';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';

/**
 * Transfiere un cliente de una vivienda a otra.
 * 
 * Realiza las siguientes operaciones en batch:
 * - Actualiza cliente con nueva vivienda y plan financiero
 * - Resetea proceso del cliente según nuevo plan financiero
 * - Desasigna vivienda original (si existe)
 * - Asigna nueva vivienda al cliente
 * - Sincroniza todos los abonos activos con nueva vivienda
 * - Registra auditoría con snapshot de ambos planes financieros
 * 
 * @param {object} params - Parámetros de transferencia.
 * @param {string} params.clienteId - ID del cliente a transferir.
 * @param {string|null} params.viviendaOriginalId - ID de la vivienda actual (puede ser null si es primera asignación).
 * @param {string} params.nuevaViviendaId - ID de la nueva vivienda.
 * @param {string} params.motivo - Motivo de la transferencia (para auditoría).
 * @param {object} params.nuevoPlanFinanciero - Nuevo plan financiero del cliente.
 * @param {string} params.nombreCliente - Nombre completo del cliente (para auditoría y vivienda).
 * 
 * @throws {Error} Si el cliente no existe.
 * @throws {Error} Si la nueva vivienda no existe.
 * @throws {Error} Si la nueva vivienda ya está ocupada.
 * 
 * @example
 * await transferirViviendaCliente({
 *   clienteId: 'cliente123',
 *   viviendaOriginalId: 'vivienda456',
 *   nuevaViviendaId: 'vivienda789',
 *   motivo: 'Cliente solicitó cambio por mejor ubicación',
 *   nuevoPlanFinanciero: {
 *     fuenteDePago: 'subsidio',
 *     valorInicial: 50000000,
 *     totalBonos: 45000000,
 *     totalBanco: 0,
 *     totalAporte: 5000000
 *   },
 *   nombreCliente: 'Juan Pérez'
 * });
 */
export const transferirViviendaCliente = async ({
    clienteId,
    viviendaOriginalId,
    nuevaViviendaId,
    motivo,
    nuevoPlanFinanciero,
    nombreCliente
}) => {
    try {
        const clienteRef = doc(db, 'clientes', clienteId);
        const nuevaViviendaRef = doc(db, 'viviendas', nuevaViviendaId);

        // --- INICIO DE LA MODIFICACIÓN 1: Leer datos originales del cliente ---
        // Necesitamos el estado del cliente ANTES de hacer cualquier cambio.
        const clienteOriginalSnap = await getDoc(clienteRef);
        if (!clienteOriginalSnap.exists()) {
            throw new Error("El cliente a transferir no existe.");
        }
        const clienteOriginal = clienteOriginalSnap.data();
        // --- FIN DE LA MODIFICACIÓN 1 ---

        // Validar nueva vivienda
        const nuevaViviendaSnap = await getDoc(nuevaViviendaRef);

        if (!nuevaViviendaSnap.exists()) {
            throw new Error("La nueva vivienda seleccionada no existe.");
        }
        if (nuevaViviendaSnap.data().clienteId) {
            throw new Error("Esta vivienda ya fue ocupada por otro cliente. Por favor, refresque y seleccione otra.");
        }
        const nuevaViviendaData = nuevaViviendaSnap.data();

        // Buscar abonos activos que deben sincronizarse con la nueva vivienda
        const abonosQuery = query(
            collection(db, "abonos"),
            where("clienteId", "==", clienteId),
            where("estadoProceso", "==", "activo")
        );
        const abonosASincronizar = await getDocs(abonosQuery);

        // Generar nuevo proceso según el plan financiero
        const nuevoProceso = {};
        PROCESO_CONFIG.forEach(paso => {
            if (paso.aplicaA(nuevoPlanFinanciero)) {
                const evidencias = {};
                paso.evidenciasRequeridas.forEach(ev => {
                    evidencias[ev.id] = { url: null, estado: 'pendiente' };
                });
                nuevoProceso[paso.key] = {
                    completado: false,
                    fecha: null,
                    evidencias,
                    archivado: false
                };
            }
        });

        // Batch write para atomicidad
        const batch = writeBatch(db);

        // Actualizar cliente con nueva vivienda, plan financiero y proceso reseteado
        batch.update(clienteRef, {
            viviendaId: nuevaViviendaId,
            financiero: nuevoPlanFinanciero,
            proceso: nuevoProceso
        });

        // Desasignar vivienda original (si existe)
        if (viviendaOriginalId) {
            const viviendaOriginalRef = doc(db, 'viviendas', viviendaOriginalId);
            batch.update(viviendaOriginalRef, {
                clienteId: null,
                clienteNombre: ""
            });
        }

        // Asignar nueva vivienda al cliente
        batch.update(nuevaViviendaRef, {
            clienteId: clienteId,
            clienteNombre: nombreCliente
        });

        // Sincronizar todos los abonos activos con la nueva vivienda
        abonosASincronizar.forEach((abonoDoc) => {
            batch.update(abonoDoc.ref, { viviendaId: nuevaViviendaId });
        });

        await batch.commit();

        // Registrar auditoría con snapshot completo de ambos planes financieros
        const auditMessage = `Transfirió al cliente ${nombreCliente} a una nueva vivienda.`;
        const auditDetails = {
            action: 'TRANSFER_CLIENT',
            clienteId: clienteId,
            clienteNombre: nombreCliente,
            motivo,
            viviendaAnterior: viviendaOriginalId || 'Ninguna',
            viviendaNueva: {
                id: nuevaViviendaId,
                ubicacion: `Mz ${nuevaViviendaData.manzana} - Casa ${nuevaViviendaData.numeroCasa}`,
            },
            // --- INICIO DE LA MODIFICACIÓN 2: Guardar ambos planes financieros ---
            snapshotAntiguoPlanFinanciero: clienteOriginal.financiero || {},
            snapshotNuevoPlanFinanciero: nuevoPlanFinanciero
            // --- FIN DE LA MODIFICACIÓN 2 ---
        };
        await createAuditLog(auditMessage, auditDetails);

    } catch (error) {
        console.error("Error en la operación de transferencia de vivienda: ", error);
        throw error;
    }
};
