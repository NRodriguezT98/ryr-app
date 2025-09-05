// src/services/dataService.js
import { db } from '../firebase/config';
import { collection, getDocs } from "firebase/firestore";

// Esta es nuestra función genérica para obtener datos.
// No la exportamos porque solo la usaremos dentro de este archivo.
const getData = async (collectionName) => {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    return data;
};

// Exportamos todas las funciones específicas que usan 'getData'.
// Ahora tienes un único lugar para toda la obtención de datos inicial.
export const getViviendas = () => getData("viviendas");
export const getClientes = () => getData("clientes");
export const getAbonos = () => getData("abonos");
export const getRenuncias = () => getData("renuncias");
export const getProyectos = () => getData("proyectos");