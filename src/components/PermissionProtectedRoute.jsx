import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/auth/usePermissions';

const PermissionProtectedRoute = ({ module, action, children }) => {
    const { currentUser } = useAuth();
    const { can } = usePermissions();

    if (!currentUser) {
        // Si no está logueado, se va al login (esto es una doble seguridad)
        return <Navigate to="/login" />;
    }

    if (!can(module, action)) {
        // Si está logueado pero NO tiene el permiso, se va a la página de "No Autorizado"
        return <Navigate to="/unauthorized" />;
    }

    // Si tiene permiso, muestra la página
    return children;
};

export default PermissionProtectedRoute;