/**
 * 🔄 Adapter Pattern para migración segura
 * 
 * Este adapter permite cambiar entre la versión original y refactorizada
 * de useClienteForm sin modificar el código que lo consume.
 * 
 * Ventajas:
 * - ✅ Migración transparente para componentes
 * - ✅ Rollback instantáneo
 * - ✅ Testing comparativo (old vs new)
 * - ✅ Zero-downtime deployment
 * 
 * @example
 * // En lugar de:
 * import { useClienteForm } from './useClienteForm';
 * 
 * // Usar:
 * import { useClienteFormAdapter as useClienteForm } from './useClienteFormAdapter';
 */

import { isFeatureEnabled } from '@/config/featureFlags';
import { useClienteForm as useClienteFormOld } from './useClienteForm';
import { useClienteForm as useClienteFormNew } from './v2/useClienteForm';

/**
 * Adapter que decide qué versión del hook usar
 * 
 * @param {boolean} isEditing - Si es modo edición
 * @param {Object} clienteAEditar - Cliente a editar (null si es nuevo)
 * @param {Function} onSaveSuccess - Callback al guardar exitosamente
 * @param {string} modo - Modo: 'crear' | 'editar' | 'reactivar'
 * @returns {Object} Mismo objeto que useClienteForm original
 */
export const useClienteFormAdapter = (isEditing, clienteAEditar, onSaveSuccess, modo) => {
    // ⚠️ IMPORTANTE: Verificar flags ANTES de llamar hooks
    // Esto evita violar las reglas de React (conditional hooks)
    const useRefactored = isFeatureEnabled('USE_REFACTORED_CLIENTE_HOOKS');
    const debugMode = isFeatureEnabled('DEBUG_COMPARE_OLD_NEW');

    // � Decidir qué hook usar ANTES de llamarlo
    if (useRefactored) {
        try {
            console.log('🆕 Usando hooks refactorizados (v2)');
            const result = useClienteFormNew(isEditing, clienteAEditar, onSaveSuccess, modo);
            
            // 🔍 Modo debug: Mostrar resultado
            if (debugMode) {
                console.log('🔍 Debug: Hook v2 resultado:', result);
            }
            
            return result;

        } catch (error) {
            // 🚨 Si falla la versión nueva, recargar con fallback
            console.error('❌ Error crítico en hooks refactorizados:', error);
            console.error('Stack trace:', error.stack);

            // Activar escape hatch automáticamente
            if (typeof window !== 'undefined') {
                localStorage.setItem('forceOldCode', 'true');
                console.warn('🚨 Escape hatch activado - Recargando página...');
                window.location.reload();
            }

            // Esto nunca se alcanzará por el reload, pero por seguridad:
            throw error;
        }
    }

    // 📦 Usar versión original (comportamiento por defecto)
    if (debugMode) {
        console.log('📦 Usando hooks originales (v1)');
    }

    return useClienteFormOld(isEditing, clienteAEditar, onSaveSuccess, modo);
};

/**
 * Re-exportar para compatibilidad
 */
export default useClienteFormAdapter;
