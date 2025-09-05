// src/services/renunciaService.js
import { db } from '../firebase/config';
import { collection, doc, updateDoc, runTransaction, getDoc, writeBatch, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { toTitleCase } from '../utils/textFormatters';
import { DOCUMENTACION_CONFIG } from '../utils/documentacionConfig.js';
import { createAuditLog } from './auditService';

export const marcarDevolucionComoPagada = async (renunciaId, datosDevolucion) => {
    const renunciaRef = doc(db, "renuncias", renunciaId);
    await runTransaction(db, async (transaction) => {
        const renunciaDoc = await transaction.get(renunciaRef);
        if (!renunciaDoc.exists()) throw new Error("El registro de renuncia no existe.");
        const renunciaData = renunciaDoc.data();
        transaction.update(renunciaRef, { estadoDevolucion: 'Cerrada', ...datosDevolucion });
        if (renunciaData.clienteId) {
            const clienteRef = doc(db, "clientes", renunciaData.clienteId);
            transaction.update(clienteRef, {
                status: 'renunciado',
                viviendaId: null,
                proceso: {},
                financiero: {}
            });
        }
        (renunciaData.historialAbonos || []).forEach(abono => {
            transaction.update(doc(db, "abonos", abono.id), { estadoProceso: 'archivado' });
        });
    });
};

export const cancelarRenuncia = async (renuncia) => {
    const clienteRef = doc(db, "clientes", renuncia.clienteId);
    const viviendaRef = doc(db, "viviendas", renuncia.viviendaId);
    const renunciaRef = doc(db, "renuncias", renuncia.id);
    await runTransaction(db, async (transaction) => {
        const viviendaDoc = await transaction.get(viviendaRef);
        if (!viviendaDoc.exists()) throw new Error("La vivienda original ya no existe.");
        if (viviendaDoc.data().clienteId) {
            throw new Error("VIVIENDA_NO_DISPONIBLE");
        }
        transaction.update(viviendaRef, {
            clienteId: renuncia.clienteId,
            clienteNombre: renuncia.clienteNombre,
            totalAbonado: renuncia.totalAbonadoOriginal,
            saldoPendiente: viviendaDoc.data().valorFinal - renuncia.totalAbonadoOriginal
        });
        transaction.update(clienteRef, {
            viviendaId: renuncia.viviendaId,
            status: 'activo',
            financiero: renuncia.financieroArchivado,
            proceso: renuncia.procesoArchivado || {}
        });
        renuncia.historialAbonos.forEach(abono => {
            transaction.update(doc(db, "abonos", abono.id), { estadoProceso: 'activo' });
        });
        transaction.delete(renunciaRef);
    });
};

export const updateRenuncia = async (renunciaId, datosParaActualizar) => {
    const renunciaRef = doc(db, "renuncias", renunciaId);
    await updateDoc(renunciaRef, datosParaActualizar);
};
