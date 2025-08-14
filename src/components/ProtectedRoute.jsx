import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        // Si no hay un usuario conectado, redirige a la página de login
        return <Navigate to="/login" />;
    }

    // Si hay un usuario, muestra el contenido de la página solicitada
    return children;
};

export default ProtectedRoute;