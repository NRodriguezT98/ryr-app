// Importamos la instancia de la base de datos (db) y el storage (para archivos) desde nuestra configuración de Firebase
import { db, storage } from '../firebase/config';
// Importamos las funciones que necesitamos de Firestore SDK
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

// --- FUNCIONES PARA VIVIENDAS ---

// Obtiene TODAS las viviendas de la colección 'viviendas' en Firestore
export const getViviendas = async () => {
    // 1. Obtenemos una referencia a nuestra colección
    const viviendasRef = collection(db, "viviendas");
    // 2. Pedimos los documentos de esa colección
    const querySnapshot = await getDocs(viviendasRef);
    // 3. Mapeamos los resultados para convertirlos en un array de objetos como los que ya usamos
    const viviendas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return viviendas;
};

// Añade UNA vivienda nueva a la colección 'viviendas'
export const addVivienda = async (viviendaData) => {
    const viviendasRef = collection(db, "viviendas");
    // addDoc es como hacer .push() pero en la base de datos. Firestore genera el ID automáticamente.
    const newDocRef = await addDoc(viviendasRef, viviendaData);
    return newDocRef.id; // Devolvemos el ID del nuevo documento creado
};

// Actualiza UNA vivienda existente por su ID
export const updateVivienda = async (id, datosActualizados) => {
    // Obtenemos la referencia al documento específico usando su ID
    const viviendaDocRef = doc(db, "viviendas", id);
    // Actualizamos el documento con los nuevos datos
    await updateDoc(viviendaDocRef, datosActualizados);
};

// Elimina UNA vivienda por su ID
export const deleteVivienda = async (viviendaId) => {
    // Primero, desvinculamos al cliente si existe
    const clientes = await getClientes();
    const clienteAsignado = clientes.find(c => c.viviendaId === viviendaId);
    if (clienteAsignado) {
        const clienteDocRef = doc(db, "clientes", clienteAsignado.id);
        await updateDoc(clienteDocRef, { viviendaId: null });
    }
    // Luego, eliminamos el documento de la vivienda
    const viviendaDocRef = doc(db, "viviendas", viviendaId);
    await deleteDoc(viviendaDocRef);
};


// --- FUNCIONES PARA CLIENTES --- (Siguen el mismo patrón)

export const getClientes = async () => {
    const clientesRef = collection(db, "clientes");
    const querySnapshot = await getDocs(clientesRef);
    const clientes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return clientes;
};

export const addClienteAndAssignVivienda = async (clienteData) => {
    const clientesRef = collection(db, "clientes");
    const newDocRef = await addDoc(clientesRef, clienteData);

    if (clienteData.viviendaId) {
        const viviendaDocRef = doc(db, "viviendas", clienteData.viviendaId);
        await updateDoc(viviendaDocRef, { clienteId: newDocRef.id });
    }
    return newDocRef.id;
};

export const updateCliente = async (clienteId, datosActualizados) => {
    const clientes = await getClientes();
    const clienteOriginal = clientes.find(c => c.id === clienteId);
    if (!clienteOriginal) return;

    // Lógica para desvincular/vincular viviendas
    if (clienteOriginal.viviendaId && clienteOriginal.viviendaId !== datosActualizados.viviendaId) {
        const viviendaAntiguaRef = doc(db, "viviendas", clienteOriginal.viviendaId);
        await updateDoc(viviendaAntiguaRef, { clienteId: null });
    }
    if (datosActualizados.viviendaId) {
        const viviendaNuevaRef = doc(db, "viviendas", datosActualizados.viviendaId);
        await updateDoc(viviendaNuevaRef, { clienteId: clienteId });
    }

    const clienteDocRef = doc(db, "clientes", clienteId);
    await updateDoc(clienteDocRef, datosActualizados);
};

export const deleteCliente = async (clienteId) => {
    const viviendas = await getViviendas();
    const viviendaAsignada = viviendas.find(v => v.clienteId === clienteId);
    if (viviendaAsignada) {
        const viviendaDocRef = doc(db, "viviendas", viviendaAsignada.id);
        await updateDoc(viviendaDocRef, { clienteId: null });
    }
    const clienteDocRef = doc(db, "clientes", clienteId);
    await deleteDoc(clienteDocRef);
};


// --- FUNCIONES PARA ABONOS --- (Siguen el mismo patrón)

export const getAbonos = async () => {
    const abonosRef = collection(db, "abonos");
    const querySnapshot = await getDocs(abonosRef);
    const abonos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return abonos;
};

export const addAbono = async (abonoData) => {
    const abonosRef = collection(db, "abonos");
    const newDocRef = await addDoc(abonosRef, abonoData);
    return newDocRef.id;
};

export const updateAbono = async (id, datosActualizados) => {
    const abonoDocRef = doc(db, "abonos", id);
    await updateDoc(abonoDocRef, datosActualizados);
};

export const deleteAbono = async (id) => {
    const abonoDocRef = doc(db, "abonos", id);
    await deleteDoc(abonoDocRef);
};