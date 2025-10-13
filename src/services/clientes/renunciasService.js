/**
 * Módulo de Renuncias
 * Maneja todo el proceso de renuncia de un cliente a su vivienda
 */

import { db } from '../../firebase/config';
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    runTransaction,
    serverTimestamp
} from "firebase/firestore";
import { createClientAuditLog } from '../unifiedAuditService';
import { DOCUMENTACION_CONFIG } from '../../utils/documentacionConfig';

/**
 * Registra la renuncia de un cliente a su vivienda
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
        // console.log('🔄 [renunciarAVivienda] Iniciando transacción para cliente:', clienteId);

        // 1. Obtener cliente
        const clienteDoc = await transaction.get(clienteRef);
        if (!clienteDoc.exists()) {
            throw new Error("El cliente ya no existe.");
        }

        const clienteData = clienteDoc.data();
        const viviendaId = clienteData.viviendaId;

        // console.log('📋 [renunciarAVivienda] Datos del cliente:', {
        //     id: clienteId,
        //     viviendaId,
        //     status: clienteData.status
        // });

        if (!viviendaId) {
            throw new Error("El cliente no tiene una vivienda asignada para renunciar.");
        }

        // 2. Obtener vivienda
        const viviendaRef = doc(db, "viviendas", viviendaId);
        const viviendaDoc = await transaction.get(viviendaRef);

        if (!viviendaDoc.exists()) {
            throw new Error("La vivienda ya no existe.");
        }

        const viviendaData = viviendaDoc.data();
        clienteNombre = `${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`.trim();
        viviendaInfoParaLog = `Mz ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}`;

        // console.log('🏠 [renunciarAVivienda] Datos de la vivienda:', {
        //     id: viviendaId,
        //     manzana: viviendaData.manzana,
        //     numeroCasa: viviendaData.numeroCasa,
        //     clienteIdActual: viviendaData.clienteId
        // });

        // 3. Calcular abonos y devolución
        const abonosActivosQuery = query(
            collection(db, "abonos"),
            where("clienteId", "==", clienteId),
            where("viviendaId", "==", viviendaId),
            where("estadoProceso", "==", "activo")
        );
        const abonosSnapshot = await getDocs(abonosActivosQuery);
        const abonosDelCiclo = abonosSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        const abonosRealesDelCliente = abonosDelCiclo.filter(
            abono => abono.metodoPago !== 'Condonación de Saldo'
        );
        const totalAbonadoReal = abonosRealesDelCliente.reduce((sum, abono) => sum + abono.monto, 0);
        const totalADevolver = totalAbonadoReal - penalidadMonto;

        estadoInicialRenuncia = totalADevolver > 0 ? 'Pendiente' : 'Cerrada';

        // 4. Recolectar documentos archivados
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

        // 5. Crear registro de renuncia
        const renunciaRef = doc(collection(db, "renuncias"));
        renunciaIdParaNotificacion = renunciaRef.id;

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

        transaction.set(renunciaRef, registroRenuncia);

        // 6. Actualizar vivienda
        // console.log('🏠 [renunciarAVivienda] Actualizando vivienda:', viviendaId);
        transaction.update(viviendaRef, {
            clienteId: null,
            clienteNombre: "",
            totalAbonado: 0,
            saldoPendiente: viviendaData.valorTotal
        });

        // 7. Actualizar cliente según estado de devolución
        // console.log('👤 [renunciarAVivienda] Actualizando cliente. Estado inicial:', estadoInicialRenuncia);
        if (estadoInicialRenuncia === 'Pendiente') {
            // console.log('⏳ [renunciarAVivienda] Cliente pasa a enProcesoDeRenuncia');
            transaction.update(clienteRef, {
                status: 'enProcesoDeRenuncia',
                updatedAt: new Date().toISOString()
            });
        } else {
            // console.log('✅ [renunciarAVivienda] Cliente pasa a renunciado');
            transaction.update(clienteRef, {
                viviendaId: null,
                proceso: {},
                financiero: {},
                status: 'renunciado',
                updatedAt: new Date().toISOString()
            });
            transaction.update(renunciaRef, {
                fechaDevolucion: fechaRenuncia
            });

            // 8. Archivar abonos
            // console.log('📦 [renunciarAVivienda] Archivando', abonosDelCiclo.length, 'abonos');
            abonosDelCiclo.forEach(abono => {
                const abonoRef = doc(db, "abonos", abono.id);
                transaction.update(abonoRef, {
                    estadoProceso: 'archivado',
                    motivoArchivo: 'Renuncia de cliente'
                });
            });
        }

        // console.log('✅ [renunciarAVivienda] Transacción preparada, ejecutando commit...');
    });

    // console.log('🎉 [renunciarAVivienda] Transacción completada exitosamente');

    // 9. Crear audit log (fuera de la transacción)
    await createClientAuditLog(
        'CLIENT_RENOUNCE',
        {
            id: clienteId,
            nombre: clienteNombre,
            numeroDocumento: clienteId
        },
        {
            actionData: {
                motivo,
                observacion,
                fechaRenuncia,
                penalidadMonto,
                penalidadMotivo,
                viviendaInfo: viviendaInfoParaLog,
                renunciaId: renunciaIdParaNotificacion,
                estadoInicial: estadoInicialRenuncia
            }
        }
    );

    return {
        renunciaId: renunciaIdParaNotificacion,
        clienteNombre
    };
};
