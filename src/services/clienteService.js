import { db } from '../firebase/config';
import { collection, doc, updateDoc, deleteDoc, getDoc, writeBatch, setDoc, query, where, getDocs, addDoc } from "firebase/firestore";
import { toTitleCase, formatDisplayDate } from '../utils/textFormatters';
import { PROCESO_CONFIG } from '../utils/procesoConfig.js';
import { createAuditLog } from './auditService';
import { deleteFile } from './fileService';

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
        // AUDITORÍA: Se registra la creación del cliente

    } else {
        await setDoc(newClienteRef, clienteParaGuardar);
    }
};

export const updateCliente = async (clienteId, clienteActualizado, viviendaOriginalId, auditDetails = {}) => {
    const clienteRef = doc(db, "clientes", String(clienteId));

    const clienteOriginalSnap = await getDoc(clienteRef);
    if (!clienteOriginalSnap.exists()) {
        throw new Error("El cliente que intentas actualizar no existe.");
    }
    const clienteOriginal = clienteOriginalSnap.data();

    // Lógica de seguridad para la fecha de ingreso
    const fechaOriginal = clienteOriginal.datosCliente.fechaIngreso;
    const fechaNueva = clienteActualizado.datosCliente.fechaIngreso;

    if (fechaOriginal !== fechaNueva) {
        // Obtenemos los abonos para verificar la primera condición
        const abonosQuery = query(collection(db, "abonos"), where("clienteId", "==", clienteId));
        const abonosSnap = await getDocs(abonosQuery);

        // Verificamos si hay más de un paso completado
        const procesoOriginal = clienteOriginal.proceso || {};
        const otrosPasosCompletados = Object.keys(procesoOriginal).filter(key =>
            procesoOriginal[key]?.completado && key !== 'promesaEnviada'
        ).length;

        // Si alguna de las condiciones de bloqueo se cumple, revertimos el cambio.
        if (abonosSnap.size > 0 || otrosPasosCompletados > 0) {
            console.warn("Intento de cambio de fecha de ingreso bloqueado para cliente con proceso avanzado.");
            // Revertimos silenciosamente el cambio de fecha al valor original
            clienteActualizado.datosCliente.fechaIngreso = fechaOriginal;
            // También revertimos la fecha sincronizada del proceso si existe
            if (clienteActualizado.proceso?.promesaEnviada) {
                clienteActualizado.proceso.promesaEnviada.fecha = fechaOriginal;
            }
        }
    }


    // 1. Lógica para sincronizar el proceso del cliente
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
                completado: false, fecha: null, evidencias, archivado: false
            };
        }
        if (existeEnProceso && aplicaAhora && existeEnProceso.archivado) {
            procesoSincronizado[pasoConfig.key].archivado = false;
        }
    });

    const datosFinales = { ...clienteActualizado, proceso: procesoSincronizado };

    // 2. Lógica para actualizar las viviendas
    const batch = writeBatch(db);
    batch.update(clienteRef, datosFinales);
    const nuevaViviendaId = datosFinales.viviendaId;
    const nombreCompleto = `${datosFinales.datosCliente.nombres} ${datosFinales.datosCliente.apellidos}`.trim();
    if (viviendaOriginalId !== nuevaViviendaId) {
        if (viviendaOriginalId) {
            batch.update(doc(db, "viviendas", String(viviendaOriginalId)), { clienteId: null, clienteNombre: "" });
        }
        if (nuevaViviendaId) {
            batch.update(doc(db, "viviendas", String(nuevaViviendaId)), { clienteId: clienteId, clienteNombre: nombreCompleto });
        }
    } else if (nuevaViviendaId) {
        batch.update(doc(db, "viviendas", String(nuevaViviendaId)), { clienteNombre: nombreCompleto });
    }

    // 3. Se ejecuta la escritura en la base de datos
    await batch.commit();

    // 4. Lógica de auditoría centralizada
    const { action, cambios, snapshotCompleto, nombreNuevaVivienda } = auditDetails;
    const clienteNombreCompleto = toTitleCase(`${clienteActualizado.datosCliente.nombres} ${clienteActualizado.datosCliente.apellidos}`);

    if (action === 'RESTART_CLIENT_PROCESS') {
        await createAuditLog(
            `Inició un nuevo proceso para el cliente ${clienteNombreCompleto}`,
            {
                action: 'RESTART_CLIENT_PROCESS',
                clienteId: clienteId,
                clienteNombre: clienteNombreCompleto,
                nombreNuevaVivienda: nombreNuevaVivienda || 'No especificado',
                snapshotCompleto: snapshotCompleto
            }
        );
    } else {
        await createAuditLog(
            `Actualizó los datos del cliente ${clienteNombreCompleto} (C.C. ${clienteId})`,
            {
                action: 'UPDATE_CLIENT',
                clienteId: clienteId,
                clienteNombre: clienteNombreCompleto,
                cambios: cambios || []
            }
        );
    }
};

