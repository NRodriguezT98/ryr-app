import { db } from '../firebase/config';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, runTransaction, getDoc, writeBatch, setDoc, query, where, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { toSentenceCase, formatCurrency } from './textFormatters';
import { PROCESO_CONFIG, FUENTE_PROCESO_MAP } from './procesoConfig.js';

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
};

export const addClienteAndAssignVivienda = async (clienteData) => {
    const newClienteRef = doc(db, "clientes", clienteData.datosCliente.cedula);
    const clienteParaGuardar = {
        ...clienteData,
        id: newClienteRef.id,
        status: 'activo',
        fechaCreacion: clienteData.datosCliente.fechaIngreso || new Date().toISOString()
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
        estadoProceso: 'activo',
        clienteNombre: `${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`.trim()
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
    if (!viviendaSnap.exists()) throw new Error("La vivienda no existe.");
    const viviendaOriginal = viviendaSnap.data();
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
};

export const deleteVivienda = async (viviendaId) => {
    await deleteDoc(doc(db, "viviendas", String(viviendaId)));
};

export const updateCliente = async (clienteId, clienteActualizado, viviendaOriginalId) => {
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

export const renunciarAVivienda = async (clienteId, viviendaId, motivo, observacion = '', fechaRenuncia, penalidadMonto = 0, penalidadMotivo = '') => {
    const clienteRef = doc(db, "clientes", clienteId);
    const viviendaRef = doc(db, "viviendas", viviendaId);
    const renunciaRef = doc(collection(db, "renuncias"));
    const abonosActivosQuery = query(collection(db, "abonos"), where("clienteId", "==", clienteId), where("viviendaId", "==", viviendaId), where("estadoProceso", "==", "activo"));
    const abonosSnapshot = await getDocs(abonosActivosQuery);
    const abonosDelCiclo = abonosSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    let clienteNombre = '';
    await runTransaction(db, async (transaction) => {
        const clienteDoc = await transaction.get(clienteRef);
        const viviendaDoc = await transaction.get(viviendaRef);
        if (!clienteDoc.exists() || !viviendaDoc.exists()) throw new Error("El cliente o la vivienda ya no existen.");
        const clienteData = clienteDoc.data();
        clienteNombre = `${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`.trim();
        const totalAbonado = abonosDelCiclo.reduce((sum, abono) => sum + abono.monto, 0);
        const totalADevolver = totalAbonado - penalidadMonto;
        const estadoInicial = totalADevolver > 0 ? 'Pendiente' : 'Cerrada';
        const documentosArchivados = [];
        if (clienteData.datosCliente?.urlCedula) {
            documentosArchivados.push({ label: 'Cédula de Ciudadanía', url: clienteData.datosCliente.urlCedula });
        }
        if (clienteData.financiero?.credito?.urlCartaAprobacion) {
            documentosArchivados.push({ label: 'Carta Aprobación Crédito', url: clienteData.financiero.credito.urlCartaAprobacion });
        }
        if (clienteData.financiero?.subsidioCaja?.urlCartaAprobacion) {
            documentosArchivados.push({ label: 'Carta Aprobación Sub. Caja', url: clienteData.financiero.subsidioCaja.urlCartaAprobacion });
        }
        if (clienteData.proceso) {
            PROCESO_CONFIG.forEach(pasoConfig => {
                if (pasoConfig.aplicaA(clienteData.financiero || {}) && clienteData.proceso[pasoConfig.key]) {
                    const pasoData = clienteData.proceso[pasoConfig.key];
                    if (pasoData.evidencias) {
                        pasoConfig.evidenciasRequeridas.forEach(evidenciaConfig => {
                            const evidenciaData = pasoData.evidencias[evidenciaConfig.id];
                            if (evidenciaData?.url) {
                                documentosArchivados.push({ label: evidenciaConfig.label, url: evidenciaData.url });
                            }
                        });
                    }
                }
            });
        }
        const registroRenuncia = {
            id: renunciaRef.id, clienteId, clienteNombre, viviendaId,
            viviendaInfo: `Mz. ${viviendaDoc.data().manzana} - Casa ${viviendaDoc.data().numeroCasa}`,
            fechaRenuncia, totalAbonadoOriginal: totalAbonado, penalidadMonto, penalidadMotivo,
            totalAbonadoParaDevolucion: totalADevolver, estadoDevolucion: estadoInicial,
            motivo, observacion, historialAbonos: abonosDelCiclo,
            documentosArchivados
        };
        transaction.set(renunciaRef, registroRenuncia);
        transaction.update(viviendaRef, { clienteId: null, clienteNombre: "", totalAbonado: 0, saldoPendiente: viviendaDoc.data().valorTotal });
        transaction.update(clienteRef, { viviendaId: null, proceso: {}, financiero: {} });
        if (estadoInicial === 'Cerrada') {
            registroRenuncia.fechaDevolucion = new Date().toISOString();
            transaction.update(renunciaRef, { fechaDevolucion: registroRenuncia.fechaDevolucion });
            transaction.update(clienteRef, { status: 'renunciado' });
            abonosDelCiclo.forEach(abono => {
                transaction.update(doc(db, "abonos", abono.id), { estadoProceso: 'archivado' });
            });
        }
    });
    return { renunciaId: renunciaRef.id, clienteNombre };
};

export const marcarDevolucionComoPagada = async (renunciaId, datosDevolucion) => {
    const renunciaRef = doc(db, "renuncias", renunciaId);
    await runTransaction(db, async (transaction) => {
        const renunciaDoc = await transaction.get(renunciaRef);
        if (!renunciaDoc.exists()) throw new Error("El registro de renuncia no existe.");
        const renunciaData = renunciaDoc.data();
        transaction.update(renunciaRef, { estadoDevolucion: 'Cerrada', ...datosDevolucion });
        if (renunciaData.clienteId) {
            transaction.update(doc(db, "clientes", renunciaData.clienteId), { status: 'renunciado' });
        }
        (renunciaData.historialAbonos || []).forEach(abono => {
            transaction.update(doc(db, "abonos", abono.id), { estadoProceso: 'archivado' });
        });
    });
};

export const reactivarCliente = async (clienteId) => {
    await updateDoc(doc(db, "clientes", clienteId), { status: 'activo' });
};

export const updateRenuncia = async (renunciaId, datosParaActualizar) => {
    await updateDoc(doc(db, "renuncias", renunciaId), datosParaActualizar);
};

export const cancelarRenuncia = async (renuncia) => {
    const clienteRef = doc(db, "clientes", renuncia.clienteId);
    const viviendaRef = doc(db, "viviendas", renuncia.viviendaId);
    const renunciaRef = doc(db, "renuncias", renuncia.id);
    await runTransaction(db, async (transaction) => {
        const viviendaDoc = await transaction.get(viviendaRef);
        if (!viviendaDoc.exists()) throw new Error("La vivienda original ya no existe.");
        transaction.update(viviendaRef, {
            clienteId: renuncia.clienteId,
            clienteNombre: renuncia.clienteNombre,
            totalAbonado: renuncia.totalAbonadoOriginal,
            saldoPendiente: viviendaDoc.data().valorFinal - renuncia.totalAbonadoOriginal
        });
        transaction.update(clienteRef, { viviendaId: renuncia.viviendaId, status: 'activo' });
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
    if (!abonoAEliminar || !abonoAEliminar.id || !abonoAEliminar.viviendaId) throw new Error("Datos del abono a eliminar incompletos.");
    const abonoRef = doc(db, "abonos", String(abonoAEliminar.id));
    const viviendaRef = doc(db, "viviendas", String(abonoAEliminar.viviendaId));
    await runTransaction(db, async (transaction) => {
        const viviendaDoc = await transaction.get(viviendaRef);
        if (!viviendaDoc.exists()) {
            transaction.delete(abonoRef);
            return;
        }
        const viviendaData = viviendaDoc.data();
        const montoAEliminar = abonoAEliminar.monto || 0;
        const nuevoTotalAbonado = (viviendaData.totalAbonado || 0) - montoAEliminar;
        const nuevoSaldo = viviendaData.valorFinal - nuevoTotalAbonado;
        transaction.update(viviendaRef, { totalAbonado: nuevoTotalAbonado, saldoPendiente: nuevoSaldo });
        transaction.delete(abonoRef);
    });
};