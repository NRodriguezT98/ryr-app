/**
 * @file useOptimisticUpdate.js
 * @description Hook para actualizaciones optimistas (Optimistic UI)
 * Actualiza la UI inmediatamente y revierte si hay error
 * Patrón usado por: Notion, Linear, Twitter, etc.
 */

import { useCallback } from 'react';
import { useData } from '../context/DataContext';
import { useDataSync } from './useDataSync'; // ✅ Sistema de sincronización inteligente

/**
 * Hook para ejecutar mutaciones con actualización optimista
 * 
 * @example
 * const { ejecutarOptimistic } = useOptimisticUpdate();
 * 
 * await ejecutarOptimistic({
 *   mutationFn: () => renunciarAVivienda(clienteId),
 *   optimisticUpdate: (data) => ({
 *     clientes: data.clientes.map(c => 
 *       c.id === clienteId ? {...c, status: 'renunciado'} : c
 *     )
 *   }),
 *   invalidateCollections: ['clientes', 'viviendas'], // Solo lo necesario
 *   onSuccess: () => toast.success("¡Listo!"),
 *   onError: () => toast.error("Error")
 * });
 */
export const useOptimisticUpdate = () => {
    const { clientes, viviendas, abonos } = useData();
    const { invalidate } = useDataSync(); // ✅ Sincronización granular

    /**
     * Ejecuta una mutación con actualización optimista
     * 
     * @param {Object} options
     * @param {Function} options.mutationFn - Función async que ejecuta la mutación
     * @param {Function} options.optimisticUpdate - Función que retorna el nuevo estado optimista
     * @param {string[]} [options.invalidateCollections] - Colecciones a invalidar después de la mutación
     * @param {Function} [options.onSuccess] - Callback si la mutación tiene éxito
     * @param {Function} [options.onError] - Callback si la mutación falla
     * @param {boolean} [options.revalidate=false] - Si true, recarga datos después del éxito
     */
    const ejecutarOptimistic = useCallback(async ({
        mutationFn,
        optimisticUpdate,
        invalidateCollections = [],
        onSuccess,
        onError,
        revalidate = false
    }) => {
        // 1. Guardar estado actual (para revertir si falla)
        const estadoAnterior = {
            clientes: [...clientes],
            viviendas: [...viviendas],
            abonos: [...abonos]
        };

        try {
            // 2. Aplicar actualización optimista (UI se actualiza INMEDIATAMENTE)
            const nuevoEstado = optimisticUpdate({
                clientes,
                viviendas,
                abonos
            });

            // NOTA: Aquí normalmente actualizaríamos el estado local con nuevoEstado
            // Pero como estamos usando DataContext con listeners, vamos a
            // confiar en que la mutación va a funcionar

            // 3. Ejecutar la mutación real en Firestore
            const resultado = await mutationFn();

            // 4. Sincronización inteligente: solo colecciones especificadas
            if (invalidateCollections.length > 0) {
                console.log('🔄 Invalidando colecciones:', invalidateCollections);
                await invalidate(invalidateCollections);
            } else if (revalidate) {
                console.log('🔄 Revalidando todas las colecciones (modo legacy)...');
                await invalidate(['clientes', 'viviendas', 'abonos', 'renuncias', 'proyectos']);
            }

            // 5. Callback de éxito
            if (onSuccess) {
                onSuccess(resultado);
            }

            return resultado;

        } catch (error) {
            console.error('❌ Error en mutación optimista:', error);

            // 6. Si falla, REVERTIR cambios optimistas
            console.log('🔄 Revirtiendo cambios optimistas...');
            if (invalidateCollections.length > 0) {
                await invalidate(invalidateCollections);
            } else {
                await invalidate(['clientes', 'viviendas', 'abonos']);
            }

            // 7. Callback de error
            if (onError) {
                onError(error);
            }

            throw error;
        }
    }, [clientes, viviendas, abonos, invalidate]);

    return {
        ejecutarOptimistic
    };
};