export const deleteCliente = async (clienteId) => {
    await deleteDoc(doc(db, "clientes", String(clienteId)));
};

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

export const restaurarCliente = async (clienteId) => {
    // Obtenemos los datos del cliente ANTES de restaurarlo para la auditoría.
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

    // Creamos el registro de auditoría
    await createAuditLog(
        `Restauró al cliente ${toTitleCase(nombreCompleto)} (C.C. ${clienteId})`,
        {
            action: 'RESTORE_CLIENT', // Nuevo tipo de acción
            clienteId: clienteId,
            clienteNombre: nombreCompleto,
        }
    );

};

export const deleteClientePermanently = async (clienteId) => {
    // Obtenemos los datos del cliente ANTES de que sea eliminado.
    const clienteRef = doc(db, "clientes", clienteId);
    const clienteSnap = await getDoc(clienteRef);
    const clienteData = clienteSnap.exists() ? clienteSnap.data() : null;
    const clienteNombre = clienteData ? toTitleCase(`${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`) : `C.C. ${clienteId}`;

    const renunciasQuery = query(collection(db, "renuncias"), where("clienteId", "==", clienteId));
    const renunciasSnapshot = await getDocs(renunciasQuery);
    const renunciasCliente = renunciasSnapshot.docs.map(doc => doc.data());
    const batch = writeBatch(db);

    // Eliminar archivos de Storage
    for (const renuncia of renunciasCliente) {
        if (renuncia.documentosArchivados && renuncia.documentosArchivados.length > 0) {
            for (const docInfo of renuncia.documentosArchivados) {
                if (docInfo.url) {
                    try {
                        const fileRef = ref(storage, docInfo.url);
                        await deleteObject(fileRef);
                    } catch (error) {
                        if (error.code !== 'storage/object-not-found') {
                            console.error("Error al eliminar archivo de Storage:", error);
                        }
                    }
                }
            }
        }
    }

    // 2. Eliminar documentos de Firestore
    renunciasSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    batch.delete(doc(db, "clientes", clienteId));


    await batch.commit();

    // Creamos el registro de auditoría después de confirmar la eliminación.
    await createAuditLog(
        `Eliminó permanentemente al cliente ${clienteNombre}`,
        {
            action: 'DELETE_CLIENT_PERMANENTLY',
            clienteId: clienteId,
            clienteNombre: clienteNombre,
            // Guardamos una copia completa de los datos por si se necesita para una futura revisión.
            clienteDataBackup: clienteData
        }
    );
};

