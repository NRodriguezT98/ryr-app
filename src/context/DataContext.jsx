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
        // Esta función podría forzar una recarga si fuera necesario,
        // pero onSnapshot ya lo hace en tiempo real.
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

    // --- LÓGICA DE ENRIQUECIMIENTO DE DATOS CORREGIDA ---
    const clientesEnriquecidos = useMemo(() => {
        return clientes.map((cliente) => {
            const viviendaAsignada = viviendas.find((v) => v.id === cliente.viviendaId);
            // Creamos un nuevo objeto de cliente para no mutar el original.
            const clienteConVivienda = { ...cliente, vivienda: viviendaAsignada || null };
            return clienteConVivienda;
        });
    }, [clientes, viviendas]);

    const value = useMemo(() => {
        return {
            isLoading,
            viviendas,
            clientes: clientesEnriquecidos, // Usamos el valor ya procesado.
            abonos,
            renuncias,
            recargarDatos
        };
    }, [isLoading, viviendas, clientesEnriquecidos, abonos, renuncias, recargarDatos]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};