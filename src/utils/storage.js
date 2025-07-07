import { db } from '../firebase/config';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, runTransaction, getDoc, writeBatch, setDoc, query, where } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toSentenceCase } from './textFormatters';

// --- LECTURA DE DATOS ---
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


// --- FUNCIÓN MODIFICADA ---
export const addVivienda = async (viviendaData) => {
    const nuevaVivienda = {
        ...viviendaData,
        // --- APLICAMOS EL FORMATEO AUTOMÁTICO AQUÍ ---
        nomenclatura: toSentenceCase(viviendaData.nomenclatura),
        linderoNorte: toSentenceCase(viviendaData.linderoNorte),
        linderoSur: toSentenceCase(viviendaData.linderoSur),
        linderoOriente: toSentenceCase(viviendaData.linderoOriente),
        linderoOccidente: toSentenceCase(viviendaData.linderoOccidente),
        // Datos que ya estaban
        clienteId: null,
        clienteNombre: "",
        totalAbonado: 0,
        saldoPendiente: viviendaData.valorTotal,
        valorFinal: viviendaData.valorTotal,
    };
    await addDoc(collection(db, "viviendas"), nuevaVivienda);
};


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

export const addAbono = async (abonoData) => {
    const viviendaRef = doc(db, "viviendas", abonoData.viviendaId);
    const abonoRef = doc(collection(db, "abonos"));
    const abonoParaGuardar = { ...abonoData, id: abonoRef.id, estadoProceso: 'activo' };
    await runTransaction(db, async (transaction) => {
        const viviendaDoc = await transaction.get(viviendaRef);
        if (!viviendaDoc.exists()) throw new Error("La vivienda asociada a este abono ya no existe.");
        const viviendaData = viviendaDoc.data();
        const nuevoTotalAbonado = (viviendaData.totalAbonado || 0) + abonoData.monto;
        const valorFinal = viviendaData.valorFinal || viviendaData.valorTotal;
        const nuevoSaldo = valorFinal - nuevoTotalAbonado;
        transaction.update(viviendaRef, { totalAbonado: nuevoTotalAbonado, saldoPendiente: nuevoSaldo });
        transaction.set(abonoRef, abonoParaGuardar);
    });
};

// --- ACTUALIZACIÓN, BORRADO Y RENUNCIA ---

export const updateVivienda = async (id, datosActualizados) => {
    const viviendaRef = doc(db, "viviendas", String(id));
    const viviendaSnap = await getDoc(viviendaRef);
    if (!viviendaSnap.exists()) throw new Error("La vivienda no existe.");
    const viviendaOriginal = viviendaSnap.data();
    const datosFinales = { ...datosActualizados };
    if (datosFinales.valorTotal !== undefined || datosFinales.descuentoMonto !== undefined) {
        const nuevoValorTotal = datosFinales.valorTotal !== undefined ? datosFinales.valorTotal : viviendaOriginal.valorTotal;
        const nuevoDescuento = datosFinales.descuentoMonto !== undefined ? datosFinales.descuentoMonto : (viviendaOriginal.descuentoMonto || 0);
        datosFinales.valorFinal = nuevoValorTotal - nuevoDescuento;
        datosFinales.saldoPendiente = datosFinales.valorFinal - (viviendaOriginal.totalAbonado || 0);
    }
    await updateDoc(viviendaRef, datosFinales);
};

export const deleteVivienda = async (viviendaId) => {
    const viviendaRef = doc(db, "viviendas", String(viviendaId));
    const viviendaSnap = await getDoc(viviendaRef);
    if (!viviendaSnap.exists()) throw new Error("Esta vivienda ya no existe.");
    if (viviendaSnap.data().clienteId) throw new Error("CLIENTE_ASIGNADO");
    await deleteDoc(viviendaRef);
};

export const updateCliente = async (clienteId, clienteActualizado, viviendaOriginalId) => {
    const clienteRef = doc(db, "clientes", String(clienteId));
    const batch = writeBatch(db);
    batch.update(clienteRef, clienteActualizado);
    const nuevaViviendaId = clienteActualizado.viviendaId;
    const nombreCompleto = `${clienteActualizado.datosCliente.nombres} ${clienteActualizado.datosCliente.apellidos}`.trim();
    if (viviendaOriginalId !== nuevaViviendaId) {
        if (viviendaOriginalId) {
            const viviendaAntiguaRef = doc(db, "viviendas", String(viviendaOriginalId));
            batch.update(viviendaAntiguaRef, { clienteId: null, clienteNombre: "" });
        }
        if (nuevaViviendaId) {
            const nuevaViviendaRef = doc(db, "viviendas", String(nuevaViviendaId));
            batch.update(nuevaViviendaRef, { clienteId: clienteId, clienteNombre: nombreCompleto });
        }
    } else if (nuevaViviendaId) {
        const viviendaRef = doc(db, "viviendas", String(nuevaViviendaId));
        batch.update(viviendaRef, { clienteNombre: nombreCompleto });
    }
    await batch.commit();
};

