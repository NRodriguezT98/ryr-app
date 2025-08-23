import { db, auth } from '../firebase/config';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, runTransaction, getDoc, writeBatch, setDoc, query, where, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { toSentenceCase, formatCurrency, toTitleCase, getTodayString } from './textFormatters';
import { PROCESO_CONFIG, FUENTE_PROCESO_MAP } from './procesoConfig.js';
import { DOCUMENTACION_CONFIG } from './documentacionConfig.js';

export const createNotification = async (type, message, link = '#') => {
    const notificationsCol = collection(db, 'notifications');
    try {
        await addDoc(notificationsCol, {
            type,
            message,
            link,
            read: false,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error al crear la notificación:", error);
    }
};

const getData = async (collectionName) => {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    return data;
};

export const getViviendas = () => getData("viviendas");
export const getClientes = () => getData("clientes");
export const getAbonos = () => getData("abonos");
export const getRenuncias = () => getData("renuncias");

const storage = getStorage();

export const uploadFile = (file, path, onProgress) => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);
            },
            (error) => {
                console.error("Error al subir archivo:", error);
                reject(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            }
        );
    });
};

export const deleteFile = async (filePath) => {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
};

export const addVivienda = async (viviendaData) => {
    const valorTotalFinal = viviendaData.valorTotal;
    const nuevaVivienda = {
        ...viviendaData,
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
    await addDoc(collection(db, "viviendas"), nuevaVivienda);

    // --- INICIO DE LA MODIFICACIÓN (AUDITORÍA) ---
    await createAuditLog(
        `Creó la vivienda Mz ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}`,
        {
            action: 'CREATE_VIVIENDA',
            viviendaInfo: {
                manzana: viviendaData.manzana,
                numeroCasa: viviendaData.numeroCasa,
                valorTotal: viviendaData.valorTotal
            }
        }
    );
};

export const addClienteAndAssignVivienda = async (clienteData) => {
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

        // AUDITORÍA: Se registra la creación del cliente
        const clienteNombreCompleto = toTitleCase(`${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`);
        await createAuditLog(
            `Creó al cliente ${clienteNombreCompleto} (C.C. ${clienteData.datosCliente.cedula})`,
            {
                clienteId: clienteData.datosCliente.cedula,
                clienteNombre: clienteNombreCompleto
            })

    } else {
        await setDoc(newClienteRef, clienteParaGuardar);
    }
};

export const addAbonoAndUpdateProceso = async (abonoData, cliente) => {
    const viviendaRef = doc(db, "viviendas", abonoData.viviendaId);
    const clienteRef = doc(db, "clientes", abonoData.clienteId);
    const abonoRef = doc(collection(db, "abonos"));

    const abonoParaGuardar = {
        ...abonoData,
        id: abonoRef.id,
        estadoProceso: 'activo'
    };

    await runTransaction(db, async (transaction) => {
        const viviendaDoc = await transaction.get(viviendaRef);
        const clienteDoc = await transaction.get(clienteRef);
        if (!viviendaDoc.exists()) throw new Error("La vivienda ya no existe.");
        if (!clienteDoc.exists()) throw new Error("El cliente ya no existe.");
        const viviendaData = viviendaDoc.data();
        const clienteData = clienteDoc.data();
        const pasoConfig = FUENTE_PROCESO_MAP[abonoData.fuente];
        if (pasoConfig) {
            const solicitudKey = pasoConfig.solicitudKey;
            const pasoSolicitud = clienteData.proceso?.[solicitudKey];
            if (!pasoSolicitud?.completado) {
                throw new Error('SOLICITUD_PENDIENTE');
            }
        }
        const nuevoTotalAbonado = (viviendaData.totalAbonado || 0) + abonoData.monto;
        const valorFinal = viviendaData.valorFinal || viviendaData.valorTotal;
        const nuevoSaldo = valorFinal - nuevoTotalAbonado;
        transaction.update(viviendaRef, { totalAbonado: nuevoTotalAbonado, saldoPendiente: nuevoSaldo });
        transaction.set(abonoRef, abonoParaGuardar);
        if (pasoConfig) {
            const desembolsoKey = pasoConfig.desembolsoKey;
            const evidenciaId = pasoConfig.evidenciaId;
            const nuevoProceso = { ...clienteData.proceso };
            if (!nuevoProceso[desembolsoKey]) nuevoProceso[desembolsoKey] = { evidencias: {} };
            if (!nuevoProceso[desembolsoKey].evidencias) nuevoProceso[desembolsoKey].evidencias = {};
            nuevoProceso[desembolsoKey].completado = true;
            nuevoProceso[desembolsoKey].fecha = abonoData.fechaPago;
            nuevoProceso[desembolsoKey].evidencias[evidenciaId] = {
                url: abonoData.urlComprobante,
                estado: abonoData.urlComprobante ? 'subido' : 'pendiente'
            };
            transaction.update(clienteRef, { proceso: nuevoProceso });
        }
    });
    const viviendaInfo = (await getDoc(viviendaRef)).data();
    const message = `Nuevo abono de ${formatCurrency(abonoData.monto)} para la vivienda Mz ${viviendaInfo.manzana} - Casa ${viviendaInfo.numeroCasa}`;
    await createNotification('abono', message, `/viviendas/detalle/${abonoData.viviendaId}`);
};

