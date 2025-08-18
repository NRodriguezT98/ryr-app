import { useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';

export const usePermissions = () => {
    const { userPermissions } = useAuth();

    /**
     * Verifica si el usuario actual tiene un permiso específico.
     * @param {string} module - El nombre del módulo (ej: 'clientes', 'viviendas').
     * @param {string} action - La acción a verificar (ej: 'crear', 'editar').
     * @returns {boolean} - Devuelve true si el usuario tiene el permiso, de lo contrario false.
     */
    const can = useCallback((module, action) => {
        if (!userPermissions) {
            return false; // Si no hay permisos cargados, no se permite nada.
        }

        // Verifica si el módulo y la acción existen en los permisos del usuario.
        const hasPermission = userPermissions[module]?.[action] === true;

        return hasPermission;
    }, [userPermissions]);

    return { can };
};