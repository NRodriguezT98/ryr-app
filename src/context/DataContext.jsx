import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot } from "firebase/firestore";
import toast from 'react-hot-toast';

// 1. Creamos el Contexto
const DataContext = createContext(null);

// 2. Creamos un Hook personalizado para consumir el contexto fácilmente
export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData debe ser usado dentro de un DataProvider");
    }
    return context;
};

// 3. Creamos el Proveedor que contendrá toda la lógica
export const DataProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [viviendas, setViviendas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [abonos, setAbonos] = useState([]);
    const [renuncias, setRenuncias] = useState([]);

    const recargarDatos = useCallback(() => {
        // Con onSnapshot, la recarga es automática. Esta función se mantiene por si se necesita en el futuro.
        console.log("Recarga manual invocada.");
    }, []);

    useEffect(() => {
        setIsLoading(true);

        const dataLoaded = { viviendas: false, clientes: false, abonos: false, renuncias: false };

        const checkLoadingComplete = () => {
            if (Object.values(dataLoaded).every(Boolean)) {
                setIsLoading(false);
            }
        };

        const collectionsToListen = {
            viviendas: setViviendas,
            clientes: setClientes,
            abonos: setAbonos,
            renuncias: setRenuncias
        };

        const subscriptions = Object.entries(collectionsToListen).map(([name, setter]) => {
            return onSnapshot(collection(db, name), (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setter(data);
                dataLoaded[name] = true;
                checkLoadingComplete();
            }, (error) => {
                console.error(`Error al obtener ${name}:`, error);
                toast.error(`No se pudieron cargar los datos de ${name}.`);
            });
        });

        return () => {
            subscriptions.forEach(unsub => unsub());
        };
    }, []);

    const value = useMemo(() => {
        const clientesConVivienda = clientes.map((cliente) => {
            const viviendaAsignada = viviendas.find((v) => v.id === cliente.viviendaId);
            return { ...cliente, vivienda: viviendaAsignada || null };
        });

        const renunciasPendientes = renuncias.filter(r => r.estadoDevolucion === 'Pendiente');

        return {
            isLoading,
            viviendas,
            clientes: clientesConVivienda,
            abonos,
            renuncias: renunciasPendientes,
            recargarDatos
        };
    }, [isLoading, viviendas, clientes, abonos, renuncias, recargarDatos]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};