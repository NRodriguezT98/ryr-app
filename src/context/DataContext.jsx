import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot } from "firebase/firestore";
import toast from 'react-hot-toast';

const DataContext = createContext(null);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData debe ser usado dentro de un DataProvider");
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [viviendas, setViviendas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [abonos, setAbonos] = useState([]);
    const [renuncias, setRenuncias] = useState([]);

    const recargarDatos = useCallback(() => {
        console.log("Recarga manual invocada (actualmente no es necesaria con onSnapshot).");
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

        // --- CORRECCIÓN DEFINITIVA AQUÍ ---
        // Ahora pasamos la lista COMPLETA de renuncias y clientes, sin ningún filtro.
        // La lógica de filtrado se hará en cada componente que lo necesite.
        return {
            isLoading,
            viviendas,
            clientes: clientesConVivienda,
            abonos,
            renuncias, // <-- Se pasa la lista completa
            recargarDatos
        };
    }, [isLoading, viviendas, clientes, abonos, renuncias, recargarDatos]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};