export const updateVivienda = async (id, datosActualizados) => {
    const viviendaRef = doc(db, "viviendas", String(id));
    const viviendaSnap = await getDoc(viviendaRef);

    if (!viviendaSnap.exists()) {
        throw new Error("La vivienda no existe.");
    }

    const viviendaOriginal = viviendaSnap.data();

    let datosParaGuardar = { ...datosActualizados };

    if (viviendaOriginal.clienteId) {
        datosParaGuardar.valorBase = viviendaOriginal.valorBase;
        datosParaGuardar.recargoEsquinera = viviendaOriginal.recargoEsquinera;
        datosParaGuardar.valorTotal = viviendaOriginal.valorTotal;
    }

    await updateDoc(viviendaRef, datosParaGuardar);

    // --- INICIO DE LA MODIFICACIÓN (AUDITORÍA) ---
    // 1. Detectar cambios para la auditoría
    const cambios = [];
    const formatValue = (value) => value ?? 'No definido';

    Object.keys(datosActualizados).forEach(key => {
        if (viviendaOriginal[key] !== datosActualizados[key]) {
            cambios.push({
                campo: key,
                anterior: formatValue(viviendaOriginal[key]),
                actual: formatValue(datosActualizados[key])
            });
        }
    });
    // --- FIN DE LA MODIFICACIÓN ---

    const datosFinales = { ...datosActualizados };
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
    await updateDoc(viviendaRef, datosFinales);

    // --- INICIO DE LA MODIFICACIÓN (AUDITORÍA) ---
    // 2. Registrar el log si hubo cambios
    if (cambios.length > 0) {
        const nombreVivienda = `Mz ${viviendaOriginal.manzana} - Casa ${viviendaOriginal.numeroCasa}`;
        await createAuditLog(
            `Actualizó la vivienda ${nombreVivienda}`,
            {
                action: 'UPDATE_VIVIENDA',
                viviendaId: id,
                viviendaNombre: nombreVivienda,
                cambios: cambios
            }
        );
    }
};

export const deleteViviendaPermanently = async (viviendaId) => {
    const batch = writeBatch(db);
    const viviendaRef = doc(db, "viviendas", viviendaId);

    // 1. Buscamos todas las renuncias asociadas a esta vivienda.
    const renunciasQuery = query(collection(db, "renuncias"), where("viviendaId", "==", viviendaId));
    const renunciasSnapshot = await getDocs(renunciasQuery);

    // 2. Añadimos la eliminación de cada renuncia encontrada al batch.
    renunciasSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    // 3. Añadimos la eliminación de la propia vivienda al batch.
    batch.delete(viviendaRef);

    // 4. Ejecutamos todas las eliminaciones en una sola operación atómica.
    await batch.commit();
};

export const updateCliente = async (clienteId, clienteActualizado, viviendaOriginalId, cambios = []) => {
    const clienteRef = doc(db, "clientes", String(clienteId));
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
    await batch.commit();

    // AUDITORÍA: Se registra la actualización del cliente
    const clienteNombreCompleto = toTitleCase(`${clienteActualizado.datosCliente.nombres} ${clienteActualizado.datosCliente.apellidos}`);
    await createAuditLog(
        `Actualizó los datos del cliente ${clienteNombreCompleto} (C.C. ${clienteId})`,
        {
            action: 'UPDATE_CLIENT',
            clienteId: clienteId,
            clienteNombre: clienteNombreCompleto,
            cambios: cambios
        }
    );
};

