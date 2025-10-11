import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot } from "firebase/firestore";
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

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
    const [proyectos, setProyectos] = useState([]);

    const { currentUser, loading: authLoading } = useAuth();

    const recargarDatos = useCallback(() => {
        // Esta función podría forzar una recarga si fuera necesario,
        // pero onSnapshot ya lo hace en tiempo real.
    }, []);

    useEffect(() => {
        // Solo intentar cargar datos si:
        // 1. Auth no está cargando
        // 2. Hay un usuario autenticado
        if (authLoading || !currentUser) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const dataLoaded = { viviendas: false, clientes: false, abonos: false, renuncias: false, proyectos: false };

        const checkLoadingComplete = () => {
            if (Object.values(dataLoaded).every(Boolean)) {
                setIsLoading(false);
            }
        };

        const collectionsToListen = {
            viviendas: setViviendas,
            clientes: setClientes,
            abonos: setAbonos,
            renuncias: setRenuncias,
            proyectos: setProyectos
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
    }, [currentUser, authLoading]);

    // --- OPTIMIZACIÓN: Maps para búsquedas O(1) + Enriquecimiento O(n) ---
    const clientesEnriquecidos = useMemo(() => {
        // Crear índice Map - O(n) en lugar de find - O(n²)
        const viviendasMap = new Map(viviendas.map(v => [v.id, v]));

        return clientes.map((cliente) => ({
            ...cliente,
            vivienda: viviendasMap.get(cliente.viviendaId) || null
        }));
    }, [clientes, viviendas]);

    // Maps para búsquedas rápidas O(1)
    const maps = useMemo(() => ({
        viviendas: new Map(viviendas.map(v => [v.id, v])),
        clientes: new Map(clientes.map(c => [c.id, c])),
        proyectos: new Map(proyectos.map(p => [p.id, p])),
        abonos: new Map(abonos.map(a => [a.id, a])),
        renuncias: new Map(renuncias.map(r => [r.id, r]))
    }), [viviendas, clientes, proyectos, abonos, renuncias]);

    const value = useMemo(() => {
        return {
            isLoading,
            viviendas,
            clientes: clientesEnriquecidos,
            abonos,
            renuncias,
            proyectos,
            maps, // Nuevo: para búsquedas O(1)
            recargarDatos
        };
    }, [isLoading, viviendas, clientesEnriquecidos, abonos, renuncias, proyectos, maps, recargarDatos]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};