export const generarActividadProceso = (procesoOriginal, procesoActual, userName) => {
    const nuevoProcesoConActividad = JSON.parse(JSON.stringify(procesoActual));

    PROCESO_CONFIG.forEach(pasoConfig => {
        const key = pasoConfig.key;
        const pasoOriginal = procesoOriginal[key] || {};
        const pasoActual = nuevoProcesoConActividad[key];

        if (!pasoActual) return;
        if (!pasoActual.actividad) {
            pasoActual.actividad = pasoOriginal.actividad || [];
        }

        const crearEntrada = (mensaje) => ({
            mensaje,
            userName,
            fecha: new Date()
        });

        // 1. Manejo del "Super-Caso": Reabrir, modificar y volver a completar
        if (pasoOriginal.completado && pasoActual.completado) {
            let accionDeFecha = null;
            let accionesDeEvidencia = [];

            if (pasoOriginal.fecha !== pasoActual.fecha) {
                accionDeFecha = `modificó la fecha de completado a ${formatDisplayDate(pasoActual.fecha)}`;
            }

            pasoConfig.evidenciasRequeridas.forEach(ev => {
                const idEvidencia = ev.id;
                const urlOriginal = pasoOriginal.evidencias?.[idEvidencia]?.url;
                const urlActual = pasoActual.evidencias?.[idEvidencia]?.url;
                if (urlOriginal !== urlActual) {
                    accionesDeEvidencia.push(urlActual ? `se reemplazó la evidencia '${ev.label}'` : `eliminó la evidencia '${ev.label}'`);
                }
            });

            // Si hay un motivo de reapertura, o algún cambio, generamos un log unificado.
            if (pasoActual.motivoReapertura || accionDeFecha || accionesDeEvidencia.length > 0) {
                const partesDelMensaje = [];
                if (accionesDeEvidencia.length > 0) {
                    partesDelMensaje.push(accionesDeEvidencia.join(', '));
                }
                if (accionDeFecha) {
                    partesDelMensaje.push(accionDeFecha);
                }

                let mensajeInicial = 'Se actualizó el paso:';
                if (pasoActual.motivoReapertura) {
                    mensajeInicial = `Se reabrió el paso por el motivo: "${pasoActual.motivoReapertura}". Posteriormente,`;
                }

                const mensajeCompleto = `${mensajeInicial} ${partesDelMensaje.join(' y ')}.`;
                pasoActual.actividad.push(crearEntrada(mensajeCompleto.trim()));

                // Solución Bug #1: Limpiamos la propiedad temporal para evitar el doble guardado.
                delete pasoActual.motivoReapertura;
                return;
            }
        }

        // 2. Lógica para los demás casos (se mantiene igual)
        let seCompletoEnEsteCambio = !pasoOriginal.completado && pasoActual.completado;
        // ... (el resto de la función se mantiene exactamente igual que antes)

        let evidenciasSubidasMsg = [];

        pasoConfig.evidenciasRequeridas.forEach(ev => {
            const idEvidencia = ev.id;
            const urlOriginal = pasoOriginal.evidencias?.[idEvidencia]?.url;
            const urlActual = pasoActual.evidencias?.[idEvidencia]?.url;
            if (urlActual && !urlOriginal) {
                evidenciasSubidasMsg.push(`'${ev.label}'`);
            }
        });

        if (seCompletoEnEsteCambio) {
            let msg = `Paso completado con fecha ${formatDisplayDate(pasoActual.fecha)}.`;
            if (evidenciasSubidasMsg.length > 0) {
                msg = `Se subió la evidencia ${evidenciasSubidasMsg.join(', ')} y se completó el paso con fecha ${formatDisplayDate(pasoActual.fecha)}.`;
            }
            pasoActual.actividad.push(crearEntrada(msg));
        } else if (evidenciasSubidasMsg.length > 0) {
            pasoActual.actividad.push(crearEntrada(`Se subió la evidencia ${evidenciasSubidasMsg.join(', ')}.`));
        } else if (pasoOriginal.completado && !pasoActual.completado) {
            let mensaje = 'Paso reabierto.';
            if (pasoActual.motivoReapertura) {
                mensaje += ` Motivo: "${pasoActual.motivoReapertura}"`;
                delete pasoActual.motivoReapertura; // Limpiamos también aquí por consistencia
            }
            pasoActual.actividad.push(crearEntrada(mensaje));
        }
    });

    return nuevoProcesoConActividad;
};

