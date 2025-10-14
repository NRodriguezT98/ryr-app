/**
 * clienteRenuncia.js
 * 
 * Módulo para gestión de renuncias de clientes a viviendas.
 * Maneja la lógica completa de renuncia incluyendo:
 * - Archival de documentos y proceso del cliente
 * - Cálculo de devolución de abonos
 * - Actualización de estado de cliente y vivienda
 * - Registro de renuncia con historial de abonos
 */

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    runTransaction,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { createAuditLog } from '../auditService';
import { createClientAuditLog } from '../unifiedAuditService';
import { toTitleCase, formatDisplayDate } from '../../utils/textFormatters';
import { DOCUMENTACION_CONFIG } from '../../utils/documentacionConfig';

/**
 * Procesa la renuncia de un cliente a su vivienda asignada.
 * 
 * Flujo completo:
 * 1. Valida que el cliente y vivienda existan
 * 2. Obtiene todos los abonos activos del cliente
 * 3. Calcula total abonado y total a devolver (menos penalidad)
 * 4. Archiva todos los documentos del cliente desde DOCUMENTACION_CONFIG
 * 5. Crea registro de renuncia con:
 *    - Historial de abonos
 *    - Documentos archivados
 *    - Snapshot de financiero y proceso
 *    - Información de vivienda
 * 6. Actualiza estado del cliente según tenga abonos a devolver:
 *    - Si hay abonos a devolver: 'enProcesoDeRenuncia' (pendiente de devolución)
 *    - Si no hay abonos: 'renunciado' (proceso cerrado automáticamente)
 * 7. Libera la vivienda (clienteId = null)
 * 8. Si proceso cerrado: archiva todos los abonos activos
 * 9. Registra auditoría completa
 * 
 * @param {string} clienteId - ID del cliente que renuncia.
 * @param {string} motivo - Motivo principal de la renuncia.
 * @param {string} [observacion=''] - Observaciones adicionales.
 * @param {Date|string} fechaRenuncia - Fecha de la renuncia.
 * @param {number} [penalidadMonto=0] - Monto de penalidad a descontar de la devolución.
 * @param {string} [penalidadMotivo=''] - Motivo de la penalidad aplicada.
 * 
 * @returns {Promise<{renunciaId: string, clienteNombre: string}>} ID de la renuncia creada y nombre del cliente.
 * 
 * @throws {Error} Si el cliente no existe.
 * @throws {Error} Si el cliente no tiene vivienda asignada.
 * @throws {Error} Si la vivienda no existe.
 * 
 * @example
 * const resultado = await renunciarAVivienda(
 *   'cliente123',
 *   'Problemas financieros',
 *   'El cliente no puede continuar con los pagos',
 *   new Date('2024-03-15'),
 *   500000,
 *   'Incumplimiento de plazos de pago'
 * );
 * // resultado = { renunciaId: 'renuncia456', clienteNombre: 'Juan Pérez' }
 */
