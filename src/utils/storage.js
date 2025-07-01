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

// --- NUEVA FUNCIÓN PARA SUBIR ARCHIVOS ---
const storage = getStorage();

/**
 * Sube un archivo a Firebase Storage y devuelve su URL de descarga.
 * @param {File} file - El objeto del archivo a subir.
 * @param {string} path - La ruta donde se guardará en Storage (ej: "cedulas/clienteId.pdf").
 * @param {function} onProgress - Una función callback para reportar el progreso de la subida.
 * @returns {Promise<string>} La URL de descarga del archivo.
 */
export const uploadFile = (file, path, onProgress) => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) {
                    onProgress(progress);
                }
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
    const newClienteRef = doc(collection(db, "clientes"));
    const clienteParaGuardar = { ...clienteData, id: newClienteRef.id };

    if (clienteData.viviendaId) {
        const viviendaRef = doc(db, "viviendas", String(clienteData.viviendaId));
        const batch = writeBatch(db);

        // 1. Prepara la creación del cliente
        batch.set(newClienteRef, clienteParaGuardar);

        // 2. Prepara la actualización de la vivienda con los datos desnormalizados
        batch.update(viviendaRef, {
            clienteId: newClienteRef.id,
            clienteNombre: `${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`.trim()
        });

        // Ejecuta ambas operaciones
        await batch.commit();

    } else {
        // Si no se asigna vivienda, solo crea el cliente
        await addDoc(collection(db, "clientes"), clienteParaGuardar);
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

        // 1. Actualiza los totales en la vivienda
        transaction.update(viviendaRef, {
            totalAbonado: nuevoTotalAbonado,
            saldoPendiente: nuevoSaldo
        });

        // 2. Crea el documento del abono
        transaction.set(abonoRef, { ...abonoData, id: abonoRef.id });
    });
};


// --- ACTUALIZACIÓN Y BORRADO ---

export const updateVivienda = async (id, datosActualizados) => {
    const viviendaRef = doc(db, "viviendas", String(id));
    const viviendaSnap = await getDoc(viviendaRef);
    if (!viviendaSnap.exists()) {
        throw new Error("La vivienda no existe.");
    }

    const viviendaOriginal = viviendaSnap.data();
    const datosFinales = { ...datosActualizados };

    // Si el valor o el descuento cambian, recalcula el valor final y el saldo pendiente
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

    // --- ¡AQUÍ ESTÁ LA VALIDACIÓN CLAVE! ---
    // Si el campo 'clienteId' existe y tiene un valor, lanzamos un error específico.
    if (viviendaData.clienteId) {
        throw new Error("CLIENTE_ASIGNADO"); // Usamos un mensaje clave que podamos identificar.
    }

    // Si la validación pasa (no hay cliente), procedemos con el borrado.
    await deleteDoc(viviendaRef);
};

export const renunciarAVivienda = async (clienteId, viviendaId) => {
    // 1. Definimos las referencias a los documentos que vamos a modificar.
    const clienteRef = doc(db, "clientes", clienteId);
    const viviendaRef = doc(db, "viviendas", viviendaId);
    const renunciaRef = doc(collection(db, "renuncias")); // Crea una referencia para el nuevo documento de renuncia.

    // 2. Usamos una transacción para asegurar que todas las operaciones se completen o ninguna lo haga.
    await runTransaction(db, async (transaction) => {
        const clienteDoc = await transaction.get(clienteRef);
        const viviendaDoc = await transaction.get(viviendaRef);

        if (!clienteDoc.exists() || !viviendaDoc.exists()) {
            throw new Error("El cliente o la vivienda ya no existen.");
        }

        const clienteData = clienteDoc.data();
        const viviendaData = viviendaDoc.data();

        // 3. Calculamos el total abonado por el cliente para esta vivienda.
        // Esto es crucial para la devolución.
        const totalAbonado = viviendaData.totalAbonado || 0;

        // 4. Creamos el nuevo documento en la colección 'renuncias'.
        const registroRenuncia = {
            clienteId: clienteId,
            clienteNombre: `${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`.trim(),
            viviendaId: viviendaId,
            viviendaInfo: `Mz. ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}`,
            fechaRenuncia: new Date().toISOString(),
            totalAbonadoParaDevolucion: totalAbonado,
            estadoDevolucion: 'Pendiente' // Para seguimiento futuro
        };
        transaction.set(renunciaRef, registroRenuncia);

        // 5. Actualizamos la vivienda para dejarla "como nueva".
        transaction.update(viviendaRef, {
            clienteId: null,
            clienteNombre: "",
            totalAbonado: 0,
            saldoPendiente: viviendaData.valorFinal // El saldo vuelve a ser el valor final.
        });

        // 6. Actualizamos al cliente para desvincularlo de la vivienda.
        transaction.update(clienteRef, {
            viviendaId: null
        });
    });
};