export const renunciarAVivienda = async (clienteId, motivo, observacion = '', fechaRenuncia, penalidadMonto = 0, penalidadMotivo = '') => {
    const clienteRef = doc(db, "clientes", clienteId);
    let clienteNombre = '';
    let viviendaInfoParaLog = '';
    let renunciaIdParaNotificacion = '';

    await runTransaction(db, async (transaction) => {
        const clienteDoc = await transaction.get(clienteRef);
        if (!clienteDoc.exists()) throw new Error("El cliente ya no existe.");

        const clienteData = clienteDoc.data();
        const viviendaId = clienteData.viviendaId;
        if (!viviendaId) throw new Error("El cliente no tiene una vivienda asignada para renunciar.");

        const viviendaRef = doc(db, "viviendas", viviendaId);
        const viviendaDoc = await transaction.get(viviendaRef);
        if (!viviendaDoc.exists()) throw new Error("La vivienda ya no existe.");

        const viviendaData = viviendaDoc.data();
        clienteNombre = `${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`.trim();
        viviendaInfoParaLog = `Mz ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}`; // Guardamos info para el log

        const abonosActivosQuery = query(collection(db, "abonos"), where("clienteId", "==", clienteId), where("viviendaId", "==", viviendaId), where("estadoProceso", "==", "activo"));
        const abonosSnapshot = await getDocs(abonosActivosQuery);
        const abonosDelCiclo = abonosSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const abonosRealesDelCliente = abonosDelCiclo.filter(abono => abono.metodoPago !== 'Condonación de Saldo');
        const totalAbonadoReal = abonosRealesDelCliente.reduce((sum, abono) => sum + abono.monto, 0);
        const totalADevolver = totalAbonadoReal - penalidadMonto;
        const estadoInicialRenuncia = totalADevolver > 0 ? 'Pendiente' : 'Cerrada';

        const renunciaRef = doc(collection(db, "renuncias"));
        renunciaIdParaNotificacion = renunciaRef.id;

        // --- INICIO DE LA CORRECCIÓN ---
        // Se restaura la lógica para recolectar todos los documentos del cliente.
        const documentosArchivados = [];
        DOCUMENTACION_CONFIG.forEach(docConfig => {
            if (docConfig.selector) {
                const docData = docConfig.selector(clienteData);
                const url = docData?.url || (typeof docData === 'string' ? docData : null);
                if (url) {
                    documentosArchivados.push({ label: docConfig.label, url: url });
                }
            }
        });
        // --- FIN DE LA CORRECCIÓN ---

        const registroRenuncia = {
            id: renunciaRef.id, clienteId, clienteNombre, viviendaId,
            viviendaInfo: `Mz. ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}`,
            fechaRenuncia, totalAbonadoOriginal: totalAbonadoReal, penalidadMonto, penalidadMotivo,
            totalAbonadoParaDevolucion: totalADevolver, estadoDevolucion: estadoInicialRenuncia,
            motivo, observacion, historialAbonos: abonosDelCiclo,
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
        transaction.update(viviendaRef, { clienteId: null, clienteNombre: "", totalAbonado: 0, saldoPendiente: viviendaData.valorTotal });

        if (estadoInicialRenuncia === 'Pendiente') {
            transaction.update(clienteRef, { status: 'enProcesoDeRenuncia' });
        } else {
            transaction.update(clienteRef, { viviendaId: null, proceso: {}, financiero: {}, status: 'renunciado' });
            registroRenuncia.fechaDevolucion = new Date().toISOString();
            transaction.update(renunciaRef, { fechaDevolucion: registroRenuncia.fechaDevolucion });
            abonosDelCiclo.forEach(abono => {
                transaction.update(doc(db, "abonos", abono.id), { estadoProceso: 'archivado' });
            });
        }
    });

    await createAuditLog(
        `Registró la renuncia del cliente ${toTitleCase(clienteNombre)} a la vivienda ${viviendaInfoParaLog}`,
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

    return { renunciaId: renunciaIdParaNotificacion, clienteNombre };
};

export const anularCierreProceso = async (clienteId) => {
    const clienteRef = doc(db, "clientes", clienteId);

    await runTransaction(db, async (transaction) => {
        const clienteDoc = await transaction.get(clienteRef);
        if (!clienteDoc.exists()) {
            throw new Error("El cliente no existe.");
        }

        const clienteData = clienteDoc.data();
        const procesoActual = clienteData.proceso || {};

        // Verificamos si el paso 'facturaVenta' existe y está completado
        if (procesoActual.facturaVenta && procesoActual.facturaVenta.completado) {
            const nuevoProceso = {
                ...procesoActual,
                facturaVenta: {
                    ...procesoActual.facturaVenta,
                    completado: false,
                    fecha: null,
                    motivoUltimoCambio: 'Cierre anulado por administrador',
                    fechaUltimaModificacion: getTodayString()
                }
            };
            transaction.update(clienteRef, { proceso: nuevoProceso });
        } else {
            // Esto es una salvaguarda por si se intenta anular un proceso que no está cerrado.
            throw new Error("El proceso no se puede anular porque no está completado.");
        }
    });
};

export const getClienteProceso = async (clienteId) => {
    const clienteRef = doc(db, "clientes", String(clienteId));
    const clienteSnap = await getDoc(clienteRef);
    if (!clienteSnap.exists()) {
        // Lanzamos un error específico que podemos capturar si es necesario
        throw new Error("CLIENT_NOT_FOUND");
    }
    // Devolvemos solo el objeto 'proceso' o un objeto vacío si no existe
    return clienteSnap.data().proceso || {};
};

export const updateClienteProceso = async (clienteId, nuevoProceso, auditMessage, auditDetails) => {
    const clienteRef = doc(db, "clientes", String(clienteId));

    // 1. Actualizamos solo el campo 'proceso' del cliente
    await updateDoc(clienteRef, {
        proceso: nuevoProceso
    });

    // 2. Creamos el registro de auditoría detallado que construimos en el hook
    await createAuditLog(auditMessage, auditDetails);
};

export const addNotaToHistorial = async (clienteId, nota, userName) => {
    if (!nota || !nota.trim()) {
        throw new Error("La nota no puede estar vacía.");
    }

    // Obtenemos los datos del cliente para el mensaje de auditoría
    const clienteRef = doc(db, "clientes", clienteId);
    const clienteSnap = await getDoc(clienteRef);
    const clienteNombre = clienteSnap.exists() ? toTitleCase(`${clienteSnap.data().datosCliente.nombres} ${clienteSnap.data().datosCliente.apellidos}`) : '';

    // 1. Creamos un mensaje CORTO para el log general
    const auditMessage = `Añadió una nota al historial del cliente ${clienteNombre}`;

    // 2. Guardamos la NOTA COMPLETA dentro de los detalles
    await createAuditLog(
        auditMessage,
        {
            action: 'ADD_NOTE',
            clienteId: clienteId,
            clienteNombre: clienteNombre,
            nota: nota, // <-- Aquí guardamos el contenido de la nota
        }
    );
};

export const updateNotaHistorial = async (notaOriginal, nuevoTexto, userName) => {
    // La 'notaOriginal' es el objeto 'log' completo
    const notaRef = doc(db, "audits", notaOriginal.id);

    // 1. Actualizamos el mensaje de la nota original y añadimos la marca de edición
    await updateDoc(notaRef, {
        message: nuevoTexto,
        editado: true,
        fechaEdicion: new Date(),
        editadoPor: userName
    });

    const clienteNombre = notaOriginal.details.clienteNombre || '[Cliente no encontrado]';

    // Creamos el nuevo registro de auditoría para la acción de editar.
    await createAuditLog(
        `Editó una nota en el historial del cliente ${clienteNombre}`,
        {
            action: 'EDIT_NOTE',
            clienteId: notaOriginal.details.clienteId,
            notaId: notaOriginal.id,
            cambios: [{
                campo: "Contenido de la Nota",
                anterior: notaOriginal.message,
                actual: nuevoTexto
            }]
        }
    );
};