export const deleteCliente = async (clienteId) => {
    const clienteRef = doc(db, "clientes", String(clienteId));
    const clienteDoc = await getDoc(clienteRef);
    if (clienteDoc.exists() && clienteDoc.data().viviendaId) {
        const viviendaRef = doc(db, "viviendas", clienteDoc.data().viviendaId);
        await updateDoc(viviendaRef, { clienteId: null, clienteNombre: "" });
    }
    await deleteDoc(clienteRef);
};

export const renunciarAVivienda = async (clienteId, viviendaId, motivo, observacion = '', fechaRenuncia) => {
    const clienteRef = doc(db, "clientes", clienteId);
    const viviendaRef = doc(db, "viviendas", viviendaId);
    const renunciaRef = doc(collection(db, "renuncias"));

    const abonosActivosQuery = query(collection(db, "abonos"), where("clienteId", "==", clienteId), where("viviendaId", "==", viviendaId), where("estadoProceso", "==", "activo"));
    const abonosSnapshot = await getDocs(abonosActivosQuery);
    const abonosDelCiclo = abonosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    await runTransaction(db, async (transaction) => {
        const clienteDoc = await transaction.get(clienteRef);
        const viviendaDoc = await transaction.get(viviendaRef);
        if (!clienteDoc.exists() || !viviendaDoc.exists()) throw new Error("El cliente o la vivienda ya no existen.");

        const totalAbonado = abonosDelCiclo.reduce((sum, abono) => sum + abono.monto, 0);
        const estadoInicial = totalAbonado > 0 ? 'Pendiente' : 'Pagada';

        const registroRenuncia = {
            id: renunciaRef.id,
            clienteId: clienteId,
            clienteNombre: `${clienteDoc.data().datosCliente.nombres} ${clienteDoc.data().datosCliente.apellidos}`.trim(),
            viviendaId: viviendaId,
            viviendaInfo: `Mz. ${viviendaDoc.data().manzana} - Casa ${viviendaDoc.data().numeroCasa}`,
            fechaRenuncia: fechaRenuncia,
            totalAbonadoParaDevolucion: totalAbonado,
            estadoDevolucion: estadoInicial,
            motivo: motivo,
            observacion: observacion,
            historialAbonos: abonosDelCiclo
        };

        if (estadoInicial === 'Pagada') {
            registroRenuncia.fechaDevolucion = new Date().toISOString();
        }

        transaction.set(renunciaRef, registroRenuncia);
        transaction.update(viviendaRef, { clienteId: null, clienteNombre: "", totalAbonado: 0, saldoPendiente: viviendaDoc.data().valorTotal });
        transaction.update(clienteRef, { viviendaId: null });

        if (estadoInicial === 'Pagada') {
            transaction.update(clienteRef, { status: 'renunciado' });
            abonosDelCiclo.forEach(abono => {
                const abonoRef = doc(db, "abonos", abono.id);
                transaction.update(abonoRef, { estadoProceso: 'archivado' });
            });
        }
    });
};

export const marcarDevolucionComoPagada = async (renunciaId, datosDevolucion) => {
    const renunciaRef = doc(db, "renuncias", renunciaId);

    await runTransaction(db, async (transaction) => {
        const renunciaDoc = await transaction.get(renunciaRef);
        if (!renunciaDoc.exists()) throw new Error("El registro de renuncia no existe.");

        const renunciaData = renunciaDoc.data();
        const clienteId = renunciaData.clienteId;
        const abonosParaArchivar = renunciaData.historialAbonos || [];

        transaction.update(renunciaRef, { estadoDevolucion: 'Pagada', ...datosDevolucion });

        if (clienteId) {
            const clienteRef = doc(db, "clientes", clienteId);
            transaction.update(clienteRef, { status: 'renunciado' });
        }

        abonosParaArchivar.forEach(abono => {
            const abonoRef = doc(db, "abonos", abono.id);
            transaction.update(abonoRef, { estadoProceso: 'archivado' });
        });
    });
};

export const reactivarCliente = async (clienteId) => {
    const clienteRef = doc(db, "clientes", clienteId);
    await updateDoc(clienteRef, {
        status: 'activo'
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
        transaction.update(viviendaRef, {
            clienteId: renuncia.clienteId,
            clienteNombre: renuncia.clienteNombre,
            totalAbonado: renuncia.totalAbonadoParaDevolucion,
            saldoPendiente: viviendaDoc.data().valorTotal - renuncia.totalAbonadoParaDevolucion
        });

        transaction.update(clienteRef, {
            viviendaId: renuncia.viviendaId
        });

        renuncia.historialAbonos.forEach(abono => {
            const abonoRef = doc(db, "abonos", abono.id);
            transaction.update(abonoRef, { estadoProceso: 'activo' });
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