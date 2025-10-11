/**
 * Módulo CRUD básico para clientes
 * 🔥 REFACTORIZACIÓN: Extraído de clienteService.js
 * Funciones: Crear, Actualizar, Eliminar, Archivar, Restaurar
 */

import { db } from '../../firebase/config';
import {
    doc,
    updateDoc,
    deleteDoc,
    getDoc,
    writeBatch,
    setDoc,
    query,
    where,
    getDocs,
    collection
} from "firebase/firestore";
import { toTitleCase } from '../../utils/textFormatters';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';
import { createAuditLog, createAuditLogWithBuilder } from '../auditService';

/**
 * Crea un nuevo cliente y lo asigna a una vivienda
 */
export const addClienteAndAssignVivienda = async (clienteData, auditMessage, auditDetails) => {
    const newClienteRef = doc(db, "clientes", clienteData.datosCliente.cedula);
    const clienteParaGuardar = {
        ...clienteData,
        id: newClienteRef.id,
        status: 'activo',
        fechaCreacion: clienteData.datosCliente.fechaIngreso,
        fechaInicioProceso: clienteData.datosCliente.fechaIngreso
    };

    if (clienteData.viviendaId) {
        const viviendaRef = doc(db, "viviendas", String(clienteData.viviendaId));
        const batch = writeBatch(db);
        batch.set(newClienteRef, clienteParaGuardar);
        batch.update(viviendaRef, {
            clienteId: newClienteRef.id,
            clienteNombre: `${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`.trim()
        });
        await batch.commit();

        if (auditMessage && auditDetails) {
            await createAuditLog(auditMessage, auditDetails);
        }
    } else {
        await setDoc(newClienteRef, clienteParaGuardar);
    }
};

/**
 * Actualiza los datos de un cliente existente
 */
export const updateCliente = async (clienteId, clienteActualizado, viviendaOriginalId, auditDetails = {}) => {
    const clienteRef = doc(db, "clientes", String(clienteId));

    const clienteOriginalSnap = await getDoc(clienteRef);
    if (!clienteOriginalSnap.exists()) {
        throw new Error("El cliente que intentas actualizar no existe.");
    }
    const clienteOriginal = clienteOriginalSnap.data();

    const viviendaIdOriginal = clienteOriginal.viviendaId;
    const viviendaIdNueva = clienteActualizado.viviendaId;

    // Validar cambio de vivienda
    if (viviendaIdOriginal !== viviendaIdNueva) {
        const abonosQuery = query(
            collection(db, "abonos"),
            where("clienteId", "==", clienteId),
            where("estadoProceso", "==", "activo")
        );
        const abonosSnap = await getDocs(abonosQuery);

        if (abonosSnap.size > 0) {
            throw new Error("No se puede cambiar la vivienda de un cliente con abonos. Use la opción 'Transferir Vivienda'.");
        }
    }

    // Lógica de seguridad para la fecha de ingreso
    const fechaOriginal = clienteOriginal.datosCliente.fechaIngreso;
    const fechaNueva = clienteActualizado.datosCliente.fechaIngreso;

    if (fechaOriginal !== fechaNueva) {
        const abonosQuery = query(
            collection(db, "abonos"),
            where("clienteId", "==", clienteId),
            where("estadoProceso", "==", "activo")
        );
        const abonosSnap = await getDocs(abonosQuery);

        const procesoOriginal = clienteOriginal.proceso || {};
        const otrosPasosCompletados = Object.keys(procesoOriginal).filter(key =>
            procesoOriginal[key]?.completado && key !== 'promesaEnviada'
        ).length;

        if (abonosSnap.size > 0 || otrosPasosCompletados > 0) {
            console.warn("Intento de cambio de fecha de ingreso bloqueado para cliente con proceso avanzado.");
            clienteActualizado.datosCliente.fechaIngreso = fechaOriginal;
            if (clienteActualizado.proceso?.promesaEnviada) {
                clienteActualizado.proceso.promesaEnviada.fecha = fechaOriginal;
            }
        }
    }

    // Sincronizar proceso del cliente
    const procesoSincronizado = { ...(clienteActualizado.proceso || {}) };
    PROCESO_CONFIG.forEach(pasoConfig => {
        const aplicaAhora = pasoConfig.aplicaA(clienteActualizado.financiero || {});
        const existeEnProceso = procesoSincronizado[pasoConfig.key];

        if (existeEnProceso && !aplicaAhora) {
            procesoSincronizado[pasoConfig.key].archivado = true;
        }
        if (!existeEnProceso && aplicaAhora) {
            const evidencias = {};
            pasoConfig.evidenciasRequeridas.forEach(ev => {
                evidencias[ev.id] = { url: null, estado: 'pendiente' };
            });
            procesoSincronizado[pasoConfig.key] = {
                completado: false,
                fecha: null,
                evidencias,
                archivado: false
            };
        }
        if (existeEnProceso && aplicaAhora && existeEnProceso.archivado) {
            procesoSincronizado[pasoConfig.key].archivado = false;
        }
    });

    const datosFinales = { ...clienteActualizado, proceso: procesoSincronizado };

    // Actualizar viviendas
    const batch = writeBatch(db);
    batch.update(clienteRef, datosFinales);

    const nuevaViviendaId = datosFinales.viviendaId;
    const nombreCompleto = `${datosFinales.datosCliente.nombres} ${datosFinales.datosCliente.apellidos}`.trim();

    if (viviendaOriginalId !== nuevaViviendaId) {
        if (viviendaOriginalId) {
            batch.update(doc(db, "viviendas", String(viviendaOriginalId)), {
                clienteId: null,
                clienteNombre: ""
            });
        }
        if (nuevaViviendaId) {
            batch.update(doc(db, "viviendas", String(nuevaViviendaId)), {
                clienteId: clienteId,
                clienteNombre: nombreCompleto
            });
        }
    } else if (nuevaViviendaId) {
        batch.update(doc(db, "viviendas", String(nuevaViviendaId)), {
            clienteNombre: nombreCompleto
        });
    }

    await batch.commit();

    // Auditoría
    const { action, cambios, snapshotCompleto, nombreNuevaVivienda } = auditDetails;
    const clienteNombreCompleto = toTitleCase(`${clienteActualizado.datosCliente.nombres} ${clienteActualizado.datosCliente.apellidos}`);

    if (action === 'RESTART_CLIENT_PROCESS') {
        await createAuditLogWithBuilder(
            'RESTART_CLIENT_PROCESS',
            {
                category: 'clientes',
                clienteId: clienteId,
                clienteNombre: clienteNombreCompleto,
                nombreNuevaVivienda: nombreNuevaVivienda || 'No especificado',
                snapshotCompleto: snapshotCompleto
            }
        );
    } else {
        const cambiosRegulares = [];
        const cambiosArchivos = [];

        (cambios || []).forEach(cambio => {
            if (cambio.fileChange) {
                cambiosArchivos.push({
                    ...cambio,
                    fileAuditInfo: {
                        documentType: cambio.campo,
                        changeType: cambio.fileChange.type,
                        previousUrl: cambio.fileChange.previousUrl,
                        newUrl: cambio.fileChange.newUrl,
                        timestamp: cambio.fileChange.timestamp,
                        metadata: {
                            previousExists: !!cambio.fileChange.previousUrl,
                            newExists: !!cambio.fileChange.newUrl
                        }
                    }
                });
            } else {
                cambiosRegulares.push(cambio);
            }
        });

        await createAuditLog(
            `Actualizó los datos del cliente ${clienteNombreCompleto} (C.C. ${clienteId})`,
            {
                action: 'UPDATE_CLIENT',
                clienteId: clienteId,
                clienteNombre: clienteNombreCompleto,
                cambios: cambios || [],
                auditDetails: {
                    cambiosRegulares: cambiosRegulares,
                    cambiosArchivos: cambiosArchivos,
                    totalCambios: (cambios || []).length,
                    tieneArchivos: cambiosArchivos.length > 0
                }
            }
        );
    }
};