export const renunciarAVivienda = async (
    clienteId,
    motivo,
    observacion = '',
    fechaRenuncia,
    penalidadMonto = 0,
    penalidadMotivo = ''
) => {
    const clienteRef = doc(db, "clientes", clienteId);
    let clienteNombre = '';
    let viviendaInfoParaLog = '';
    let renunciaIdParaNotificacion = '';
    let estadoInicialRenuncia;

    await runTransaction(db, async (transaction) => {
        // 1. Validar cliente y obtener datos
        const clienteDoc = await transaction.get(clienteRef);
        if (!clienteDoc.exists()) throw new Error("El cliente ya no existe.");

        const clienteData = clienteDoc.data();
        const viviendaId = clienteData.viviendaId;
        if (!viviendaId) throw new Error("El cliente no tiene una vivienda asignada para renunciar.");

        // 2. Validar vivienda y obtener datos
        const viviendaRef = doc(db, "viviendas", viviendaId);
        const viviendaDoc = await transaction.get(viviendaRef);
        if (!viviendaDoc.exists()) throw new Error("La vivienda ya no existe.");

        const viviendaData = viviendaDoc.data();
        clienteNombre = `${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`.trim();
        viviendaInfoParaLog = `Mz ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}`;

        // 3. Obtener abonos activos del cliente en esta vivienda
        const abonosActivosQuery = query(
            collection(db, "abonos"),
            where("clienteId", "==", clienteId),
            where("viviendaId", "==", viviendaId),
            where("estadoProceso", "==", "activo")
        );
        const abonosSnapshot = await getDocs(abonosActivosQuery);
        const abonosDelCiclo = abonosSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        // 4. Calcular total abonado (sin condonaciones) y total a devolver
        const abonosRealesDelCliente = abonosDelCiclo.filter(abono => abono.metodoPago !== 'Condonación de Saldo');
        const totalAbonadoReal = abonosRealesDelCliente.reduce((sum, abono) => sum + abono.monto, 0);
        const totalADevolver = totalAbonadoReal - penalidadMonto;

        // 5. Determinar estado inicial de la renuncia
        estadoInicialRenuncia = totalADevolver > 0 ? 'Pendiente' : 'Cerrada';

        // 6. Crear ID de renuncia
        const renunciaRef = doc(collection(db, "renuncias"));
        renunciaIdParaNotificacion = renunciaRef.id;

        // 7. Archivar todos los documentos del cliente
        // Se restaura la lógica para recolectar todos los documentos del cliente.
        const documentosArchivados = [];
        DOCUMENTACION_CONFIG.forEach(docConfig => {
            if (docConfig.selector) {
                const docData = docConfig.selector(clienteData);
                const url = docData?.url || (typeof docData === 'string' ? docData : null);
                if (url) {
                    documentosArchivados.push({
                        label: docConfig.label,
                        url: url
                    });
                }
            }
        });

        // 8. Crear registro completo de renuncia con snapshot
        const registroRenuncia = {
            id: renunciaRef.id,
            clienteId,
            clienteNombre,
            viviendaId,
            viviendaInfo: `Mz. ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}`,
            fechaRenuncia,
            totalAbonadoOriginal: totalAbonadoReal,
            penalidadMonto,
            penalidadMotivo,
            totalAbonadoParaDevolucion: totalADevolver,
            estadoDevolucion: estadoInicialRenuncia,
            motivo,
            observacion,
            historialAbonos: abonosDelCiclo,
            documentosArchivados,
            financieroArchivado: clienteData.financiero || {},
            procesoArchivado: clienteData.proceso || {},
            viviendaArchivada: {
                id: viviendaId,
                manzana: viviendaData.manzana,
                numeroCasa: viviendaData.numeroCasa,
                descuentoMonto: viviendaData.descuentoMonto || 0,
                saldoPendiente: viviendaData.saldoPendiente ?? 0
            },
            timestamp: serverTimestamp()
        };

        // 9. Guardar renuncia en Firestore
        transaction.set(renunciaRef, registroRenuncia);

        // 10. Liberar vivienda (clienteId = null)
        transaction.update(viviendaRef, {
            clienteId: null,
            clienteNombre: "",
            totalAbonado: 0,
            saldoPendiente: viviendaData.valorTotal
        });

        // 11. Actualizar estado del cliente según tenga abonos a devolver
        if (estadoInicialRenuncia === 'Pendiente') {
            // Tiene abonos a devolver → estado 'enProcesoDeRenuncia'
            transaction.update(clienteRef, {
                status: 'enProcesoDeRenuncia'
            });
        } else {
            // No tiene abonos a devolver → proceso cerrado automáticamente
            transaction.update(clienteRef, {
                viviendaId: null,
                proceso: {},
                financiero: {},
                status: 'renunciado'
            });

            // Registrar fecha de devolución (inmediata porque no hay monto a devolver)
            transaction.update(renunciaRef, {
                fechaDevolucion: fechaRenuncia
            });

            // Archivar todos los abonos activos
            abonosDelCiclo.forEach(abono => {
                transaction.update(doc(db, "abonos", abono.id), {
                    estadoProceso: 'archivado'
                });
            });
        }
    });

    // 12. Obtener la renuncia completa para auditoría
    const renunciaRef = doc(db, "renuncias", renunciaIdParaNotificacion);
    const renunciaDoc = await getDoc(renunciaRef);
    const renunciaCompleta = renunciaDoc.data();

    // 13. Registrar auditoría con sistema unificado (FASE 2)
    await createClientAuditLog(
        'CLIENT_RENOUNCE',
        {
            clienteId,
            clienteNombre: toTitleCase(clienteNombre)
        },
        {
            actionData: {
                motivo,
                observacion,
                fechaRenuncia,
                viviendaInfo: viviendaInfoParaLog,
                totalAbonado: totalAbonadoReal,
                penalidadMonto,
                penalidadMotivo,
                totalADevolver,
                estadoDevolucion: estadoInicialRenuncia,
                historialAbonos: abonosDelCiclo,
                documentosArchivados: renunciaCompleta?.documentosArchivados || []
            }
        }
    );

    // 14. Mantener auditoría antigua para historial administrativo
    let auditMessage = `Registró la renuncia del cliente ${toTitleCase(clienteNombre)} a la vivienda ${viviendaInfoParaLog}, con fecha ${formatDisplayDate(fechaRenuncia)}, indicando el motivo "${motivo}"`;

    if (estadoInicialRenuncia === 'Cerrada') {
        auditMessage += '. Este proceso de renuncia queda cerrado automáticamente ya que el cliente no cuenta con abonos pendientes por devolución.';
    }

    await createAuditLog(
        auditMessage,
        {
            action: 'CLIENT_RENOUNCE',
            clienteId: clienteId,
            clienteNombre: toTitleCase(clienteNombre),
            viviendaInfo: viviendaInfoParaLog,
            motivoRenuncia: motivo,
            observaciones: observacion,
            penalidadAplicada: penalidadMonto > 0,
            montoPenalidad: penalidadMonto,
            motivoPenalidad: penalidadMotivo
        }
    );

    return {
        renunciaId: renunciaIdParaNotificacion,
        clienteNombre
    };
};
