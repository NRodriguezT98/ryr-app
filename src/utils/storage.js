import { db } from '../firebase/config';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

// --- LECTURA DE DATOS ---
// Esta función genérica asegura que el ID de Firebase siempre se use.
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
    await addDoc(collection(db, "viviendas"), viviendaData);
};
export const addClienteAndAssignVivienda = async (clienteData) => {
    const newDocRef = await addDoc(collection(db, "clientes"), { ...clienteData, id: String(Date.now()) }); // Guardamos un ID de string por consistencia
    if (clienteData.viviendaId) {
        const viviendaDocRef = doc(db, "viviendas", String(clienteData.viviendaId));
        await updateDoc(viviendaDocRef, { clienteId: newDocRef.id });
    }
};
export const addAbono = async (abonoData) => {
    await addDoc(collection(db, "abonos"), { ...abonoData, id: String(Date.now()) }); // Guardamos un ID de string
};


// --- ACTUALIZACIÓN Y BORRADO (Aquí están las correcciones clave) ---

export const updateVivienda = async (id, datosActualizados) => {
    const viviendaDocRef = doc(db, "viviendas", String(id));
    await updateDoc(viviendaDocRef, datosActualizados);
};

export const deleteVivienda = async (viviendaId) => {
    const clientes = await getClientes();
    const clienteAsignado = clientes.find(c => c.viviendaId === viviendaId);
    if (clienteAsignado) {
        const clienteDocRef = doc(db, "clientes", String(clienteAsignado.id));
        await updateDoc(clienteDocRef, { viviendaId: null });
    }
    const viviendaDocRef = doc(db, "viviendas", String(viviendaId));
    await deleteDoc(viviendaDocRef);
};

export const updateCliente = async (clienteId, clienteActualizado) => {
    // clienteActualizado ahora es el objeto completo con la estructura anidada

    const clientes = await getClientes();
    const clienteOriginal = clientes.find(c => c.id === clienteId);
    if (!clienteOriginal) {
        console.error("No se encontró el cliente original para actualizar.");
        return false;
    }

    // Lógica para reasignar vivienda si cambió
    if (clienteOriginal.viviendaId !== clienteActualizado.viviendaId) {
        // Liberar la vivienda antigua
        if (clienteOriginal.viviendaId) {
            const viviendaAntiguaRef = doc(db, "viviendas", String(clienteOriginal.viviendaId));
            await updateDoc(viviendaAntiguaRef, { clienteId: null });
        }
        // Asignar la nueva vivienda
        if (clienteActualizado.viviendaId) {
            const clienteDocRef = doc(db, "clientes", String(clienteId));
            await updateDoc(clienteDocRef, clienteActualizado);
        };
    }

    // Actualizamos el documento del cliente con el objeto completo
    const clienteDocRef = doc(db, "clientes", String(clienteId));
    await updateDoc(clienteDocRef, clienteActualizado);
    return true;
};

export const deleteCliente = async (clienteId) => {
    const viviendas = await getViviendas();
    const viviendaAsignada = viviendas.find(v => v.clienteId === clienteId);
    if (viviendaAsignada) {
        const viviendaDocRef = doc(db, "viviendas", String(viviendaAsignada.id));
        await updateDoc(viviendaDocRef, { clienteId: null });
    }
    const clienteDocRef = doc(db, "clientes", String(clienteId));
    await deleteDoc(clienteDocRef);
};

export const updateAbono = async (id, datosActualizados) => {
    const abonoDocRef = doc(db, "abonos", String(id));
    await updateDoc(abonoDocRef, datosActualizados);
};

export const deleteAbono = async (id) => {
    const abonoDocRef = doc(db, "abonos", String(id));
    await deleteDoc(abonoDocRef);
};