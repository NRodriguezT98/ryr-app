/**
 * 🚩 Sistema de Feature Flags
 * 
 * Permite activar/desactivar nuevas features de forma segura
 * sin afectar el código en producción.
 * 
 * Uso:
 * - Desarrollo: Activar con localStorage.setItem('enableNewHooks', 'true')
 * - Producción: Rollout gradual por porcentaje de usuarios
 * - Emergencia: Desactivar instantáneamente cambiando el flag a false
 */

/**
 * Genera un hash consistente del 0-100 basado en un userId
 * Usado para rollout gradual (ej: 10% de usuarios)
 */
const userHashCode = (userId) => {
    if (!userId) return 0;
    return userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100;
};

/**
 * Feature Flags Globales
 * 
 * IMPORTANTE: Desactivado temporalmente mientras diagnosticamos el error 500
 */
export const FEATURE_FLAGS = {
    // ✅ Hooks refactorizados del módulo de clientes
    USE_REFACTORED_CLIENTE_HOOKS: false, // ⚠️ DESACTIVADO - Error 500

    // ✅ Nuevo Step3_Financial refactorizado
    USE_REFACTORED_STEP3: false,

    // ✅ Modo debug: Compara resultados old vs new
    DEBUG_COMPARE_OLD_NEW: false, // ⚠️ DESACTIVADO

    // 🚨 Escape hatch: Forzar código viejo en emergencias
    FORCE_OLD_CODE: false,
};

/**
 * Porcentajes de rollout gradual
 * 
 * Ejemplo:
 * - 0: Nadie usa la nueva feature
 * - 10: 10% de usuarios usan la nueva feature
 * - 50: 50% de usuarios usan la nueva feature
 * - 100: Todos usan la nueva feature
 */
const ROLLOUT_PERCENTAGES = {
    'USE_REFACTORED_CLIENTE_HOOKS': 0,  // Empieza en 0%
    'USE_REFACTORED_STEP3': 0,           // Empieza en 0%
};

/**
 * Verificar si una feature está habilitada
 * 
 * @param {string} flagName - Nombre del feature flag
 * @param {string} userId - ID del usuario (opcional)
 * @returns {boolean} true si la feature está habilitada
 * 
 * @example
 * const enabled = isFeatureEnabled('USE_REFACTORED_CLIENTE_HOOKS', currentUser?.id);
 */
export const isFeatureEnabled = (flagName, userId = null) => {
    // 🚨 Si hay escape hatch activado, forzar código viejo
    if (typeof window !== 'undefined' && localStorage.getItem('forceOldCode') === 'true') {
        console.warn('🚨 FORCE OLD CODE activado - usando código original');
        return false;
    }

    // 🔧 Desarrollo: Permitir activación manual
    if (import.meta.env.DEV && typeof window !== 'undefined') {
        const manualOverride = localStorage.getItem(`enable_${flagName}`);
        if (manualOverride === 'true') {
            console.log(`🔧 DEV: Feature "${flagName}" activado manualmente`);
            return true;
        }
        if (manualOverride === 'false') {
            console.log(`🔧 DEV: Feature "${flagName}" desactivado manualmente`);
            return false;
        }
    }

    // 📊 Producción: Rollout gradual
    if (userId && ROLLOUT_PERCENTAGES[flagName] > 0) {
        const hash = userHashCode(userId);
        const percentage = ROLLOUT_PERCENTAGES[flagName];
        const enabled = hash < percentage;

        if (enabled) {
            console.log(`📊 Feature "${flagName}" habilitado (rollout ${percentage}%)`);
        }

        return enabled;
    }

    // 🎯 Default: Usar valor del flag global
    return FEATURE_FLAGS[flagName] || false;
};

/**
 * Hook React para verificar feature flags (re-render automático si cambia)
 * 
 * @param {string} flagName - Nombre del feature flag
 * @param {string} userId - ID del usuario (opcional)
 * @returns {boolean}
 */
export const useFeatureFlag = (flagName, userId = null) => {
    return isFeatureEnabled(flagName, userId);
};

/**
 * Activar una feature manualmente (solo desarrollo)
 * 
 * @example
 * // En consola del navegador:
 * enableFeature('USE_REFACTORED_CLIENTE_HOOKS')
 */
export const enableFeature = (flagName) => {
    if (!import.meta.env.DEV) {
        console.warn('⚠️ enableFeature solo funciona en desarrollo');
        return;
    }
    localStorage.setItem(`enable_${flagName}`, 'true');
    console.log(`✅ Feature "${flagName}" activado. Refresca la página.`);
};

/**
 * Desactivar una feature manualmente (solo desarrollo)
 * 
 * @example
 * // En consola del navegador:
 * disableFeature('USE_REFACTORED_CLIENTE_HOOKS')
 */
export const disableFeature = (flagName) => {
    if (!import.meta.env.DEV) {
        console.warn('⚠️ disableFeature solo funciona en desarrollo');
        return;
    }
    localStorage.setItem(`enable_${flagName}`, 'false');
    console.log(`❌ Feature "${flagName}" desactivado. Refresca la página.`);
};

/**
 * Activar escape hatch (volver a código viejo en emergencia)
 * 
 * @example
 * // En consola del navegador si algo falla:
 * activateEscapeHatch()
 */
export const activateEscapeHatch = () => {
    localStorage.setItem('forceOldCode', 'true');
    console.error('🚨 ESCAPE HATCH ACTIVADO - Refrescando página...');
    window.location.reload();
};

/**
 * Desactivar escape hatch
 */
export const deactivateEscapeHatch = () => {
    localStorage.removeItem('forceOldCode');
    console.log('✅ Escape hatch desactivado');
};

// 🎯 Exportar funciones para uso en consola del navegador
if (typeof window !== 'undefined') {
    window.enableFeature = enableFeature;
    window.disableFeature = disableFeature;
    window.activateEscapeHatch = activateEscapeHatch;
    window.deactivateEscapeHatch = deactivateEscapeHatch;
}