/**
 * Elimina un cliente (soft delete - no implementado, usa inactivarCliente)
 */
export const deleteCliente = async (clienteId) => {
    await deleteDoc(doc(db, "clientes", String(clienteId)));
};

/**
 * Archiva un cliente (cambia status a inactivo)
 */
export const inactivarCliente = async (clienteId, clienteNombre) => {
    await updateDoc(doc(db, "clientes", String(clienteId)), {
        status: 'inactivo',
        fechaInactivacion: new Date().toISOString()
    });

    await createAuditLog(
        `Archivó al cliente ${toTitleCase(clienteNombre)} (C.C. ${clienteId})`,
        {
            action: 'ARCHIVE_CLIENT',
            clienteId: clienteId,
            clienteNombre: toTitleCase(clienteNombre)
        }
    );
};

/**
 * Restaura un cliente archivado
 */
export const restaurarCliente = async (clienteId) => {
    const clienteRef = doc(db, "clientes", String(clienteId));
    const clienteSnap = await getDoc(clienteRef);

    if (!clienteSnap.exists()) {
        throw new Error("El cliente no existe.");
    }

    const clienteData = clienteSnap.data();
    const nombreCompleto = `${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`;

    await updateDoc(doc(db, "clientes", String(clienteId)), {
        status: 'renunciado'
    });

    await createAuditLog(
        `Restauró al cliente ${toTitleCase(nombreCompleto)} (C.C. ${clienteId})`,
        {
            action: 'RESTORE_CLIENT',
            clienteId: clienteId,
            clienteNombre: nombreCompleto,
        }
    );
};

/**
 * Elimina permanentemente un cliente y todas sus renuncias asociadas
 */
export const deleteClientePermanently = async (clienteId) => {
    const clienteRef = doc(db, "clientes", clienteId);
    const clienteSnap = await getDoc(clienteRef);
    const clienteData = clienteSnap.exists() ? clienteSnap.data() : null;
    const clienteNombre = clienteData
        ? toTitleCase(`${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`)
        : `C.C. ${clienteId}`;

    const renunciasQuery = query(collection(db, "renuncias"), where("clienteId", "==", clienteId));
    const renunciasSnapshot = await getDocs(renunciasQuery);
    const renunciasCliente = renunciasSnapshot.docs.map(doc => doc.data());

    const batch = writeBatch(db);

    // Eliminar archivos de Storage (si existen)
    for (const renuncia of renunciasCliente) {
        if (renuncia.documentosArchivados && renuncia.documentosArchivados.length > 0) {
            for (const docInfo of renuncia.documentosArchivados) {
                if (docInfo.url) {
                    try {
                        // Importar dinámicamente si se necesita
                        const { deleteFile } = await import('../fileService');
                        await deleteFile(docInfo.url);
                    } catch (error) {
                        console.error("Error al eliminar archivo:", error);
                    }
                }
            }
        }
    }

    // Eliminar documentos de Firestore
    renunciasSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    batch.delete(doc(db, "clientes", clienteId));

    await batch.commit();

    await createAuditLog(
        `Eliminó permanentemente al cliente ${clienteNombre}`,
        {
            action: 'DELETE_CLIENT_PERMANENTLY',
            clienteId: clienteId,
            clienteNombre: clienteNombre,
            clienteDataBackup: clienteData
        }
    );
};
