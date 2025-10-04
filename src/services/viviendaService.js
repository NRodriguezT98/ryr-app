import { db } from '../firebase/config';
import { collection, addDoc, doc, updateDoc, getDoc, writeBatch, query, where, getDocs } from "firebase/firestore";
import { toSentenceCase } from '../utils/textFormatters';
import { createAuditLog } from './auditService';

export const addVivienda = async (viviendaData) => {
    const valorTotalFinal = viviendaData.valorTotal;
    const nuevaVivienda = {
        ...viviendaData,
        status: 'disponible',
        nomenclatura: toSentenceCase(viviendaData.nomenclatura),
        linderoNorte: toSentenceCase(viviendaData.linderoNorte),
        linderoSur: toSentenceCase(viviendaData.linderoSur),
        linderoOriente: toSentenceCase(viviendaData.linderoOriente),
        linderoOccidente: toSentenceCase(viviendaData.linderoOccidente),
        areaLote: parseFloat(String(viviendaData.areaLote).replace(',', '.')) || 0,
        areaConstruida: parseFloat(String(viviendaData.areaConstruida).replace(',', '.')) || 0,
        clienteId: null,
        clienteNombre: "",
        totalAbonado: 0,
        saldoPendiente: valorTotalFinal,
        valorFinal: valorTotalFinal,
    };
    const docRef = await addDoc(collection(db, "viviendas"), nuevaVivienda);
    return docRef;
};

export const archiveVivienda = async (vivienda, nombreProyecto) => {
    if (vivienda.clienteId) {
        throw new Error("No se puede archivar una vivienda que está asignada a un cliente.");
    }

    const viviendaRef = doc(db, "viviendas", vivienda.id);

    await updateDoc(viviendaRef, {
        status: 'archivada',
        fechaArchivado: new Date().toISOString()
    });

    const nombreVivienda = `Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`;
    await createAuditLog(
        `Archivó la vivienda ${nombreVivienda} del proyecto "${nombreProyecto}"`,
        {
            action: 'ARCHIVE_VIVIENDA',
            viviendaId: vivienda.id,
            viviendaNombre: nombreVivienda,
            proyecto: {
                id: vivienda.proyectoId,
                nombre: nombreProyecto
            },
            // Snapshot AHORA con TODOS los datos
            snapshotVivienda: {
                matricula: vivienda.matricula,
                nomenclatura: vivienda.nomenclatura,
                areaLote: `${vivienda.areaLote} m²`,
                areaConstruida: `${vivienda.areaConstruida} m²`,
                valorTotal: vivienda.valorTotal,
                esEsquinera: vivienda.esEsquinera ? 'Sí' : 'No', // <-- AÑADIDO
                linderoNorte: vivienda.linderoNorte,             // <-- AÑADIDO
                linderoSur: vivienda.linderoSur,                 // <-- AÑADIDO
                linderoOriente: vivienda.linderoOriente,         // <-- AÑADIDO
                linderoOccidente: vivienda.linderoOccidente      // <-- AÑADIDO
            }
        }
    );
    // --- FIN DE LA CORRECCIÓN ---
};

export const restoreVivienda = async (vivienda, nombreProyecto) => {
    // Regla de negocio: solo se pueden restaurar viviendas archivadas.
    if (vivienda.status !== 'archivada') {
        throw new Error("Esta vivienda no está archivada y no puede ser restaurada.");
    }

    const viviendaRef = doc(db, "viviendas", vivienda.id);

    // Actualizamos el estado de la vivienda a 'disponible'
    await updateDoc(viviendaRef, {
        status: 'disponible',
        fechaRestaurado: new Date().toISOString()
    });

    // Creamos el registro de auditoría
    const nombreVivienda = `Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`;
    await createAuditLog(
        `Restauró la vivienda ${nombreVivienda} del proyecto ${nombreProyecto} `,
        {
            action: 'RESTORE_VIVIENDA',
            viviendaId: vivienda.id,
            viviendaNombre: nombreVivienda,
            proyectoNombre: nombreProyecto,
            details: 'La vivienda fue restaurada y ahora está disponible en la lista principal.'
        }
    );
};