export const updateCliente = async (clienteId, clienteActualizado, viviendaOriginalId) => {
    const clienteRef = doc(db, "clientes", String(clienteId));
    const batch = writeBatch(db);

    // 1. Actualiza el documento del cliente
    batch.update(clienteRef, clienteActualizado);

    const nuevaViviendaId = clienteActualizado.viviendaId;
    const nombreCompleto = `${clienteActualizado.datosCliente.nombres} ${clienteActualizado.datosCliente.apellidos}`.trim();

    // 2. Si la vivienda cambió, actualiza la antigua y la nueva
    if (viviendaOriginalId !== nuevaViviendaId) {
        // Libera la vivienda antigua si existía
        if (viviendaOriginalId) {
            const viviendaAntiguaRef = doc(db, "viviendas", String(viviendaOriginalId));
            batch.update(viviendaAntiguaRef, { clienteId: null, clienteNombre: "" });
        }
        // Asigna la nueva vivienda
        if (nuevaViviendaId) {
            const nuevaViviendaRef = doc(db, "viviendas", String(nuevaViviendaId));
            batch.update(nuevaViviendaRef, { clienteId: clienteId, clienteNombre: nombreCompleto });
        }
    } else if (nuevaViviendaId) {
        // Si la vivienda es la misma, solo actualiza el nombre por si cambió
        const viviendaRef = doc(db, "viviendas", String(nuevaViviendaId));
        batch.update(viviendaRef, { clienteNombre: nombreCompleto });
    }

    await batch.commit();
};

export const deleteCliente = async (clienteId) => {
    const clienteRef = doc(db, "clientes", String(clienteId));

    // Desvincular de la vivienda
    const clienteDoc = await getDoc(clienteRef);
    if (clienteDoc.exists() && clienteDoc.data().viviendaId) {
        const viviendaRef = doc(db, "viviendas", clienteDoc.data().viviendaId);
        await updateDoc(viviendaRef, { clienteId: null, clienteNombre: "" });
    }

    // Eliminar el cliente
    await deleteDoc(clienteRef);
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

        // 1. Actualiza los totales en la vivienda
        transaction.update(viviendaRef, {
            totalAbonado: nuevoTotalAbonado,
            saldoPendiente: nuevoSaldo
        });

        // 2. Actualiza el documento del abono
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
            // Si la vivienda no existe, al menos eliminamos el abono.
            transaction.delete(abonoRef);
            return;
        }

        const viviendaData = viviendaDoc.data();
        const montoAEliminar = abonoAEliminar.monto || 0;

        const nuevoTotalAbonado = (viviendaData.totalAbonado || 0) - montoAEliminar;
        const nuevoSaldo = viviendaData.valorFinal - nuevoTotalAbonado;

        // 1. Actualiza los totales en la vivienda
        transaction.update(viviendaRef, {
            totalAbonado: nuevoTotalAbonado,
            saldoPendiente: nuevoSaldo
        });

        // 2. Elimina el documento del abono
        transaction.delete(abonoRef);
    });
};

export const getRenuncias = () => getData("renuncias");