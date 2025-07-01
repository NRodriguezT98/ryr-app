import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getViviendas, getClientes, getAbonos } from '../utils/storage';
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

    const cargarDatosGenerales = useCallback(async () => {
        // No mostramos el spinner en recargas de foco para una mejor UX
        // setIsLoading(true); 
        try {
            const [viviendasData, clientesData, abonosData] = await Promise.all([
                getViviendas(),
                getClientes(),
                getAbonos()
            ]);

            // Hacemos el cruce de datos aquí, una sola vez.
            const clientesConVivienda = clientesData.map((cliente) => {
                const viviendaAsignada = viviendasData.find((v) => v.id === cliente.viviendaId);
                return { ...cliente, vivienda: viviendaAsignada || null };
            });

            setViviendas(viviendasData);
            setClientes(clientesConVivienda); // Guardamos los clientes ya con su vivienda
            setAbonos(abonosData);

        } catch (error) {
            toast.error("Error crítico: No se pudieron cargar los datos de la aplicación.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarDatosGenerales();

        // Lógica para recargar datos automáticamente que ya implementamos
        window.addEventListener('focus', cargarDatosGenerales);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                cargarDatosGenerales();
            }
        });

        return () => {
            window.removeEventListener('focus', cargarDatosGenerales);
            document.removeEventListener('visibilitychange', cargarDatosGenerales);
        };
    }, [cargarDatosGenerales]);

    // Los valores que queremos que estén disponibles para toda la app
    const value = {
        isLoading,
        viviendas,
        clientes,
        abonos,
        recargarDatos: cargarDatosGenerales // Exponemos una función para recargar manualmente si es necesario
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};