export const updateVivienda = async (id, datosActualizados, auditContext) => {
    const viviendaRef = doc(db, "viviendas", String(id));
    const viviendaSnap = await getDoc(viviendaRef);

    if (!viviendaSnap.exists()) {
        throw new Error("La vivienda no existe.");
    }

    const viviendaOriginal = viviendaSnap.data();

    // --- INICIO DE LA REFRACTORIZACIÓN ---
    // 1. Preparamos un único objeto 'datosFinales' con todas las transformaciones.
    let datosFinales = { ...datosActualizados };

    // Regla de negocio: Protección de campos financieros si ya tiene un cliente.
    if (viviendaOriginal.clienteId) {
        datosFinales.valorBase = viviendaOriginal.valorBase;
        datosFinales.recargoEsquinera = viviendaOriginal.recargoEsquinera;
        datosFinales.valorTotal = viviendaOriginal.valorTotal;

        if (datosFinales.proyectoId !== viviendaOriginal.proyectoId) {
            console.warn("Intento de cambio de proyecto bloqueado para vivienda asignada.");
            datosFinales.proyectoId = viviendaOriginal.proyectoId;
        }
    }

    // Conversión de tipos y cálculos necesarios.
    if (datosFinales.areaLote !== undefined) {
        datosFinales.areaLote = parseFloat(String(datosFinales.areaLote).replace(',', '.')) || 0;
    }
    if (datosFinales.areaConstruida !== undefined) {
        datosFinales.areaConstruida = parseFloat(String(datosFinales.areaConstruida).replace(',', '.')) || 0;
    }
    if (datosFinales.valorTotal !== undefined || datosFinales.descuentoMonto !== undefined) {
        const nuevoValorTotal = datosFinales.valorTotal !== undefined ? datosFinales.valorTotal : viviendaOriginal.valorTotal;
        const nuevoDescuento = datosFinales.descuentoMonto !== undefined ? datosFinales.descuentoMonto : (viviendaOriginal.descuentoMonto || 0);
        datosFinales.valorFinal = nuevoValorTotal - nuevoDescuento;
        datosFinales.saldoPendiente = datosFinales.valorFinal - (viviendaOriginal.totalAbonado || 0);
    }

    const cambios = [];

    const formatAuditValue = (key, value) => {
        if (value === null || typeof value === 'undefined') return 'No definido';
        if (key === 'urlCertificadoTradicion') return value ? 'Documento Anexado' : 'Sin Documento';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    Object.keys(datosFinales).forEach(key => {
        if (viviendaOriginal[key] !== datosFinales[key]) {
            // 👇 3. Lógica especial para el proyecto usando el contexto
            if (key === 'proyectoId') {
                cambios.push({
                    campo: 'Proyecto', // Usamos un nombre legible directamente
                    anterior: auditContext.proyectoAnteriorNombre,
                    actual: auditContext.proyectoActualNombre
                });
            } else {
                cambios.push({
                    campo: key,
                    anterior: formatAuditValue(key, viviendaOriginal[key]),
                    actual: formatAuditValue(key, datosFinales[key])
                });
            }
        }
    });

    await updateDoc(viviendaRef, datosFinales);


    if (cambios.length > 0) {
        console.log("DEBUG: Verificando datos para auditoría de UPDATE_VIVIENDA", {
            proyectoId_en_vivienda: viviendaOriginal.proyectoId,
            contexto_recibido: auditContext
        });
        const nombreVivienda = `Mz ${viviendaOriginal.manzana} - Casa ${viviendaOriginal.numeroCasa}`;
        await createAuditLog(
            `Actualizó la vivienda ${nombreVivienda} del proyecto "${auditContext.proyectoActualNombre}"`,
            {
                action: 'UPDATE_VIVIENDA',
                viviendaId: id,
                viviendaNombre: nombreVivienda,
                cambios: cambios,

                // --- AÑADIMOS LA INFORMACIÓN QUE FALTA ---
                proyecto: {
                    id: viviendaOriginal.proyectoId,
                    nombre: auditContext.proyectoActualNombre
                },
                // Solo añadimos el cliente si la vivienda tiene uno asignado
                cliente: viviendaOriginal.clienteId ? {
                    id: viviendaOriginal.clienteId,
                    nombre: viviendaOriginal.clienteNombre
                } : null
            }
        );
    }
};

export const deleteViviendaPermanently = async (vivienda, nombreProyecto) => {
    // 1. Recibimos el objeto 'vivienda' completo y el 'nombreProyecto'.
    const viviendaRef = doc(db, "viviendas", vivienda.id);
    const nombreVivienda = `Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`;

    const batch = writeBatch(db);

    // 2. Buscamos y añadimos al batch la eliminación de renuncias asociadas.
    const renunciasQuery = query(collection(db, "renuncias"), where("viviendaId", "==", vivienda.id));
    const renunciasSnapshot = await getDocs(renunciasQuery);
    renunciasSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    // 3. Añadimos la eliminación de la propia vivienda al batch.
    batch.delete(viviendaRef);

    // 4. Ejecutamos todas las eliminaciones en una sola operación atómica.
    await batch.commit();

    // 5. Creamos el registro de auditoría con la "ficha técnica" completa.
    await createAuditLog(
        `Eliminó permanentemente la vivienda ${nombreVivienda} del proyecto "${nombreProyecto}"`,
        {
            action: 'DELETE_VIVIENDA',
            viviendaId: vivienda.id,
            viviendaNombre: nombreVivienda,
            proyectoNombre: nombreProyecto,
            // Snapshot de la ficha técnica al momento de la eliminación
            snapshotVivienda: {
                matricula: vivienda.matricula,
                nomenclatura: vivienda.nomenclatura,
                areaLote: `${vivienda.areaLote} m²`,
                areaConstruida: `${vivienda.areaConstruida} m²`,
                linderoNorte: vivienda.linderoNorte,
                linderoSur: vivienda.linderoSur,
                linderoOriente: vivienda.linderoOriente,
                linderoOccidente: vivienda.linderoOccidente,
            }
        }
    );
};