import { db } from '../firebase/config';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, runTransaction, getDoc, writeBatch } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// --- LECTURA DE DATOS ---
const getData = async (collectionName) => {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    const data = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
    }));
    return data;
};

export const getViviendas = () => getData("viviendas");
export const getClientes = () => getData("clientes");
export const getAbonos = () => getData("abonos");
export const getRenuncias = () => getData("renuncias");


// --- CREACIÓN DE DATOS ---
export const addVivienda = async (viviendaData) => {
    const nuevaVivienda = {
        ...viviendaData,
        clienteId: null,
        clienteNombre: "",
        totalAbonado: 0,
        saldoPendiente: viviendaData.valorTotal,
        valorFinal: viviendaData.valorTotal,
        descuentoMonto: 0,
        descuentoMotivo: ""
    };
    await addDoc(collection(db, "viviendas"), nuevaVivienda);
};

const storage = getStorage();

export const uploadFile = (file, path, onProgress) => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
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
    const clienteParaGuardar = { ...clienteData, id: newClienteRef.id };

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

    await runTransaction(db, async (transaction) => {
        const viviendaDoc = await transaction.get(viviendaRef);
        if (!viviendaDoc.exists()) {
            throw "Error: La vivienda asociada a este abono ya no existe.";
        }
        const viviendaData = viviendaDoc.data();
        const nuevoTotalAbonado = (viviendaData.totalAbonado || 0) + abonoData.monto;
        const valorFinal = viviendaData.valorFinal || viviendaData.valorTotal;
        const nuevoSaldo = valorFinal - nuevoTotalAbonado;
        transaction.update(viviendaRef, {
            totalAbonado: nuevoTotalAbonado,
            saldoPendiente: nuevoSaldo
        });
        transaction.set(abonoRef, { ...abonoData, id: abonoRef.id });
    });
};


// --- ACTUALIZACIÓN, BORRADO Y FUNCIONES DE RENUNCIA ---

export const updateVivienda = async (id, datosActualizados) => {
    const viviendaRef = doc(db, "viviendas", String(id));
    const viviendaSnap = await getDoc(viviendaRef);
    if (!viviendaSnap.exists()) {
        throw new Error("La vivienda no existe.");
    }
    const viviendaOriginal = viviendaSnap.data();
    const datosFinales = { ...datosActualizados };
    const valorTotalCambiado = datosFinales.valorTotal !== undefined && datosFinales.valorTotal !== viviendaOriginal.valorTotal;
    const descuentoCambiado = datosFinales.descuentoMonto !== undefined && datosFinales.descuentoMonto !== viviendaOriginal.descuentoMonto;
    if (valorTotalCambiado || descuentoCambiado) {
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
    if (!viviendaSnap.exists()) {
        throw new Error("Esta vivienda ya no existe.");
    }
    const viviendaData = viviendaSnap.data();
    if (viviendaData.clienteId) {
        throw new Error("CLIENTE_ASIGNADO");
    }
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

export const renunciarAVivienda = async (clienteId, viviendaId) => {
    const clienteRef = doc(db, "clientes", clienteId);
    const viviendaRef = doc(db, "viviendas", viviendaId);
    const renunciaRef = doc(collection(db, "renuncias"));
    await runTransaction(db, async (transaction) => {
        const clienteDoc = await transaction.get(clienteRef);
        const viviendaDoc = await transaction.get(viviendaRef);
        if (!clienteDoc.exists() || !viviendaDoc.exists()) {
            throw new Error("El cliente o la vivienda ya no existen.");
        }
        const clienteData = clienteDoc.data();
        const viviendaData = viviendaDoc.data();
        const totalAbonado = viviendaData.totalAbonado || 0;
        const registroRenuncia = {
            clienteId: clienteId,
            clienteNombre: `${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`.trim(),
            viviendaId: viviendaId,
            viviendaInfo: `Mz. ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}`,
            fechaRenuncia: new Date().toISOString(),
            totalAbonadoParaDevolucion: totalAbonado,
            estadoDevolucion: 'Pendiente'
        };
        transaction.set(renunciaRef, registroRenuncia);
        transaction.update(viviendaRef, {
            clienteId: null, clienteNombre: "",
            totalAbonado: 0, saldoPendiente: viviendaData.valorFinal
        });
        transaction.update(clienteRef, {
            viviendaId: null,
            status: 'renunciado' // <-- ¡AÑADIMOS LA LÍNEA QUE FALTABA!
        });
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
        transaction.update(viviendaRef, {
            totalAbonado: nuevoTotalAbonado,
            saldoPendiente: nuevoSaldo
        });
        transaction.update(abonoRef, datosNuevos);
    });
};

export const deleteAbono = async (abonoAEliminar) => {
    if (!abonoAEliminar || !abonoAEliminar.id || !abonoAEliminar.viviendaId) {
        throw new Error("Datos del abono a eliminar incompletos.");
    }
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
        transaction.update(viviendaRef, {
            totalAbonado: nuevoTotalAbonado,
            saldoPendiente: nuevoSaldo
        });
        transaction.delete(abonoRef);
    });
};

export const marcarDevolucionComoPagada = async (renunciaId, datosDevolucion) => {
    const renunciaRef = doc(db, "renuncias", renunciaId);

    // Usamos una transacción para asegurar que ambas actualizaciones ocurran juntas
    await runTransaction(db, async (transaction) => {
        const renunciaDoc = await transaction.get(renunciaRef);
        if (!renunciaDoc.exists()) {
            throw new Error("El registro de renuncia no existe.");
        }

        const clienteId = renunciaDoc.data().clienteId;
        const clienteRef = doc(db, "clientes", clienteId);

        // 1. Actualizamos el documento de la renuncia
        transaction.update(renunciaRef, {
            estadoDevolucion: 'Pagada',
            ...datosDevolucion
        });

        // 2. Actualizamos el estado del cliente a 'renunciado'
        transaction.update(clienteRef, {
            status: 'renunciado'
        });
    });
};

export const reactivarCliente = async (clienteId) => {
    const clienteRef = doc(db, "clientes", clienteId);
    await updateDoc(clienteRef, {
        status: 'activo'
    });
};