export const deleteCliente = async (clienteId) => {
    await deleteDoc(doc(db, "clientes", String(clienteId)));
};

export const inactivarCliente = async (clienteId) => {
    await updateDoc(doc(db, "clientes", String(clienteId)), {
        status: 'inactivo',
        fechaInactivacion: new Date().toISOString()
    });
};

export const restaurarCliente = async (clienteId) => {
    await updateDoc(doc(db, "clientes", String(clienteId)), {
        status: 'renunciado'
    });
};

export const deleteClientePermanently = async (clienteId) => {
    const renunciasQuery = query(collection(db, "renuncias"), where("clienteId", "==", clienteId));
    const renunciasSnapshot = await getDocs(renunciasQuery);
    const renunciasCliente = renunciasSnapshot.docs.map(doc => doc.data());
    const batch = writeBatch(db);

    // 1. Eliminar archivos de Storage
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

    // 3. Ejecutar el batch
    await batch.commit();
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
            motivoRenuncia: motivo,
            observaciones: observacion,
            penalidadAplicada: penalidadMonto > 0,
            montoPenalidad: penalidadMonto,
            motivoPenalidad: penalidadMotivo
        }
    );

    return { renunciaId: renunciaIdParaNotificacion, clienteNombre };
};

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


export const updateRenuncia = async (renunciaId, datosParaActualizar) => {
    const renunciaRef = doc(db, "renuncias", renunciaId);
    await updateDoc(renunciaRef, datosParaActualizar);
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

export const updateAbono = async (abonoId, datosNuevos, abonoOriginal) => {
    if (!abonoOriginal.viviendaId) throw new Error("El abono original no tiene una vivienda asociada.");
    const abonoRef = doc(db, "abonos", String(abonoId));
    const viviendaRef = doc(db, "viviendas", String(abonoOriginal.viviendaId));
    await runTransaction(db, async (transaction) => {
        const viviendaDoc = await transaction.get(viviendaRef);
        if (!viviendaDoc.exists()) throw "La vivienda de este abono no existe.";
        const viviendaData = viviendaDoc.data();
        const diferenciaMonto = datosNuevos.monto - abonoOriginal.monto;
        const nuevoTotalAbonado = (viviendaData.totalAbonado || 0) + diferenciaMonto;
        const nuevoSaldo = viviendaData.valorFinal - nuevoTotalAbonado;
        transaction.update(viviendaRef, { totalAbonado: nuevoTotalAbonado, saldoPendiente: nuevoSaldo });
        transaction.update(abonoRef, datosNuevos);
    });
};

export const deleteAbono = async (abonoAEliminar) => {
    if (!abonoAEliminar || !abonoAEliminar.id || !abonoAEliminar.viviendaId) {
        throw new Error("Datos del abono a eliminar incompletos.");
    }

    const abonoRef = doc(db, "abonos", String(abonoAEliminar.id));
    const viviendaRef = doc(db, "viviendas", String(abonoAEliminar.viviendaId));
    const clienteRef = doc(db, "clientes", String(abonoAEliminar.clienteId));

    await runTransaction(db, async (transaction) => {
        // --- INICIO DE LA CORRECCIÓN ---
        // 1. LEER todos los documentos necesarios PRIMERO.
        const viviendaDoc = await transaction.get(viviendaRef);
        const clienteDoc = await transaction.get(clienteRef);

        // 2. Realizar todas las operaciones de ESCRITURA y BORRADO después.
        if (viviendaDoc.exists()) {
            const viviendaData = viviendaDoc.data();
            const montoAEliminar = abonoAEliminar.monto || 0;
            const nuevoTotalAbonado = (viviendaData.totalAbonado || 0) - montoAEliminar;
            const nuevoSaldo = viviendaData.valorFinal - nuevoTotalAbonado;
            transaction.update(viviendaRef, { totalAbonado: nuevoTotalAbonado, saldoPendiente: nuevoSaldo });
        }

        const pasoConfig = FUENTE_PROCESO_MAP[abonoAEliminar.fuente];
        if (pasoConfig && pasoConfig.desembolsoKey && clienteDoc.exists()) {
            const clienteData = clienteDoc.data();
            const nuevoProceso = { ...clienteData.proceso };
            const pasoKey = pasoConfig.desembolsoKey;

            if (nuevoProceso[pasoKey]) {
                nuevoProceso[pasoKey] = {
                    ...nuevoProceso[pasoKey],
                    completado: false,
                    fecha: null
                };
                transaction.update(clienteRef, { proceso: nuevoProceso });
            }
        }

        transaction.delete(abonoRef);
        // --- FIN DE LA CORRECCIÓN ---
    });
};

export const registrarDesembolsoCredito = async (clienteId, viviendaId, desembolsoData) => {
    const viviendaRef = doc(db, "viviendas", viviendaId);
    const clienteRef = doc(db, "clientes", clienteId);
    const abonoRef = doc(collection(db, "abonos"));
    let clienteNombre = ''; // Variable para el nombre del cliente

    await runTransaction(db, async (transaction) => {
        const clienteDoc = await transaction.get(clienteRef);
        const viviendaDoc = await transaction.get(viviendaRef);
        if (!clienteDoc.exists() || !viviendaDoc.exists()) {
            throw new Error("El cliente o la vivienda no existen.");
        }
        const clienteData = clienteDoc.data();
        const viviendaData = viviendaDoc.data();

        clienteNombre = toTitleCase(`${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`);

        const montoCreditoPactado = clienteData.financiero?.credito?.monto || 0;

        const abonosPreviosSnapshot = await getDocs(query(collection(db, "abonos"), where("clienteId", "==", clienteId), where("fuente", "==", "credito")));
        const totalAbonadoCredito = abonosPreviosSnapshot.docs.reduce((sum, doc) => sum + doc.data().monto, 0);

        const montoADesembolsar = montoCreditoPactado - totalAbonadoCredito;

        if (montoADesembolsar <= 0) {
            throw new Error("El crédito para este cliente ya ha sido completamente desembolsado.");
        }

        const abonoParaGuardar = {
            ...desembolsoData,
            monto: montoADesembolsar,
            fuente: 'credito',
            metodoPago: 'Desembolso Bancario',
            clienteId,
            viviendaId,
            id: abonoRef.id,
            estadoProceso: 'activo'
        };

        const nuevoTotalAbonado = viviendaData.totalAbonado + montoADesembolsar;
        const nuevoSaldo = viviendaData.valorFinal - nuevoTotalAbonado;
        transaction.update(viviendaRef, { totalAbonado: nuevoTotalAbonado, saldoPendiente: nuevoSaldo });
        transaction.set(abonoRef, abonoParaGuardar);

        const pasoConfig = FUENTE_PROCESO_MAP['credito'];
        if (pasoConfig) {
            const desembolsoKey = pasoConfig.desembolsoKey;
            const nuevoProceso = { ...clienteData.proceso };
            nuevoProceso[desembolsoKey] = {
                ...nuevoProceso[desembolsoKey],
                completado: true,
                fecha: desembolsoData.fechaPago,
                evidencias: {
                    ...nuevoProceso[desembolsoKey]?.evidencias,
                    [pasoConfig.evidenciaId]: { url: desembolsoData.urlComprobante, estado: 'subido' }
                }
            };
            transaction.update(clienteRef, { proceso: nuevoProceso });
        }
    });

    const message = `Se registró el desembolso del crédito hipotecario para ${clienteNombre}`;
    await createNotification('abono', message, `/clientes/detalle/${clienteId}`);
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

// --- INICIO DE LA MODIFICACIÓN ---

/**
 * Crea un registro en el log de auditoría.
 * @param {string} message - El mensaje descriptivo de la acción (ej: "Creó al cliente Pedro Suarez").
 * @param {object} details - Un objeto con detalles relevantes sobre el evento (ej: { cambios: [...] }).
 */
export const createAuditLog = async (message, details = {}) => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.warn("Intento de registro de auditoría sin usuario autenticado.");
            return;
        }

        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userName = userDocSnap.exists()
            ? toTitleCase(`${userDocSnap.data().nombres} ${userDocSnap.data().apellidos}`)
            : currentUser.email;

        const auditCollectionRef = collection(db, "audits");

        await addDoc(auditCollectionRef, {
            timestamp: serverTimestamp(),
            userId: currentUser.uid,
            userName: userName,
            message: message,
            details: details // Se añade el nuevo campo de detalles
        });

    } catch (error) {
        console.error("Error al crear el registro de auditoría:", error);
    }
};