/**
 * @file usePermissions.jsx
 * @description Hook optimizado para verificación de permisos
 * Usa memoización para evitar recálculos innecesarios
 */

import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';

export const usePermissions = () => {
    const { userPermissions } = useAuth();

    /**
     * Función memoizada para verificar permisos
     * Solo se recalcula cuando cambian los permisos del usuario
     */
    const can = useMemo(() => {
        /**
         * Verifica si el usuario actual tiene un permiso específico.
         * @param {string} module - El nombre del módulo (ej: 'clientes', 'viviendas').
         * @param {string} action - La acción a verificar (ej: 'crear', 'editar').
         * @returns {boolean} - Devuelve true si el usuario tiene el permiso, de lo contrario false.
         */
        return (module, action) => {
            if (!userPermissions) {
                return false; // Si no hay permisos cargados, no se permite nada.
            }

            // Verifica si el módulo y la acción existen en los permisos del usuario.
            const hasPermission = userPermissions[module]?.[action] === true;

            return hasPermission;
        };
    }, [userPermissions]);

    /**
     * Verifica múltiples permisos a la vez
     * @param {Array<{module: string, action: string}>} permissions 
     * @returns {boolean}
     */
    const canAll = useMemo(() => {
        return (permissions) => {
            if (!Array.isArray(permissions)) return false;
            return permissions.every(({ module, action }) => can(module, action));
        };
    }, [can]);

    /**
     * Verifica si tiene al menos uno de los permisos
     * @param {Array<{module: string, action: string}>} permissions 
     * @returns {boolean}
     */
    const canAny = useMemo(() => {
        return (permissions) => {
            if (!Array.isArray(permissions)) return false;
            return permissions.some(({ module, action }) => can(module, action));
        };
    }, [can]);

    /**
     * Obtiene todos los permisos de un módulo
     * @param {string} module 
     * @returns {Object|null}
     */
    const getModulePermissions = useMemo(() => {
        return (module) => {
            if (!userPermissions) return null;
            return userPermissions[module] || null;
        };
    }, [userPermissions]);

    return {
        can,
        canAll,
        canAny,
        getModulePermissions,
        hasPermissions: !!userPermissions
    };
};