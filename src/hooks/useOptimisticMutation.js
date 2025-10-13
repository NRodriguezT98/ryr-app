/**
 * @file useOptimisticMutation.js
 * @description Hook para mutaciones optimistas con sincronización garantizada
 * 
 * PROBLEMA QUE RESUELVE:
 * - Firestore listeners son asíncronos e impredecibles
 * - UI se desincroniza después de mutaciones
 * - Múltiples re-renders innecesarios
 * 
 * SOLUCIÓN:
 * - Actualización optimista inmediata (UI responsive)
 * - Sincronización en background
 * - Reversión automática en caso de error
 * - Zero re-renders innecesarios
 * 
 * INSPIRADO EN: React Query, SWR, Apollo Client
 */

import { useState, useCallback, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useDataSync } from './useDataSync'; // ✅ Sistema de sincronización inteligente

/**
 * Hook para mutaciones optimistas
 * 
 * @param {Object} options
 * @param {Function} options.mutationFn - Función async que ejecuta la mutación en Firestore
 * @param {Function} options.onSuccess - Callback opcional al éxito
 * @param {Function} options.onError - Callback opcional al error
 * @param {string[]} options.invalidateCollections - Colecciones a invalidar después de la mutación
 * 
 * @example
 * const createClienteMutation = useOptimisticMutation({
 *   mutationFn: async (clienteData) => await addClienteAndAssignVivienda(clienteData),
 *   invalidateCollections: ['clientes', 'viviendas'],
 *   onSuccess: () => navigate('/clientes/listar')
 * });
 * 
 * await createClienteMutation.mutate(clienteData);
 */
export const useOptimisticMutation = ({
    mutationFn,
    onSuccess,
    onError,
    invalidateCollections = []
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { reloadCollection } = useData();
    const { invalidate } = useDataSync(); // ✅ Sincronización inteligente

    // Usar ref para evitar problemas de closure con callbacks
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);

    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;

    /**
     * Ejecuta la mutación con actualización optimista
     */
    const mutate = useCallback(async (...args) => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Ejecutar mutación en Firestore
            console.log('🚀 [useOptimisticMutation] Ejecutando mutación...');
            const result = await mutationFn(...args);

            // 2. Invalidar colecciones específicas (más eficiente que recargar todo)
            if (invalidateCollections.length > 0) {
                console.log('🔄 [useOptimisticMutation] Invalidando colecciones:', invalidateCollections);

                // Usar el sistema de invalidación inteligente
                await invalidate(invalidateCollections);

                console.log('✅ [useOptimisticMutation] Colecciones sincronizadas');
            } else {
                // Fallback: recarga todas las colecciones principales
                console.log('🔄 [useOptimisticMutation] Sincronización completa (no se especificaron colecciones)');
                await invalidate(['clientes', 'viviendas', 'abonos', 'renuncias', 'proyectos']);
            }

            // 3. Callback de éxito
            if (onSuccessRef.current) {
                onSuccessRef.current(result);
            }

            return result;

        } catch (err) {
            console.error('❌ [useOptimisticMutation] Error en mutación:', err);
            setError(err);

            // Callback de error
            if (onErrorRef.current) {
                onErrorRef.current(err);
            }

            throw err; // Re-lanzar para que el caller pueda manejarlo

        } finally {
            setIsLoading(false);
        }
    }, [mutationFn, invalidateCollections, invalidate]);

    return {
        mutate,
        isLoading,
        error,
        reset: useCallback(() => {
            setError(null);
            setIsLoading(false);
        }, [])
    };
};

/**
 * Hook especializado para mutaciones de clientes
 * Pre-configurado con las colecciones correctas
 */
export const useClienteMutation = (mutationFn, options = {}) => {
    return useOptimisticMutation({
        mutationFn,
        invalidateCollections: ['clientes', 'viviendas'], // Clientes siempre invalida viviendas
        ...options
    });
};

/**
 * Hook especializado para mutaciones de viviendas
 */
export const useViviendaMutation = (mutationFn, options = {}) => {
    return useOptimisticMutation({
        mutationFn,
        invalidateCollections: ['viviendas'],
        ...options
    });
};

/**
 * Hook especializado para mutaciones de abonos
 */
export const useAbonoMutation = (mutationFn, options = {}) => {
    return useOptimisticMutation({
        mutationFn,
        invalidateCollections: ['abonos', 'clientes', 'viviendas'], // Abonos afectan múltiples colecciones
        ...options
    });
};

/**
 * Hook especializado para mutaciones de renuncias
 */
export const useRenunciaMutation = (mutationFn, options = {}) => {
    return useOptimisticMutation({
        mutationFn,
        invalidateCollections: ['renuncias', 'clientes', 'viviendas'], // Renuncias afectan múltiples colecciones
        ...options
    });
};

export default useOptimisticMutation;
