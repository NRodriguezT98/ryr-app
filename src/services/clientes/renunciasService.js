/**
 * Módulo de Renuncias
 * Maneja todo el proceso de renuncia de un cliente a su vivienda
 * 
 * 🔥 OPTIMIZACIÓN CRÍTICA: Query de abonos FUERA de runTransaction()
 * RAZÓN: getDocs() dentro de runTransaction() puede causar que listeners no se disparen
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
    writeBatch
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
    // 🔥 PASO 1: Obtener TODOS los datos ANTES de iniciar la transacción
    // getDocs() dentro de runTransaction() rompe listeners

    // 1. Obtener cliente
    const clienteRef = doc(db, "clientes", clienteId);
    const clienteDoc = await getDoc(clienteRef);

    if (!clienteDoc.exists()) {
        throw new Error("El cliente ya no existe.");
    }

    const clienteData = clienteDoc.data();
    const viviendaId = clienteData.viviendaId;

    if (!viviendaId) {
        throw new Error("El cliente no tiene una vivienda asignada para renunciar.");
    }

    // 2. Obtener vivienda
    const viviendaRef = doc(db, "viviendas", viviendaId);
    const viviendaDoc = await getDoc(viviendaRef);

    if (!viviendaDoc.exists()) {
        throw new Error("La vivienda ya no existe.");
    }

    const viviendaData = viviendaDoc.data();
    const clienteNombre = `${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`.trim();
    const viviendaInfoParaLog = `Mz ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}`;

    // 3. Obtener abonos ANTES de la transacción
    const abonosActivosQuery = query(
        collection(db, "abonos"),
        where("clienteId", "==", clienteId),
        where("viviendaId", "==", viviendaId),
        where("estadoProceso", "==", "activo")
    );
    const abonosSnapshot = await getDocs(abonosActivosQuery);
    const abonosDelCiclo = abonosSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // 4. Calcular devolución
    const abonosRealesDelCliente = abonosDelCiclo.filter(
        abono => abono.metodoPago !== 'Condonación de Saldo'
    );
    const totalAbonadoReal = abonosRealesDelCliente.reduce((sum, abono) => sum + abono.monto, 0);
    const totalADevolver = totalAbonadoReal - penalidadMonto;
    const estadoInicialRenuncia = totalADevolver > 0 ? 'Pendiente' : 'Cerrada';

    // 5. Recolectar documentos archivados
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

    // 🔥 PASO 2: Usar writeBatch() para escrituras atómicas (mejor que runTransaction para solo writes)
    const batch = writeBatch(db);

    // Crear renuncia
    const renunciaRef = doc(collection(db, "renuncias"));
    const renunciaIdParaNotificacion = renunciaRef.id;

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
        timestamp: new Date().toISOString()
    };

    batch.set(renunciaRef, registroRenuncia);

    // ✅ FIX: Usar serverTimestamp() para sincronización en tiempo real
    // Actualizar vivienda
    batch.update(viviendaRef, {
        clienteId: null,
        clienteNombre: "",
        totalAbonado: 0,
        saldoPendiente: viviendaData.valorTotal,
        updatedAt: serverTimestamp()
    });

    // Actualizar cliente según estado de devolución
    if (estadoInicialRenuncia === 'Pendiente') {
        batch.update(clienteRef, {
            status: 'enProcesoDeRenuncia',
            updatedAt: serverTimestamp()
        });
    } else {
        batch.update(clienteRef, {
            viviendaId: null,
            proceso: {},
            financiero: {},
            status: 'renunciado',
            updatedAt: serverTimestamp()
        });
        batch.update(renunciaRef, {
            fechaDevolucion: fechaRenuncia,
            updatedAt: serverTimestamp()
        });

        // Archivar abonos
        abonosDelCiclo.forEach(abono => {
            const abonoRef = doc(db, "abonos", abono.id);
            batch.update(abonoRef, {
                estadoProceso: 'archivado',
                motivoArchivo: 'Renuncia de cliente',
                updatedAt: serverTimestamp()
            });
        });
    }

    // Commit del batch (escritura atómica)
    await batch.commit();

    // Crear audit log (fuera del batch)
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
