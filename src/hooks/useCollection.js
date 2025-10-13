/**
 * @file useCollection.js
 * @description Hook para carga lazy de colecciones de Firestore con cache inteligente
 * Optimización: Solo carga datos cuando son necesarios Y cuando hay autenticación
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, onSnapshot, query, where, limit as firestoreLimit } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import toast from 'react-hot-toast';

/**
 * Hook para manejar colecciones de Firestore con lazy loading
 * @param {string} collectionName - Nombre de la colección
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.lazy - Si true, no carga hasta que se llame a load()
 * @param {boolean} options.realtime - Si true, usa onSnapshot (tiempo real)
 * @param {Array} options.constraints - Constraints de query (where, limit, etc)
 * @param {Function} options.transform - Función para transformar datos
 * @param {boolean} options.cache - Si true, cachea resultados
 * @param {boolean} options.requireAuth - Si true, solo carga si hay usuario autenticado (default: true)
 * @returns {Object} { data, isLoading, error, load, reload, clear }
 */
export const useCollection = (collectionName, options = {}) => {
    const {
        lazy = false,
        realtime = true,
        constraints = [],
        transform = null,
        cache = true,
        requireAuth = true, // Por defecto requiere autenticación
    } = options;

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(!lazy);
    const [error, setError] = useState(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    const unsubscribeRef = useRef(null);
    const cacheRef = useRef(null);

    /**
     * Carga la colección desde Firestore
     */
    const load = useCallback(() => {
        // CRÍTICO: Verificar autenticación antes de intentar cargar
        if (requireAuth && !auth.currentUser) {
            setIsLoading(false);
            setData([]);
            return;
        }

        // Si ya tenemos datos en cache, usarlos
        if (cache && cacheRef.current && hasLoaded) {
            setData(cacheRef.current);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const collectionRef = collection(db, collectionName);
            const q = constraints.length > 0
                ? query(collectionRef, ...constraints)
                : collectionRef;

            if (realtime) {
                // CRÍTICO: Cancelar listener anterior si existe para evitar duplicados
                if (unsubscribeRef.current) {
                    unsubscribeRef.current();
                    unsubscribeRef.current = null;
                }

                // Tiempo real con onSnapshot
                unsubscribeRef.current = onSnapshot(
                    q,
                    (snapshot) => {
                        const items = snapshot.docs.map(doc => {
                            const item = { id: doc.id, ...doc.data() };
                            return transform ? transform(item) : item;
                        });

                        // CRÍTICO: Crear siempre un nuevo array para forzar re-render
                        const newData = [...items];

                        setData(newData);
                        if (cache) {
                            cacheRef.current = newData;
                        }
                        setIsLoading(false);
                        setHasLoaded(true);
                    },
                    (err) => {
                        // Solo mostrar error si NO es de permisos (que es esperado sin auth)
                        if (err.code !== 'permission-denied') {
                            console.error(`Error al cargar ${collectionName}:`, err);
                            toast.error(`Error al cargar ${collectionName}`);
                        }
                        setError(err);
                        setIsLoading(false);
                    }
                );
            }
        } catch (err) {
            console.error(`Error al inicializar ${collectionName}:`, err);
            setError(err);
            setIsLoading(false);
        }
    }, [collectionName, constraints, transform, cache, realtime, hasLoaded, requireAuth]);

    /**
     * Recarga forzada (ignora cache)
     * Retorna una promesa que se resuelve cuando el listener recibe nuevos datos
     * 
     * ⚡ OPTIMIZACIÓN EQUILIBRADA:
     * - NO mostramos skeletons (mantenemos datos antiguos visibles)
     * - PERO esperamos confirmación de que llegaron datos frescos
     */
    const reload = useCallback(() => {
        return new Promise((resolve) => {
            // CRÍTICO: Cancelar listener anterior antes de recargar
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }

            cacheRef.current = null;

            // 🔥 NO cambiamos isLoading ni hasLoaded para mantener UI estable
            // Los datos antiguos permanecen visibles hasta que lleguen los nuevos

            // Configurar listener temporal QUE ESPERA DATOS REALES
            const collectionRef = collection(db, collectionName);
            const q = constraints.length > 0
                ? query(collectionRef, ...constraints)
                : collectionRef;

            let dataReceived = false;

            const tempUnsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    if (!dataReceived) {
                        dataReceived = true;

                        // Cancelar este listener temporal
                        tempUnsubscribe();

                        // Ahora establecer el listener permanente
                        load();

                        // Resolver la promesa - los datos ya están actualizados
                        setTimeout(resolve, 50); // Pequeño delay para que load() se establezca
                    }
                },
                (error) => {
                    console.error(`❌ [useCollection] Error en reload de ${collectionName}:`, error);
                    // Aun con error, intentar establecer listener permanente
                    load();
                    resolve();
                }
            );

            // Timeout de seguridad: si después de 3 segundos no hay respuesta, resolver igual
            setTimeout(() => {
                if (!dataReceived) {
                    console.warn(`⚠️ [useCollection] Timeout en reload de ${collectionName}, resolviendo...`);
                    tempUnsubscribe();
                    load();
                    resolve();
                }
            }, 3000);
        });
    }, [load, collectionName, constraints]);

    /**
     * Limpia datos y cache
     */
    const clear = useCallback(() => {
        setData([]);
        cacheRef.current = null;
        setHasLoaded(false);
        setError(null);

        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }
    }, []);

    // Auto-load si no es lazy Y hay autenticación (o no la requiere)
    useEffect(() => {
        if (!lazy) {
            // Solo cargar si no requiere auth O si hay usuario autenticado
            if (!requireAuth || auth.currentUser) {
                load();
            }
        }

        // Cleanup al desmontar
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [lazy, load, requireAuth]);

    return {
        data,
        isLoading,
        error,
        hasLoaded,
        load,
        reload,
        clear,
    };
};
